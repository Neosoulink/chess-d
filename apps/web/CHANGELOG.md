# web

## 0.1.0

### Minor Changes

- 6cc487a: # Logs
  - refactor: split web app
    - Split web app & create a `chessboard` package

### Patch Changes

- bf45201: # 02-17-2026

  ## refactor(web): enhance debug management
  - Remove debug duplication from `DebugService` & enhance `DEBUG_OPTIONS` constant
  - Make Tweakpane UI scrollable

- afe84d5: # 02-28-2025

  ## feat(web): handle build resources
  - Configure `rollupOptions` to compile all the needed workers

- 400e648: # Logs

  ## refactor: handle hands + pieces moves
  - Compute bounding box on step (`@chess-d/rapier`)
  - Correct `@chess-d/chessboard` listen to piece transformations
  - Implement hand moves follow pieces logic

- 5e7570e: # 02-22-2025

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

- def0642: # Logs

  ## refactor: 3D models integration
  - Add 3d chess piece models
    - Handle custom resources from @chess-d/chessboard
  - Add Hands model
    - Basic animation support
  - Add chessboard wrapper

- c773d4d: # 01-31-2025

  ## feat(web): hand sun animation

  ### Description
  - Add world day-night cycle observable
  - Animate the lights & environments based on the day/night cycles

- cf8d984: # 04-09-2026

  ## refactor: settings management
  - Sync settings inputs and core logic
  - Enhance chessboard `color` and `colorSide` management

- 843a240: # 04-16-2026

  ## feat(web): game status pop-up
  - Implement basic game status pop-up
    - Appear on game-over
  - fix positive color theme
  - Improve overview controls & texts
  - Improve states messages

- 5944a54: # Logs
  - feat: init web react app & upgrade quick-three

- 465d549: # 04-17-2026

  ## feat(web): hint feature support
  - Add hint sfx
  - handle hint feature button
  - Pause IA on game over

- c2b29ff: # 02-28-2025

  ## feat(web): enhance base UI/UX
  - Add new Icons
  - Enhance the modal component
  - Redesign the **MainMenu**
    - Add possibility to update pieces positions
  - Redesign the home page

- f7fa592: # 04-14-2026

  ## feat: more ai players support
  - Backend & frontend AI players support
    - Stockfish
    - Google - Gemini
    - Anthropic - Claude
    - OpenAI - ChatGPT
  - Depth Support for local AI player
  - Resources & code improvement

- fa21a4e: # Logs

  ## refactor: handle fix position
  - Enable any rigid-body type to be stored in `@chess-d/physics`
  - Add a possibility to control the position offset when moving a piece from `@chess-d/chessboard`
  - Handle pieces position reset when selecting a piece from `@chess-d/web`

- a6cc143: # 02-16-2026

  ## refactor(web): improves default lightning
  - Increase default sun intensity
  - Add sun reflection directional light
  - Increase sun propagation ambient light
  - Drop day/night cycle service methods

- 3f5ded6: # 02-01-2025

  ## feat(web): add board squares hints
  - Add a default Helvetica font
  - Display square hints

- 8e4b707: # 03-31-2026

  ## feat: handle multiplayer chat
  - Move multiplayer server under `/rooms` websocket sub-path
  - Implement multiplayer emoting & message
  - Rename `Human` game mode to `Multiplayer`

- 4ff6e8e: # 02-02-2025

  ## feat(web): handle intro animation

- e842b3b: # 02-16-2026

  ## chore(deps): upgrade `@quick-threejs` resources
  - Upgrade `@quick-threejs/utils` to `^0.1.18`
  - Upgrade root `@changesets/cli` to `^2.28.1`
  - Upgrade root `packageManager` to `pnpm@10.19.0`

- 766af20: # 03-30-2036

  ## refactor(web): frontend improvement
  - Colorful visual
  - Better controls accessibility
  - Code optimization and cleanness
  - Upgrade `quick-three` versions upgrade

