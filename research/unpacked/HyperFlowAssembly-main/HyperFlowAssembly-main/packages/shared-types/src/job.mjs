export const JOB_STATES = [
  "draft",
  "queued",
  "planning",
  "generating",
  "assembling",
  "reviewable",
  "published",
  "hidden",
  "failed",
];

export const JOB_TRANSITIONS = {
  draft: ["queued"],
  queued: ["planning", "failed"],
  planning: ["generating", "failed"],
  generating: ["assembling", "failed"],
  assembling: ["reviewable", "failed"],
  reviewable: ["published", "hidden", "failed"],
  published: [],
  hidden: [],
  failed: [],
};
