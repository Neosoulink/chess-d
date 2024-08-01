import { Color, Euler, Matrix4, Quaternion, Vector3 } from "three";

export const VECTOR = new Vector3(1, 1, 1);
export const SCALE = new Vector3(1, 1, 1);
export const QUATERNION = new Quaternion().setFromEuler(
	new Euler(Math.PI / -2, 0, 0, "XYZ")
);
export const MATRIX = new Matrix4();
export const COLOR_BLACK = new Color(0x222222);
export const COLOR_WHITE = new Color(0xbbbbbb);
