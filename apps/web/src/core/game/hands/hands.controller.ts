import {
	CoreModule as ChessboardModule,
	PieceNotificationPayload
} from "@chess-d/chessboard";
import { ColorSide } from "@chess-d/shared";
import { map, Observable, share, switchMap } from "rxjs";
import { BufferGeometry, Vector3Like } from "three";
import { inject, singleton } from "tsyringe";

import { HandService } from "./hands.service";

@singleton()
export class HandController {
	public readonly pieceSelected$?: Observable<
		PieceNotificationPayload & {
			initialHandPosition: Vector3Like;
		}
	>;
	pieceDeselected$?: HandController["pieceSelected$"];
	pieceMoving$?: HandController["pieceSelected$"];

	constructor(
		@inject(ChessboardModule) private readonly _chessboard: ChessboardModule,
		@inject(HandService) private readonly _service: HandService
	) {
		this.pieceSelected$ =
			this._chessboard.pieces.controller.pieceSelected$?.pipe(
				map((payload) => ({
					...payload,
					initialHandPosition:
						this._service.hands[payload.piece.color]!.scene.position.clone()
				})),
				share()
			);

		this.pieceMoving$ = this.pieceSelected$?.pipe(
			switchMap((parentPayload) =>
				this._chessboard.pieces.controller.pieceMoving$!.pipe(
					map((payload) => ({
						...parentPayload,
						...payload
					}))
				)
			),
			share()
		);

		this.pieceDeselected$ = this.pieceSelected$?.pipe(
			switchMap((parentPayload) =>
				this._chessboard.pieces.controller.pieceDeselected$!.pipe(
					map((payload) => ({
						...parentPayload,
						...payload
					}))
				)
			),
			share()
		);
	}
}
