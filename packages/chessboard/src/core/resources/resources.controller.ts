import { PieceType } from "@chess-d/shared";
import { Subject } from "rxjs";
import { BufferGeometry } from "three";
import { Lifecycle, scoped } from "tsyringe";

@scoped(Lifecycle.ContainerScoped)
export class ResourcesController {
	public readonly updateTypeGeometry$$ = new Subject<{
		type: PieceType;
		geometry: BufferGeometry;
	}>();
}
