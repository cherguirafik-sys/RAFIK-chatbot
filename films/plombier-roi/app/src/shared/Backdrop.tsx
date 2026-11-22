import React, {useMemo} from 'react';
import * as THREE from 'three';
import {staticFile} from 'remotion';
import {useAsset} from '../assets';

const cache = new Map<string, Promise<THREE.Texture>>();
const loadTex = (file: string) => {
	if (!cache.has(file)) {
		cache.set(
			file,
			new Promise<THREE.Texture>((resolve, reject) =>
				new THREE.TextureLoader().load(staticFile(file), (t) => {
					t.colorSpace = THREE.SRGBColorSpace;
					t.wrapS = THREE.MirroredRepeatWrapping;
					t.anisotropy = 8;
					resolve(t);
				}, undefined, reject),
			),
		);
	}
	return cache.get(file)!;
};

/**
 * Painted far backdrop: an AI-generated panorama wrapped around the inside of a big cylinder.
 * The 3D set sits inside; far scenery gets parallax for free from the real camera and stays unlit and unfogged.
 * `horizon` = height (world y) where the image's horizon line lands; `hFrac` = where that line is in the image (from the bottom).
 * `copies` = how many mirrored copies go round the full circle; `yaw` turns the ring so the image centre faces a direction.
 */
export const Backdrop: React.FC<{file: string; center?: [number, number]; radius?: number; horizon?: number; hFrac?: number; aspect?: number; copies?: number; yaw?: number; bright?: number}> = ({
	file, center = [0, 0], radius = 300, horizon = 0, hFrac = 0.35, aspect = 21 / 9, copies = 4, yaw = 0, bright = 1,
}) => {
	const tex = useAsset(file, () => loadTex(file));
	const geo = useMemo(() => {
		const H = ((2 * Math.PI * radius) / copies) / aspect;
		return {H, g: new THREE.CylinderGeometry(radius, radius, H, 128, 1, true)};
	}, [radius, copies, aspect]);
	const mat = useMemo(() => {
		if (!tex) return null;
		const t = tex.clone();
		t.needsUpdate = true;
		t.repeat.set(copies, 1);
		return new THREE.MeshBasicMaterial({map: t, side: THREE.BackSide, fog: false, depthWrite: false, color: new THREE.Color(bright, bright, bright)});
	}, [tex, copies, bright]);
	if (!mat) return null;
	const y = horizon - hFrac * geo.H + geo.H / 2;
	// Cylinder UV u=0 sits at +z... rotate so the image centre (u=0.5 of a copy) faces -z when yaw=0.
	return <mesh geometry={geo.g} material={mat} position={[center[0], y, center[1]]} rotation={[0, yaw + Math.PI / 2 + Math.PI / copies, 0]} renderOrder={-10} frustumCulled={false} />;
};
