---
"@chess-d/chessboard": patch
---

# Logs

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
