export class PlayerEntity {
	id: string;
	position: { x: number; y: number; z: number };
	rotation: { w: number; x: number; y: number; z: number };
	connectedAt: Date;
}
