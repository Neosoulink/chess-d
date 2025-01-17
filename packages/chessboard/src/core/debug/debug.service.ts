import { BufferGeometry, LineSegments, MeshBasicMaterial } from "three";
import { singleton } from "tsyringe";

@singleton()
export class DebugService {
	public enabled = false;

	public readonly lines = new LineSegments(
		new BufferGeometry(),
		new MeshBasicMaterial({ color: 0x05c608 })
	);
}
