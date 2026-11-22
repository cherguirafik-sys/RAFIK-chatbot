import React, {useMemo} from 'react';
import * as THREE from 'three';
import {staticFile} from 'remotion';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {useAsset} from '../assets';
import type {P3} from './Toon3D';

// Shared cache so a model used many times is fetched once.
const cache = new Map<string, Promise<THREE.Group>>();
const loadGLB = (file: string) => {
	if (!cache.has(file)) {
		cache.set(
			file,
			new Promise<THREE.Group>((resolve, reject) =>
				new GLTFLoader().load(staticFile(file), (g) => {
					// Render-speed pass: single-sided, textures downsized to 1024 (headless Chrome rasterises on the CPU).
					g.scene.traverse((o) => {
						const mesh = o as THREE.Mesh;
						if (!mesh.isMesh) return;
						(Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((mm) => {
							const std = mm as THREE.MeshStandardMaterial;
							std.side = THREE.FrontSide;
							const img = std.map?.image as {width: number; height: number} | undefined;
							if (std.map && img && img.width > 1024) {
								const c = document.createElement('canvas');
								c.width = c.height = 1024;
								c.getContext('2d')!.drawImage(img as CanvasImageSource, 0, 0, 1024, 1024);
								std.map.image = c;
								std.map.needsUpdate = true;
							}
						});
					});
					resolve(g.scene);
				}, undefined, reject),
			),
		);
	}
	return cache.get(file)!;
};

// Ink outline for a generated mesh: back-face hull pushed out along the normals (constant world thickness),
// so silhouettes get the house near-black ink without noisy crease lines on dense scanned topology.
const inkMaterial = (thickness: number) => {
	const m = new THREE.MeshBasicMaterial({color: 0x0b0a0c, side: THREE.BackSide});
	m.onBeforeCompile = (sh) => {
		sh.uniforms.uInk = {value: thickness};
		sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uInk;').replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * uInk;');
	};
	return m;
};

/**
 * Place a generated GLB: scaled to `height` metres (or `fit` on its longest side), bottom on the ground,
 * centred on x/z, shadows on, optional colour grading toward the scene palette, and an ink hull.
 */
export const GLB: React.FC<{file: string; p?: P3; r?: P3; height?: number; fit?: number; ink?: number; tint?: string; emissive?: number; flipX?: boolean}> = ({file, p = [0, 0, 0], r = [0, 0, 0], height, fit, ink = 1, tint, emissive = 0, flipX}) => {
	const src = useAsset(file, () => loadGLB(file));
	const obj = useMemo(() => {
		if (!src) return null;
		const root = src.clone(true);
		const box = new THREE.Box3().setFromObject(root);
		const size = box.getSize(new THREE.Vector3());
		const k = height ? height / Math.max(1e-3, size.y) : fit ? fit / Math.max(1e-3, size.x, size.y, size.z) : 1;
		root.scale.setScalar(k);
		root.position.set(-((box.min.x + box.max.x) / 2) * k, -box.min.y * k, -((box.min.z + box.max.z) / 2) * k);
		const group = new THREE.Group();
		group.add(root);
		const thick = 0.012 * Math.max(size.x, size.y, size.z) * k * ink;
		const hulls: THREE.Mesh[] = [];
		root.traverse((o) => {
			const mesh = o as THREE.Mesh;
			if (!mesh.isMesh) return;
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
			mats.forEach((mm) => {
				const std = mm as THREE.MeshStandardMaterial;
				if (std.isMeshStandardMaterial) {
					std.roughness = Math.max(0.55, std.roughness ?? 1);
					std.metalness = Math.min(0.2, std.metalness ?? 0);
					if (tint) std.color = new THREE.Color(tint);
					if (emissive > 0 && std.map) {
						std.emissive = new THREE.Color('#ffffff');
						std.emissiveMap = std.map;
						std.emissiveIntensity = emissive;
					}
				}
			});
			if (ink > 0 && mesh.geometry.attributes.normal) {
				const hull = new THREE.Mesh(mesh.geometry, inkMaterial(thick / k));
				hull.position.copy(mesh.position);
				hull.quaternion.copy(mesh.quaternion);
				hull.scale.copy(mesh.scale);
				hulls.push(hull);
				mesh.parent?.add(hull);
			}
		});
		return group;
	}, [src, height, fit, ink, tint, emissive]);
	if (!obj) return null;
	return (
		<group position={p} rotation={r} scale={flipX ? [-1, 1, 1] : [1, 1, 1]}>
			<primitive object={obj} />
		</group>
	);
};
