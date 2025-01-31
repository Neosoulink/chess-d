import { AppModule } from "@quick-threejs/reactive";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { WorldService } from "./world.service";

@scoped(Lifecycle.ContainerScoped)
export class WorldController {
	public dayCycle$$ = new BehaviorSubject<{
		duration: number;
		progress?: number;
	}>({ duration: 10, progress: 0 });

	public readonly dayNightCycle$: Observable<{
		now: number;
		deltaTime: number;
		elapsedTime: number;
		progress: number;
		normalizedProgress: number;
		hour: number;
		duration: number;
		totalDuration: number;
	}>;

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(WorldService) private readonly _service: WorldService
	) {
		this.dayNightCycle$ = this.dayCycle$$.pipe(
			switchMap(({ duration, progress: _baseProgress }) => {
				const totalDuration = duration * 1000;
				const initialTime = Date.now();
				const baseProgress = Number(_baseProgress) || 0;

				let currentTime = initialTime;

				return this._app.timer.step$().pipe(
					map(() => {
						const now = Date.now();
						const deltaTime = now - currentTime;
						const elapsedTime = now - initialTime;
						const progress =
							(elapsedTime + deltaTime) / totalDuration + baseProgress;
						const normalizedProgress = progress % 1;
						const hour = normalizedProgress * 24;

						currentTime = now;

						return {
							now,
							deltaTime,
							elapsedTime,
							progress,
							normalizedProgress,
							hour,
							duration,
							totalDuration
						};
					})
				);
			})
		);
	}
}
