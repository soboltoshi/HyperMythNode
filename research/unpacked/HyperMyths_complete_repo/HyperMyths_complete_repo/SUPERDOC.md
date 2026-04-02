# HyperMyths SUPERDOC

## Goal

Turn the uploaded HyperMyths scaffolds into one clearer repo that:

1. runs locally first,
2. keeps the **session-state kernel** as the authority,
3. respects **Interface Assembly** block ownership,
4. stays aligned with **Firebase App Hosting** for deployment,
5. keeps **MYTHIV** as the finance router rather than the whole brand.

## Product loop implemented here

The first milestone loop is:

1. create a world,
2. index it in the directory,
3. open a session state,
4. create a prediction market,
5. queue a media job,
6. assign an agent task,
7. render the dashboard in the web app.

## Why this repo looks this way

The uploaded repo packs were strongest in three areas:

- **taxonomy**
- **architecture language**
- **modular naming**

They were weakest in:

- real data flow,
- authoritative state handling,
- actual UI wiring,
- Firebase App Hosting-ready Next.js implementation.

This repo fixes that by making `packages/core` and `packages/store` real working centers.

## Core law

The system should always be read as:

digital activity  
-> canonical session state  
-> interpretation layer  
-> media / market / game / report output

That is the permanent design rule for HyperMyths.
