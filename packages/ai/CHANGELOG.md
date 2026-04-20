# @chess-d/ai

## 0.2.0

### Minor Changes

- 716d3c8: # Logs
  - feat(ai): init `ai` package

### Patch Changes

- 465d549: # 04-17-2026

  ## feat(web): hint feature support
  - Add hint sfx
  - handle hint feature button
  - Pause IA on game over

- f7fa592: # 04-14-2026

  ## feat: more ai players support
  - Backend & frontend AI players support
    - Stockfish
    - Google - Gemini
    - Anthropic - Claude
    - OpenAI - ChatGPT
  - Depth Support for local AI player
  - Resources & code improvement

- a4ed7fd: # 03-31-2026

  ## chore(deps): upgrade chess.js version

- 25ac512: # Logs

  ## chore(deps): update `@quick-threejs`
  - Upgrade `@quick-threejs/reactive` to `^0.1.25`
    - Remove `GUI` & `Stats.js` integration
    - Optimize on-game reset resources disposition
  - Upgrade `@quick-threejs/utils` to `^0.1.15`
  - Minify `@chess-d/ai` bundle size

- a4dc3f9: # 04-14-2026

  ## refactor: use chess-api stockfish
  - Drop Stockfish from the server & use chess-api REST
    - Deployment Server memory improvement
  - Add shared AI constants
