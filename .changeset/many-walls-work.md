---
"web": patch
---

# Logs

## refactor(web): correct groups disposal

- `PiecesGroupModel` & `CellsMakerGroupModel` now create a new instance after disposal
- Implement cells marker feature with `CellsMakerGroupModel`
- move `coordsToPgnMoveText` method out of `EngineComponent`
