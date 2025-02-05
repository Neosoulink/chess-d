import { AppModule } from "@quick-threejs/reactive";
import { gsap } from "gsap";
import {
	BehaviorSubject,
	filter,
	map,
	merge,
	Observable,
	switchMap,
	takeUntil
} from "rxjs";
import { inject, Lifecycle, scoped } from "tsyringe";

import { GameController } from "../game.controller";
@scoped(Lifecycle.ContainerScoped)
export class WorldController {
	public readonly dayCycle$$ = new BehaviorSubject<{
		duration: number;
		progress?: number;
	}>({ duration: 10, progress: 0.05 });

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
	public readonly idleAnimation$: Observable<number>;

	constructor(
		@inject(AppModule) private readonly _app: AppModule,
		@inject(GameController) private readonly _gameController: GameController
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

		this.introAnimation$ = this._gameController.state$.pipe(
			filter((state) => state === "playing"),
			switchMap(
				() =>
					new Observable<number>((subscriber) => {
						const params = { progress: 0 };

						gsap
							.to(params, {
								duration: 2,
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

		this.idleAnimation$ = this._gameController.state$.pipe(
			filter((state) => state === "idle"),
			switchMap(
				() =>
					new Observable<number>((subscriber) => {
						const params = { progress: 0 };

						gsap.to(params, {
							duration: 10,
							progress: 1,
							repeat: -1,
							onUpdate: () => subscriber.next(params.progress)
						});
					})
			),
			takeUntil(
				merge(
					this._gameController.reset$,
					this._gameController.state$.pipe(filter((state) => state !== "idle"))
				)
			)
		);
	}
}
