import { Collider } from "@dimforge/rapier3d-compat";
import { Physics } from "@chess-d/rapier";
import { share, Subject } from "rxjs";
import { Vector2Like } from "three";
import { inject, singleton } from "tsyringe";
import { ChessboardService } from "./chessboard.service";

@singleton()
export class ChessboardController {
	public readonly pieceCollidedBoard$$ = new Subject<{
		/** Whether the collision started. */
		started: boolean;

		/** The first collider involved in the collision. */
		collider1: Collider;

		/** The second collider involved in the collision. */
		collider2: Collider;

		/** |linvel| of the piece rigid-body (m/s). */
		pieceSpeed: number;

		/** |v·n| using linear velocity and contact normal (closing speed along the normal). */
		pieceImpactSpeed: number;
	}>();
	public readonly update$$ = new Subject<{
		/** The cursor position. */
		cursor: Vector2Like;

		/** The timestep. */
		timestep: number;
	}>();

	public readonly pieceCollidedBoard$ = this.pieceCollidedBoard$$.pipe(share());

	constructor(
		@inject(Physics) private readonly _physics: Physics,
		@inject(ChessboardService) private readonly _service: ChessboardService
	) {
		this.update$$.subscribe(() => {
			this._service.physicsEventQueue.drainCollisionEvents(
				(handle1, handle2, started) => {
					const collider1 = this._physics.world.getCollider(handle1);
					const collider2 = this._physics.world.getCollider(handle2);
					const userData1 = collider1.parent()?.userData as any;
					const userData2 = collider2.parent()?.userData as any;

					const getContactInfo = (
						boardCollider: Collider,
						pieceCollider: Collider
					) => {
						const pieceBody = pieceCollider.parent();
						const lv = pieceBody?.linvel() ?? { x: 0, y: 0, z: 0 };
						const pieceSpeed = Math.sqrt(
							lv.x * lv.x + lv.y * lv.y + lv.z * lv.z
						);

						let impactSum = 0;
						let impactCount = 0;

						this._physics.world.contactPair(
							boardCollider,
							pieceCollider,
							(manifold) => {
								const n = manifold.normal();
								impactSum += Math.abs(lv.x * n.x + lv.y * n.y + lv.z * n.z);
								impactCount++;
							}
						);

						const pieceImpactSpeed =
							impactCount > 0 ? impactSum / impactCount : 0;

						return {
							pieceSpeed,
							pieceImpactSpeed
						};
					};

					if (userData1?.type !== "board" || userData2?.type !== "piece")
						return;

					const contact = getContactInfo(collider1, collider2);
					this.pieceCollidedBoard$$.next({
						started,
						collider1,
						collider2,
						...contact
					});
				}
			);
		});
	}
}
