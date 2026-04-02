# Implementation Order

## Phase 1 — Foundation
- install dependencies
- run the web app
- verify API health
- verify local JSON store creation

## Phase 2 — Core state
- harden session kernel transitions
- add expiry tick rules
- add replay protection keys
- add mutation audit trail

## Phase 3 — MYTHIV
- add order books or market models
- add position and quote contracts
- add settlement logic
- add index calculations

## Phase 4 — Media
- expand HashMedia job pipeline
- add artifact folders
- add report generation
- add clip / recap metadata

## Phase 5 — Agent Mesh
- add queue priorities
- add retries
- add workflow ownership
- add provider routing

## Phase 6 — Firebase
- swap filesystem persistence for Firestore behind the store boundary
- add Firebase Auth if needed
- add App Hosting environment and secret wiring
