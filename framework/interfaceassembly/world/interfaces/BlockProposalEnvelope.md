# BlockProposalEnvelope

## Purpose

A standard request shape for one block asking the world to add or revise a target.

## Owned By

InterfaceRegistryBox

## Consumed By

- BlockBuilderBox
- WorldBuilderBox
- ArchivistBox

## Required Fields

- requester
- target_name
- target_guess
- reason
- affected_boxes
- requested_interfaces
- requested_adapters

## Invariants

- the requester may describe another box but may not redefine it
- every cross-box effect must name the owning box
