# ReleaseGateContract

## Purpose

A standard review contract for deciding whether the repo is public-ready.

## Owned By

InterfaceRegistryBox

## Consumed By

- PublicReadinessBox
- WorldBuilderBox
- ArchivistBox

## Required Fields

- scope
- blockers
- required_docs
- registry_check
- merkle_check
- release_recommendation

## Invariants

- public release cannot skip missing boundary records
- readiness is about legibility, not only completeness
