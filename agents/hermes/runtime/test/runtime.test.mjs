import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { HermesRuntime } from "../src/runtime.mjs";

function makeTempRuntime() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hermes-runtime-"));
  const rolesDir = path.join(root, "roles");
  fs.mkdirSync(rolesDir, { recursive: true });
  fs.writeFileSync(path.join(rolesDir, "asimog.md"), "# ASIMOG\n");
  fs.writeFileSync(path.join(rolesDir, "interpreter.md"), "# Interpreter\n");
  const statePath = path.join(root, "state.json");
  return {
    runtime: new HermesRuntime({ statePath, rolesPath: rolesDir }),
    root
  };
}

test("creates tasks and updates statuses", () => {
  const { runtime } = makeTempRuntime();
  const task = runtime.createTask({
    role: "asimog",
    instruction: "review a new grievance"
  });

  assert.equal(task.status, "queued");
  assert.equal(runtime.getTasks().length, 1);

  const running = runtime.setTaskStatus(task.id, "running", "started");
  assert.equal(running.status, "running");
  assert.equal(running.events.at(-1).note, "started");
});

test("raises grievance and moves task to review", () => {
  const { runtime } = makeTempRuntime();
  const task = runtime.createTask({
    role: "asimog",
    instruction: "watch route quality"
  });

  const grievance = runtime.raiseGrievance(task.id, "boundary violation");
  assert.equal(grievance.taskId, task.id);

  const updated = runtime.getTasks().find((item) => item.id === task.id);
  assert.equal(updated.status, "review");
  assert.equal(runtime.getStatusSummary().grievances, 1);
});
