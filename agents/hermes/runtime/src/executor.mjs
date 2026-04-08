/**
 * TaskExecutor — polls the Hermes runtime for queued tasks, routes them
 * to registered handlers by role, and posts results back to the kernel.
 *
 * Agents run HERE (server-side), not inside VR. VR only sends intents
 * and receives results via the kernel snapshot.
 */

const DEFAULT_KERNEL_URL = process.env.KERNEL_BASE_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8787";

export class TaskExecutor {
  /**
   * @param {object} options
   * @param {import('./runtime.mjs').HermesRuntime} options.runtime
   * @param {number} [options.pollIntervalMs=3000]
   * @param {string} [options.kernelBaseUrl]
   */
  constructor({ runtime, pollIntervalMs = 3000, kernelBaseUrl }) {
    this.runtime = runtime;
    this.pollIntervalMs = pollIntervalMs;
    this.kernelBaseUrl = (kernelBaseUrl || DEFAULT_KERNEL_URL).replace(/\/+$/, "");
    this.handlers = new Map();
    this.timer = null;
    this.processing = false;
  }

  /**
   * Register an async handler for a given role.
   * Handler receives the task object and must return { result_type, data }.
   */
  registerHandler(role, handlerFn) {
    this.handlers.set(role, handlerFn);
  }

  /** Start the polling loop. */
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.#tick(), this.pollIntervalMs);
    process.stdout.write(
      `[executor] started — polling every ${this.pollIntervalMs}ms, ` +
      `handlers: [${[...this.handlers.keys()].join(", ")}]\n`
    );
  }

  /** Stop the polling loop. */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async #tick() {
    if (this.processing) return;
    this.processing = true;
    try {
      await this.#processNextTask();
    } catch (error) {
      process.stderr.write(`[executor] tick error: ${error.message}\n`);
    } finally {
      this.processing = false;
    }
  }

  async #processNextTask() {
    const task = this.runtime.getNextQueuedTask();
    if (!task) return;

    const handler = this.handlers.get(task.role);
    if (!handler) {
      // No handler for this role — leave it queued, don't block
      process.stderr.write(
        `[executor] no handler for role '${task.role}' (task ${task.id}), skipping\n`
      );
      return;
    }

    // Mark as running
    try {
      this.runtime.setTaskStatus(task.id, "running", "Executor picked up task");
    } catch (error) {
      process.stderr.write(`[executor] failed to mark task ${task.id} running: ${error.message}\n`);
      return;
    }

    process.stdout.write(
      `[executor] processing task ${task.id} role=${task.role}\n`
    );

    try {
      const result = await handler(task);
      const resultType = result?.result_type || "text";
      const resultData = result?.data ?? result ?? {};

      // Mark as done
      this.runtime.setTaskStatus(task.id, "done", `Completed by executor: ${resultType}`);

      // Post result to kernel
      await this.#postResultToKernel({
        task_id: task.id,
        role: task.role,
        result_type: resultType,
        data: resultData,
      });

      process.stdout.write(
        `[executor] task ${task.id} completed (${resultType})\n`
      );
    } catch (error) {
      process.stderr.write(
        `[executor] task ${task.id} failed: ${error.message}\n`
      );

      try {
        this.runtime.setTaskStatus(task.id, "failed", error.message);
      } catch {
        // Already logged
      }

      try {
        this.runtime.raiseGrievance(task.id, error.message);
      } catch {
        // Best-effort grievance
      }
    }
  }

  async #postResultToKernel(payload) {
    try {
      const response = await fetch(`${this.kernelBaseUrl}/command`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "agent.task.result",
          payload: {
            surface: "hermes-executor",
            intent: "agent-result",
            note: `Result from ${payload.role} executor`,
            ...payload,
          },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        process.stderr.write(
          `[executor] kernel rejected result for task ${payload.task_id}: ${response.status} ${text}\n`
        );
      }
    } catch (error) {
      process.stderr.write(
        `[executor] failed to post result to kernel: ${error.message}\n`
      );
    }
  }
}
