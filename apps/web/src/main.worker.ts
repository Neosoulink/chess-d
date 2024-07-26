import "reflect-metadata";

import { launchApp } from "@quick-threejs/reactive/worker";

import { setupCoreModule } from "./core/core.util";

launchApp({
	onReady: (app) => setupCoreModule({ app })
});
