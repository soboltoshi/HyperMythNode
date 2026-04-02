import { JOB_STATES, JOB_TRANSITIONS } from "../../shared-types/src/job.mjs";

export { JOB_STATES, JOB_TRANSITIONS };

export function canTransitionJob(fromState, toState) {
  return JOB_TRANSITIONS[fromState]?.includes(toState) ?? false;
}
