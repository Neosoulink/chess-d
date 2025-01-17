import { inject, singleton } from "tsyringe";

import { ResourceService } from "./resource.service";
import { PieceType } from "@chess-d/shared";
import { BufferGeometry } from "three";
import { PIECES_GEOMETRIES_TOKEN } from "../../shared";

@singleton()
export class ResourceModule {
	constructor(
		@inject(ResourceService) private readonly _service: ResourceService,
		@inject(PIECES_GEOMETRIES_TOKEN)
		private readonly _pieceGeometries: Partial<
			Record<PieceType, BufferGeometry>
		>
	) {}

	public init() {
		Object.keys(this._pieceGeometries || {}).forEach((key) => {
			this._service.setGeometryByType(
				key as PieceType,
				this._pieceGeometries[key]
			);
		});
	}

	public getGeometryByType(
		...props: Parameters<ResourceService["getGeometryByType"]>
	) {
		return this._service.getGeometryByType(...props);
	}

	public dispose() {}
}
