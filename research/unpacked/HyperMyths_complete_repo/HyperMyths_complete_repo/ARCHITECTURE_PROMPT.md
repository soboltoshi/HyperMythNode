# HyperMyths Architecture Prompt

Build HyperMyths as a deterministic session-state system.

## Non-negotiable rules

- HyperMyths is the whole universe.
- MYTHIV is the finance router inside HyperMyths.
- SessionKernel is the canonical writer of session state.
- WorldSpawn creates worlds.
- WorldDirectory indexes worlds.
- HashMedia queues and reports media jobs.
- AgentMesh owns task routing.
- Adapters never own truth.
- Firebase App Hosting is the deployment target.
- Next.js App Router is the app shape.
- Local-first persistence comes before cloud persistence.

## The system pipeline

digital activity  
-> protocol contracts  
-> session kernel  
-> interpretation / market / media logic  
-> UI and route handlers

## First milestone outcome

A user should be able to run the repo locally, open the dashboard, create worlds and markets through API routes, and see the updated state reflected in the web UI.
