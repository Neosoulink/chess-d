---
"web": patch
---

# 02-22-2025

## feat(web): ui actions implementation

- Update `Tailwind` to **v4**
- Add `@chrisoakman/chessboard2` (**+ TS types**)
- Add base Icons (from **kamijin-fanta**)
- Add core `Button` component
- Add move history GUI
  - Listen to moves and display `SAN`s
- Add actions GUI (forward, backard, hint, save, and current turn)
- Add mini map GUI
- Engine now listen to **undo** or **redo** notifications
- Handle piece promotion
