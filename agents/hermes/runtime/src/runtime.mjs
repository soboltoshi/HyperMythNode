import fs from "node:fs";
import path from "node:path";
import { readJson, writeJson } from "./state-store.mjs";

const DEFAULT_STATE = {
  version: 1,
  nextId: 1,
  tasks: [],
  grievances: []
};

const VALID_STATUSES = new Set(["queued", "running", "review", "done", "failed"]);

function nowIso() {
  return new Date().toISOString();
}

function normalizeRole(fileName) {
  return fileName.replace(/\.md$/i, "");
}

export class HermesRuntime {
  constructor({ statePath, rolesPath }) {
    this.statePath = statePath;
    this.rolesPath = rolesPath;
    this.state = readJson(this.statePath, DEFAULT_STATE);
    this.roles = this.#loadRoles();
    this.#normalizeState();
  }

  #normalizeState() {
    if (!this.state || typeof this.state !== "object") {
      this.state = { ...DEFAULT_STATE };
    }
    if (!Array.isArray(this.state.tasks)) {
      this.state.tasks = [];
    }
    if (!Array.isArray(this.state.grievances)) {
      this.state.grievances = [];
    }
    if (!Number.isInteger(this.state.nextId) || this.state.nextId < 1) {
      this.state.nextId = this.state.tasks.length + 1;
    }
  }

  #loadRoles() {
    if (!fs.existsSync(this.rolesPath)) {
      return [];
    }

    const files = fs.readdirSync(this.rolesPath).filter((file) => file.endsWith(".md"));
    return files.map((file) => {
      const role = normalizeRole(file);
      const body = fs.readFileSync(path.join(this.rolesPath, file), "utf8");
      return {
        role,
        source: file,
        summary: body.split(/\r?\n/).find((line) => line.trim().length > 0) ?? ""
      };
    });
  }

  #persist() {
    writeJson(this.statePath, this.state);
  }

  getRoles() {
    return this.roles;
  }

  getTasks() {
    return this.state.tasks;
  }

  getStatusSummary() {
    const counts = {
      queued: 0,
      running: 0,
      review: 0,
      done: 0,
      failed: 0
    };

    for (const task of this.state.tasks) {
      if (Object.prototype.hasOwnProperty.call(counts, task.status)) {
        counts[task.status] += 1;
      }
    }

    return {
      counts,
      grievances: this.state.grievances.length,
      totalTasks: this.state.tasks.length
    };
  }

  /** Return the oldest queued task, or null if none. */
  getNextQueuedTask() {
    return this.state.tasks.find((task) => task.status === "queued") ?? null;
  }

  createTask({ role, instruction, metadata = {} }) {
    const normalizedRole = String(role || "").trim();
    const normalizedInstruction = String(instruction || "").trim();

    if (normalizedRole.length === 0) {
      throw new Error("role is required");
    }
    if (normalizedInstruction.length === 0) {
      throw new Error("instruction is required");
    }

    const task = {
      id: String(this.state.nextId++),
      role: normalizedRole,
      instruction: normalizedInstruction,
      status: "queued",
      metadata,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      events: [
        {
          timestamp: nowIso(),
          status: "queued",
          note: "Task created"
        }
      ]
    };

    this.state.tasks.push(task);
    this.#persist();
    return task;
  }

  setTaskStatus(taskId, status, note = "") {
    const normalizedStatus = String(status || "").trim().toLowerCase();
    if (!VALID_STATUSES.has(normalizedStatus)) {
      throw new Error(`invalid status '${status}'`);
    }

    const task = this.state.tasks.find((candidate) => candidate.id === String(taskId));
    if (!task) {
      throw new Error(`task '${taskId}' not found`);
    }

    task.status = normalizedStatus;
    task.updatedAt = nowIso();
    task.events.push({
      timestamp: nowIso(),
      status: normalizedStatus,
      note: String(note || "")
    });
    this.#persist();
    return task;
  }

  raiseGrievance(taskId, grievance) {
    const task = this.state.tasks.find((candidate) => candidate.id === String(taskId));
    if (!task) {
      throw new Error(`task '${taskId}' not found`);
    }

    const entry = {
      id: `${task.id}-${this.state.grievances.length + 1}`,
      taskId: task.id,
      role: task.role,
      grievance: String(grievance || "unspecified"),
      createdAt: nowIso(),
      resolution: null
    };

    this.state.grievances.push(entry);
    this.setTaskStatus(task.id, "review", "Grievance raised for ASIMOG review");
    return entry;
  }
}
