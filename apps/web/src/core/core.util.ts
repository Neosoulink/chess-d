import { container } from "tsyringe";
import { isObject } from "@quick-threejs/utils";

import { CoreModule } from "./core.module";
import { CorePropsModel } from "../common";

export const setupCoreModule = (props: CorePropsModel) => {
	if (!isObject(props.app))
		throw new Error("Unable to retrieve the application context.");

	container.register(CorePropsModel, { useValue: props });
	return container.resolve<CoreModule>(CoreModule);
};
