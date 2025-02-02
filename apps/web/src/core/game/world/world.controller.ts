import { AppModule } from "@quick-threejs/reactive";
import { gsap } from "gsap";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { WorldService } from "./world.service";

@scoped(Lifecycle.ContainerScoped)
export class WorldController {
	public dayCycle$$ = new BehaviorSubject<{
		duration: number;
		progress?: number;
	}>({ duration: 60 * 3, progress: 0.05 });
	public introAnimation$$ = new BehaviorSubject<boolean>(true);
	public idleAnimation$$ = new BehaviorSubject<boolean>(true);

	public readonly dayCycle$: Observable<{
		now: number;
		deltaTime: number;
		elapsedTime: number;
		progress: number;
		normalizedProgress: number;
		hour: number;
		duration: number;
		totalDuration: number;
	}>;
	public readonly introAnimation$: Observable<number>;

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(WorldService) private readonly _service: WorldService
	) {
		this.dayCycle$ = this.dayCycle$$.pipe(
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

		this.introAnimation$ = this.introAnimation$$.pipe(
			switchMap(
				(intro) =>
					new Observable<number>((subscriber) => {
						const params = { progress: 0 };

						gsap
							.to(params, {
								duration: 1.5,
								progress: 1,
								onUpdate: () => subscriber.next(params.progress)
							})
							.then(() => {
								subscriber.next(params.progress);
								subscriber.complete();
							});
					})
			)
		);
	}
}
