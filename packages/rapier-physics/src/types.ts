import type { BufferGeometry, Object3D } from "three";
import type Rapier from "@dimforge/rapier3d-compat";

export interface Object3DWithGeometry extends Object3D {
	geometry?: BufferGeometry;
}

export interface PhysicsProperties {
	rigidBodyDesc: Rapier.RigidBodyDesc;
	rigidBody: Rapier.RigidBody;
	colliderDesc: Rapier.ColliderDesc;
	collider: Rapier.Collider;
}
