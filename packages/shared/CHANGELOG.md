# @chess-d/shared

## 0.0.1

### Patch Changes

- 6296af2: # Logs
  - feat(shared): init `@chess-d/shared` package
    - Move out most shared resources from `@chess-d/chessboard`

- 496a121: # Logs

  ## feat: integrate `api` package into `shared`
  - Drop `@chess-d/api` & implement it resources into `@chess-d/shared`
  - Use `tsup` to build `@chess-d/shared` (`esm` &`cjs`) support
  - Rename `nestjs` ts-config to `server.json`

- f7fa592: # 04-14-2026

  ## feat: more ai players support
  - Backend & frontend AI players support
    - Stockfish
    - Google - Gemini
    - Anthropic - Claude
    - OpenAI - ChatGPT
  - Depth Support for local AI player
  - Resources & code improvement

- 766af20: # 03-30-2036

  ## refactor(web): frontend improvement
  - Colorful visual
  - Better controls accessibility
  - Code optimization and cleanness
  - Upgrade `quick-three` versions upgrade

- a4ed7fd: # 03-31-2026

  ## chore(deps): upgrade chess.js version

- a4dc3f9: # 04-14-2026

  ## refactor: use chess-api stockfish
  - Drop Stockfish from the server & use chess-api REST
    - Deployment Server memory improvement
  - Add shared AI constants
