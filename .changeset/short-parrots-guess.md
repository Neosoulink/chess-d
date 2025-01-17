---
"@chess-d/chessboard": patch
"@chess-d/rapier": patch
---

# Logs

## refactor(chessboard): now independent from `QuickThree`

- Add new setup props
  - `proxyTarget`: The proxy target to use to listen to events
  - `observables`: The observables to use to listen to events.
  - `enableDebug`: To enable debug mode.

### Extra

- Rapier package is now `@chess-d/rapier`
