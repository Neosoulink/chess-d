---
"web": patch
---

# Logs

## feat(web): handle piece placement

- Rename all `cell` resources name to `square`
- Add a new `SquareModel`
- Implement `InstancedSquare` model
  - replace `BoardModule` `mesh` & `cells` properties
- Use `InstancedSquare` to place pieces

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
