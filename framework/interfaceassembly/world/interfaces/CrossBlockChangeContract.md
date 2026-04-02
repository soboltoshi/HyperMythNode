# CrossBlockChangeContract

## Purpose

A standard contract for one box requesting a change that affects another box.

## Owned By

InterfaceRegistryBox

## Consumed By

- BlockBuilderBox
- ArbiterBox
- WorldBuilderBox
- ArchivistBox

## Required Fields

- requesting_box
- owning_box
- affected_interface
- requested_change
- reason
- owner_participation

## Invariants

- owner participation is mandatory
- Arbiter is required when the two sides disagree
- Archivist records only the accepted result
