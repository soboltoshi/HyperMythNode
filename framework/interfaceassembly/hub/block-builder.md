# Block Builder

**What it is:** The scoped assembly worker for a new block, repo, or feature.

## What it does

- reads the world first
- defines local role and dependencies
- reports what the target needs
- escalates boundary issues instead of silently crossing them

## When to use it

Use this when a request introduces a new component, GitHub repo, feature family, or boundary question.

## Limits

- one target at a time
- no direct mutation of another box
- no final authority over classification
