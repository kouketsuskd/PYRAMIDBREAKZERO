# DAYBREAK LIV changes

- Phase 4 (HP 1,200,000 to 700,001): legacy extra attacks 71-80 disabled.
- Phase 4 bullet cap reduced to 48 and enemy-turn duration capped at 8.6 seconds.
- Phase 5 begins at HP 700,000, including phase display and boss appearance from the existing LII layer.
- Phase 5 exclusive attacks 81-88 were rebuilt as lightweight non-recursive patterns.
- Phase 5 bullet cap set to 60; particles/trails are capped in phases 4-5.
- Extra phase-5 attacks cannot start within 700ms of another extra pattern or while more than 34 bullets exist.
- Pattern 88 no longer recursively starts multiple large patterns.
