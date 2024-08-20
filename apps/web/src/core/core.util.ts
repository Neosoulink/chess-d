import { container } from "tsyringe";
import { isObject } from "@quick-threejs/utils";
import { AppModule } from "@quick-threejs/reactive";
import { Physics, RapierPhysics } from "@chess-d/rapier-physics";

import { CoreModule } from "./core.module";

export const setupCoreModule = async (app: AppModule) => {
	if (!isObject(app))
		throw new Error("Unable to retrieve the application context.");

	container.register(AppModule, { useValue: app });
	container.register(Physics, { useValue: await RapierPhysics() });

	return container.resolve<CoreModule>(CoreModule);
};
