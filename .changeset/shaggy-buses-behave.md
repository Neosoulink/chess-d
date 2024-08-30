---
"web": patch
---

# Logs

## refactor(web): handle piece drop from piece group

- Move the `dropPiece` handler to `PiecesGroupModel`
  - Handle `PiecesGroupModel` count update
  - Handle `PieceModel` deletion
- `PiecesGroupModel` update PieceModes
- Update `PiecesModel` composition on set coords
  - Update physics rotation

## refactor(web): implement physics debug

- Move out of the core the `Physics` helper
  - Register it in the dependency container
- Add debug module
  - Implement physics debug
- Add new turbo env to the dev process
  - use **vite** `import.meta.env?.DEV` env as debug mode checker

## feat(web): use `PhysicsProperties` to position the board

- Add `@chess-d/rapier-physics`
- Add `physicsBody` property to chess-board component

## feat(web): handle piece dropping

## refactor(web): make `PieceModel` independent from board

## feat(web): implement pieces initializers

## feat(web): set base web architecture

    - Initialize world module
    - Initialize game module
    - Initialize chess board module
    - initialize core module
