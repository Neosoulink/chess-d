import { container } from "tsyringe";
import { isObject } from "@quick-threejs/utils";
import { AppModule } from "@quick-threejs/reactive";

import { CoreModule } from "./core.module";

export const setupCoreModule = (app: AppModule) => {
	if (!isObject(app))
		throw new Error("Unable to retrieve the application context.");

	container.register(AppModule, { useValue: app });
	return container.resolve<CoreModule>(CoreModule);
};
