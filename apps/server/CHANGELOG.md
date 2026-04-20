# api

## 0.1.2

### Patch Changes

- f7fa592: # 04-14-2026

  ## feat: more ai players support
  - Backend & frontend AI players support
    - Stockfish
    - Google - Gemini
    - Anthropic - Claude
    - OpenAI - ChatGPT
  - Depth Support for local AI player
  - Resources & code improvement

- 8e4b707: # 03-31-2026

  ## feat: handle multiplayer chat
  - Move multiplayer server under `/rooms` websocket sub-path
  - Implement multiplayer emoting & message
  - Rename `Human` game mode to `Multiplayer`

- a4ed7fd: # 03-31-2026

  ## chore(deps): upgrade chess.js version

- a4dc3f9: # 04-14-2026

  ## refactor: use chess-api stockfish
  - Drop Stockfish from the server & use chess-api REST
    - Deployment Server memory improvement
  - Add shared AI constants

- Updated dependencies [6296af2]
- Updated dependencies [496a121]
- Updated dependencies [f7fa592]
- Updated dependencies [766af20]
- Updated dependencies [a4ed7fd]
- Updated dependencies [a4dc3f9]
  - @chess-d/shared@0.0.1

## 0.1.1

### Patch Changes

- 5cd1334: # Logs

  ## Init base server resources
  - Initialize `graphql` code first.
  - Initialize `webSocket` support.
    - Use `WS` library
  - @chess-d/api@0.1.0
  - feat(api): init base resources
    - Add base directives
    - Add base plugins
    - Add base scalars

## 0.1.0

### Minor Changes

- 95d9cf1: Base stable version with safe configs

### Patch Changes

- Updated dependencies [95d9cf1]
  - @chess-d/api@0.1.0
