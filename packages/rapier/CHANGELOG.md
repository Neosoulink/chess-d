# @chess-d/rapier-physics

## 0.0.1

### Patch Changes

- 2774a7d: # Logs

  ## refactor(rapier-physics): physics data to object
  - Object passed to the physics world now receive physics properties
  - Solve `undefined` body into the step method

- 400e648: # Logs

  ## refactor: handle hands + pieces moves
  - Compute bounding box on step (`@chess-d/rapier`)
  - Correct `@chess-d/chessboard` listen to piece transformations
  - Implement hand moves follow pieces logic

- fa21a4e: # Logs

  ## refactor: handle fix position
  - Enable any rigid-body type to be stored in `@chess-d/physics`
  - Add a possibility to control the position offset when moving a piece from `@chess-d/chessboard`
  - Handle pieces position reset when selecting a piece from `@chess-d/web`

- 766af20: # 03-30-2036

  ## refactor(web): frontend improvement
  - Colorful visual
  - Better controls accessibility
  - Code optimization and cleanness
  - Upgrade `quick-three` versions upgrade

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

- 4578dc7: # 04-13-2026

  ## feat: sfx & chessboard physics enhancement
  - `@chess-d/rapier` now support `EventQueue` & `PhysicsHooks` updates
  - `@chess-d/chessboard` now provide piece drop speed from `EventQueue`.
  - `web app` Sound effects support

## 0.1.0

### Minor Changes

- abde6c5: # Logs

  ## refactor: implement force bounding-box usage
  - Use `Object3D.userData` to pass `useBoundingBox`, forcing **bounding-box** usage

  ## feat(rapier-physics): base rapier physics integration
  - Use `ThreeJS` RapierPhysics addon as base.
