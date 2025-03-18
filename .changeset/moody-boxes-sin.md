---
"web": patch
---

# 03-12-25

## feat(web): implement state saving

- Replace store `fen` with `initialState` object
- Add state-saving logic
  - Implement save & load state option
  - Add save & load UI
- Engine module reset now accept **redo moves** and **moves history**
- Add main menu store toggle action
- Remove main-menu backdrop blur
