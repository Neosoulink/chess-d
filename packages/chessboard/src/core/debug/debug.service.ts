import { Physics } from "@chess-d/rapier";
import {
	BufferAttribute,
	BufferGeometry,
	LineSegments,
	MeshBasicMaterial
} from "three";
import { singleton } from "tsyringe";

@singleton()
export class DebugService {
	public enabled = false;

	public readonly lines = new LineSegments(
		new BufferGeometry(),
		new MeshBasicMaterial({ color: 0x05c608 })
	);

	handlePhysicsDebugRendered(
		buffers: InstanceType<Physics["rapier"]["DebugRenderBuffers"]>
	) {
		this.lines.geometry.setAttribute(
			"position",
			new BufferAttribute(buffers.vertices, 3)
		);
		this.lines.geometry.setAttribute(
			"color",
			new BufferAttribute(buffers.colors, 4)
		);
	}
}
