# Architecture

## Goal

Build a **desktop-first private superbrain** with three operator surfaces:

1. CLI for scripts and automation
2. TUI for fast local operations
3. Web GUI for richer visual control

## Why this split

A terminal can be:

- a GUI app that hosts a shell
- or a text-based app that looks and behaves like a GUI inside the terminal

For this reason, the super assembly ships both:

- `superbrain-cli` for command-based control
- `superbrain-tui` for live local oversight
- `apps/webgui` for a richer browser control surface

## Core design rule

The browser is **not** the brain.
The Rust runtime is the brain.

The web app and TUI are operator surfaces over local intelligence.

## Future Solana services

Add later:

- RPC health service
- signer abstraction
- governance program adapter
- compute quote engine
- attestation and verifiable build pipeline
- local Surfpool integration
