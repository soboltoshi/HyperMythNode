
# BLOCK CODING RULES

1. Build one block at a time.
2. No block may directly mutate another block's internals.
3. Every block must declare:
   - inputs
   - outputs
   - interfaces
   - adapters
   - state owner
4. Keep browser code non-canonical.
5. Build local-first before cloud-first.
6. Do not add vendors without adapter files.
7. Do not increase adapter count above 69 in this starter without a proposal.
8. VR-facing code must route action requests through the VR/Desktop bridge.
9. Wallet and crypto control stay on the desktop agent side.
10. ASIMOG signs off on box births, adapter births, and governance-sensitive migrations.
