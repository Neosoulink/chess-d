import "reflect-metadata";
import { Scene } from "three";

import { singleton } from "tsyringe";

@singleton()
export class GameComponent {
	scene!: Scene;

	constructor() {}
}
