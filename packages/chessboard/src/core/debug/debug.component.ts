import { BufferGeometry, LineSegments, MeshBasicMaterial } from "three";
import { singleton } from "tsyringe";

@singleton()
export class DebugComponent {
	public readonly lines = new LineSegments(
		new BufferGeometry(),
		new MeshBasicMaterial({ color: 0xff40f0 })
	);
}
