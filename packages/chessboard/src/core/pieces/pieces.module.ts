import { inject, singleton } from "tsyringe";

import { PiecesService } from "./pieces.service";
import { PiecesController } from "./pieces.controller";
import { Subscription } from "rxjs";
import { ResourcesController } from "../resources/resources.controller";
import { BLACK, WHITE } from "chess.js";
import { ColorSide, ObservablePayload } from "@chess-d/shared";

@singleton()
export class PiecesModule {
	private _subscriptions: (Subscription | undefined)[] = [];

	constructor(
		@inject(PiecesController)
		private readonly _controller: PiecesController,
		@inject(ResourcesController)
		private readonly _resourcesController: ResourcesController,
		@inject(PiecesService) private readonly _service: PiecesService
	) {
		this._subscriptions.push(
			this._controller.pieceMoving$?.subscribe(
				this._service.handlePieceMoving.bind(this._service)
			),
			this._controller.pieceDeselected$?.subscribe(
				this._service.handlePieceDeselected.bind(this._service)
			),
			this._resourcesController.updateTypeGeometry$$.subscribe((value) => {
				[BLACK, WHITE].forEach((color) => {
					this._service.updateGroupGeometry(
						color as ColorSide,
						value.type,
						value.geometry
					);
				});
			}),
			this._controller.piecePromoted$?.subscribe(({ piece, toPiece }) =>
				this._service.promotePiece(piece, toPiece)
			),
			this._controller.pieceDropped$?.subscribe(
				this._service.dropPiece.bind(this._service)
			)
		);
	}

	public init() {
		this._service.reset();
	}

	public getPieceDeselected$$() {
		return this._controller.pieceDeselected$$;
	}

	public getPieceDropped$$() {
		return this._controller.pieceDropped$$;
	}

	public getPieceSelected$() {
		return this._controller.pieceSelected$;
	}

	public getPieceMoving$() {
		return this._controller.pieceMoving$;
	}

	public getPieceDeselected$() {
		return this._controller.pieceDeselected$;
	}

	public getPiecePromoted$() {
		return this._controller.piecePromoted$;
	}

	public getPieceDropped$() {
		return this._controller.pieceDropped$;
	}

	public getGroups() {
		return this._service.groups;
	}

	public getDroppedGroups() {
		return this._service.droppedGroups;
	}

	public getPieceByCoord(
		...props: Parameters<PiecesService["getPieceByCoord"]>
	) {
		return this._service.getPieceByCoord(...props);
	}

	public setPiecePosition(
		...props: Parameters<PiecesService["setPiecePosition"]>
	) {
		this._service.setPiecePosition(...props);
	}

	public setPieceCoord(...props: Parameters<PiecesService["setPieceCoord"]>) {
		this._service.setPieceCoord(...props);
	}

	public promotePiece(
		data: ObservablePayload<PiecesController["piecePromoted$"]>
	) {
		this._controller.piecePromoted$$.next(data);
	}

	public dropPiece(data: ObservablePayload<PiecesController["pieceDropped$"]>) {
		this._controller.pieceDropped$$?.next(data);
	}

	public reset(...props: Parameters<PiecesService["reset"]>) {
		this._service.reset(...props);
	}

	public clear(...props: Parameters<PiecesService["clear"]>) {
		this._service.clear(...props);
	}

	public updateGroupGeometry(
		...props: Parameters<PiecesService["updateGroupGeometry"]>
	) {
		return this._service.updateGroupGeometry(...props);
	}

	public updateGroupsGeometries() {
		return this._service.updateGroupsGeometries();
	}

	public dispose() {
		this._subscriptions.forEach((sub) => sub?.unsubscribe());
		this._subscriptions = [];
	}
}
