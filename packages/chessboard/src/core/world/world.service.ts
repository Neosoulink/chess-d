import { Group } from "three";
import { singleton } from "tsyringe";

@singleton()
export class WorldService {
	public readonly scene = new Group();
}
