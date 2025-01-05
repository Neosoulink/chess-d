---
"@chess-d/chessboard": patch
---

# Logs

## refactor(chessboard): custom piece geometries

- Add a 3rd param to the `setup` helper handling custom piece geometries
- Multicast (**share**) all the `Observables`
- Observable payload now provides the piece parent `InstancedMesh`
- Drop native lights
