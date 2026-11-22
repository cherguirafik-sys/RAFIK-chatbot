import * as THREE from 'three';
import {useThree} from '@react-three/fiber';

export const W = 1080, H = 1920;
export type V = [number, number, number];
export type Cam = {pos: V; look: V; fov: number; roll: number};
export const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3.2);
export const smoother = (x: number) => {
	const t = Math.min(1, Math.max(0, x));
	return t * t * t * (t * (t * 6 - 15) + 10);
};
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const mix = (a: V, b: V, u: number): V => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
export const mixCam = (a: Cam, b: Cam, u: number): Cam => ({pos: mix(a.pos, b.pos, u), look: mix(a.look, b.look, u), fov: a.fov + (b.fov - a.fov) * u, roll: a.roll + (b.roll - a.roll) * u});
export const push = (c: Cam, amt: number): Cam => {
	const dir: V = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
	return {...c, pos: [c.pos[0] + dir[0] * amt, c.pos[1] + dir[1] * amt, c.pos[2] + dir[2] * amt]};
};
const setup = (cam: THREE.PerspectiveCamera, c: Cam) => {
	cam.position.set(...c.pos);
	cam.up.set(Math.sin((c.roll * Math.PI) / 180), Math.cos((c.roll * Math.PI) / 180), 0);
	cam.lookAt(...c.look);
	cam.fov = c.fov;
	cam.near = 0.05;
	cam.far = 900;
	cam.updateProjectionMatrix();
	cam.updateMatrixWorld();
};
export const CameraRig: React.FC<{c: Cam}> = ({c}) => {
	const {camera} = useThree();
	setup(camera as THREE.PerspectiveCamera, c);
	return null;
};
export type Proj = {x: number; y: number; ppm: number; roll: number};
export const projector = (c: Cam, w = W, h = H) => {
	const cam = new THREE.PerspectiveCamera(c.fov, w / h, 0.05, 900);
	setup(cam, c);
	return (p: V): Proj => {
		const a = new THREE.Vector3(...p).project(cam);
		const b = new THREE.Vector3(p[0], p[1] + 1, p[2]).project(cam);
		const x = ((a.x + 1) / 2) * w, y = ((1 - a.y) / 2) * h;
		const xb = ((b.x + 1) / 2) * w, yb = ((1 - b.y) / 2) * h;
		return {x, y, ppm: Math.hypot(xb - x, yb - y), roll: Math.atan2(xb - x, y - yb) * (180 / Math.PI)};
	};
};
// distance from camera, for back-to-front sorting of the 2D cast
export const depth = (c: Cam, p: V) => Math.hypot(p[0] - c.pos[0], p[1] - c.pos[1], p[2] - c.pos[2]);
