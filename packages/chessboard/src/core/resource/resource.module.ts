import { inject, singleton } from "tsyringe";
import { AppModule, Module } from "@quick-threejs/reactive";

import { ResourceComponent } from "./resource.component";
import { PieceType } from "@chess-d/shared";
import { BufferGeometry } from "three";

@singleton()
export class ResourceModule implements Module {
	constructor(
		@inject(AppModule) private readonly appModule: AppModule,
		@inject(ResourceComponent) private readonly component: ResourceComponent,
		@inject("PIECE_GEOMETRIES")
		private readonly _pieceGeometries: Partial<
			Record<PieceType, BufferGeometry>
		>
	) {}

	public init() {
		Object.keys(this._pieceGeometries || {}).forEach((key) => {
			this.component.setGeometryByType(
				key as PieceType,
				this._pieceGeometries[key]
			);
		});
	}

	public dispose() {}
}
