# web

## 0.1.2

### Patch Changes

- 400e648: # Logs

  ## refactor: handle hands + pieces moves
  - Compute bounding box on step (`@chess-d/rapier`)
  - Correct `@chess-d/chessboard` listen to piece transformations
  - Implement hand moves follow pieces logic

- def0642: # Logs

  ## refactor: 3D models integration
  - Add 3d chess piece models
    - Handle custom resources from @chess-d/chessboard
  - Add Hands model
    - Basic animation support
  - Add chessboard wrapper

- cf8d984: # 04-09-2026

  ## refactor: settings management
  - Sync settings inputs and core logic
  - Enhance chessboard `color` and `colorSide` management

- cd2eebf: # Logs

  ## refactor(chessboard): move out engine logic
  - Dissociate engine logic to the chessboard
  - Add new props to the piece journey fluxes
  - Move pieces by cells by default

- 6cc487a: # Logs
  - refactor: split web app
    - Split web app & create a `chessboard` package

- ee249a4: # 02-05-2025

  ## refactor(chessboard): dynamic resources update
  - Rename `resource` module to `resources`
    - Improve resources update
    - Add `setPieceGeometry` setter to update geometries at run time.

- fa21a4e: # Logs

  ## refactor: handle fix position
  - Enable any rigid-body type to be stored in `@chess-d/physics`
  - Add a possibility to control the position offset when moving a piece from `@chess-d/chessboard`
  - Handle pieces position reset when selecting a piece from `@chess-d/web`

- 614e686: # 02-22-2025

  ## fix(chessboard): resolve drop notification

- e842b3b: # 02-16-2026

  ## chore(deps): upgrade `@quick-threejs` resources
  - Upgrade `@quick-threejs/utils` to `^0.1.18`
  - Upgrade root `@changesets/cli` to `^2.28.1`
  - Upgrade root `packageManager` to `pnpm@10.19.0`

- dede040: # Logs

  ## refactor(web): handle de-selection notifications
  - Place pieces depending on the game logic
  - Rename resources from `square` to `cell` to make the diff from actual engine squares

  ## feat(web): handle piece placement
  - Rename all `cell` resources name to `square`
  - Add a new `SquareModel`
  - Implement `InstancedCell` model
    - replace `BoardModule` `mesh` & `cells` properties
  - Use `InstancedCell` to place pieces

  ## feat(web): handle engine moves
  - Rename `chess` resources to `engine`
  - Add a new `engineSquareToCoord` util
  - Mark possible moves

  ## feat(web): split pieceSelected$ observable
  - Create sub-observables based on PiecesController .pieceSelected$
    - pieceMoved$
    - pieceDeselected$

  ## refactor(web): correct groups disposal
  - `PiecesGroupModel` & `CellsMakerGroupModel` now create a new instance after disposal
  - Implement cells marker feature with `CellsMakerGroupModel`
  - move `coordToEngineSquare` method out of `EngineComponent`

- 766af20: # 03-30-2036

  ## refactor(web): frontend improvement
  - Colorful visual
  - Better controls accessibility
  - Code optimization and cleanness
  - Upgrade `quick-three` versions upgrade

- d346735: # 02-13-2025

  ## refactor(chessboard): promoted/dropped accessibility

  ### Description
  - Make promoted pieces `Subject` accessible
  - Make dropped pieces `Subject` accessible

- 5d56e8f: # Logs

  ## refactor(chessboard): now independent from `QuickThree`
  - Add new setup props
    - `proxyTarget`: The proxy target to use to listen to events
    - `observables`: The observables to use to listen to events.
    - `enableDebug`: To enable debug mode.

  ### Extra
  - Rapier package is now `@chess-d/rapier`

- a4ed7fd: # 03-31-2026

  ## chore(deps): upgrade chess.js version

- 25ac512: # Logs

  ## chore(deps): update `@quick-threejs`
  - Upgrade `@quick-threejs/reactive` to `^0.1.25`
    - Remove `GUI` & `Stats.js` integration
    - Optimize on-game reset resources disposition
  - Upgrade `@quick-threejs/utils` to `^0.1.15`
  - Minify `@chess-d/ai` bundle size

- 4578dc7: # 04-13-2026

  ## feat: sfx & chessboard physics enhancement
  - `@chess-d/rapier` now support `EventQueue` & `PhysicsHooks` updates
  - `@chess-d/chessboard` now provide piece drop speed from `EventQueue`.
  - `web app` Sound effects support

- 564d02b: # 01-29-2025

  ## refactor: implement web debugging
  - Add `stats-gl`
  - Add `tweakpane` & debug params options
  - Handle `@chess-d/chessboard` physics timestep
  - Handle world default state & reset actions

- 6c88cb8: # Logs

  ## refactor(chessboard): custom piece geometries
  - Add a 3rd param to the `setup` helper handling custom piece geometries
  - Multicast (**share**) all the `Observables`
  - Observable payload now provides the piece parent `InstancedMesh`
  - Drop native lights

- 6392358: # 02-02-2025

  ## refactor(chessboard): correct pieces `y` position

- Updated dependencies [2774a7d]
- Updated dependencies [400e648]
- Updated dependencies [6296af2]
- Updated dependencies [496a121]
- Updated dependencies [f7fa592]
- Updated dependencies [fa21a4e]
- Updated dependencies [766af20]
- Updated dependencies [5d56e8f]
- Updated dependencies [a4ed7fd]
- Updated dependencies [4578dc7]
- Updated dependencies [a4dc3f9]
  - @chess-d/rapier@0.0.1
  - @chess-d/shared@0.0.1

## 0.1.1

### Patch Changes

- 8d89ba7: # Logs

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

- Updated dependencies [abde6c5]
  - @chess-d/rapier-physics@0.1.0

## 0.1.0

### Minor Changes

- 95d9cf1: Base stable version with safe configs