- 88057da: # 03-12-25

  ## feat(web): implement state saving
  - Replace store `fen` with `initialState` object
  - Add state-saving logic
    - Implement save & load state option
    - Add save & load UI
  - Engine module reset now accept **redo moves** and **moves history**
  - Add main menu store toggle action
  - Remove main-menu backdrop blur

- f67f1d4: # 10-16-2026

  ## feat(web): go to move implementation

- c96bfbe: # 03-03-2026

  ## feat(web): world map env-map support
  - Add world map configs
    - Add default env maps
    - Preload env maps
  - Move code logics to appropriate places

- 0bfbcc8: # 02-05-2025

  ## refactor(web): handle game states

  ### Description
  - Improve the main thread by listening to the experience state
  - Make the experience available at the root of the router
  - Update chessboard geometries on resources loaded
  - Game experience constructed on app-ready

- a4ed7fd: # 03-31-2026

  ## chore(deps): upgrade chess.js version

- 48b0273: # 03-30-2026

  ## refactor(web): icons improvement

- 77eb57a: # 02-13-2025

  ## refactor(web) handle pages loads
  - Upgrade `@quick-threejs` resources
  - Correct modules hierarchy
  - Drop world states logic and use reset
  - Improve UI loader behavior

- d1f5b26: # 04-07-2026

  ## feat(web): setting management support
  - Enhance default setting params
  - Add default wood texture
  - Update default env map path
    - Set setting options
  - Add core setting module
  - Synch settings theme
  - Enhance code logic and file locations

- 25ac512: # Logs

  ## chore(deps): update `@quick-threejs`
  - Upgrade `@quick-threejs/reactive` to `^0.1.25`
    - Remove `GUI` & `Stats.js` integration
    - Optimize on-game reset resources disposition
  - Upgrade `@quick-threejs/utils` to `^0.1.15`
  - Minify `@chess-d/ai` bundle size

- 70af970: # 03-02-2025

  ## chore(web): configure host `env`

- 4578dc7: # 04-13-2026

  ## feat: sfx & chessboard physics enhancement
  - `@chess-d/rapier` now support `EventQueue` & `PhysicsHooks` updates
  - `@chess-d/chessboard` now provide piece drop speed from `EventQueue`.
  - `web app` Sound effects support

- a4dc3f9: # 04-14-2026

  ## refactor: use chess-api stockfish
  - Drop Stockfish from the server & use chess-api REST
    - Deployment Server memory improvement
  - Add shared AI constants

- 564d02b: # 01-29-2025

  ## refactor: implement web debugging
  - Add `stats-gl`
  - Add `tweakpane` & debug params options
  - Handle `@chess-d/chessboard` physics timestep
  - Handle world default state & reset actions

- a5107c5: # 03-31-2026

  ## feat(web): message & emote chat support
  - Bottom left chat support (for emotes & messages)
  - Clean code & optimization

- Updated dependencies [400e648]
- Updated dependencies [def0642]
- Updated dependencies [cf8d984]
- Updated dependencies [6296af2]
- Updated dependencies [496a121]
- Updated dependencies [cd2eebf]
- Updated dependencies [6cc487a]
- Updated dependencies [465d549]
- Updated dependencies [ee249a4]
- Updated dependencies [f7fa592]
- Updated dependencies [fa21a4e]
- Updated dependencies [614e686]
- Updated dependencies [e842b3b]
- Updated dependencies [dede040]
- Updated dependencies [766af20]
- Updated dependencies [d346735]
- Updated dependencies [5d56e8f]
- Updated dependencies [a4ed7fd]
- Updated dependencies [25ac512]
- Updated dependencies [4578dc7]
- Updated dependencies [a4dc3f9]
- Updated dependencies [564d02b]
- Updated dependencies [716d3c8]
- Updated dependencies [6c88cb8]
- Updated dependencies [6392358]
  - @chess-d/chessboard@0.1.2
  - @chess-d/shared@0.0.1
  - @chess-d/ai@0.2.0
