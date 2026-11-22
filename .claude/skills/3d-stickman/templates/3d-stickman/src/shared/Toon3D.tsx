import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {LineSegments2} from 'three/examples/jsm/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js';

// ---------- deterministic procedural "hand-painted" textures ----------
export const rng = (seed: number) => () => {
	seed = (seed * 16807) % 2147483647;
	return (seed - 1) / 2147483646;
};
export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void, seed = 7, repeat?: [number, number]) => {
	const c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	const g = c.getContext('2d')!;
	draw(g, rng(seed));
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = 8;
	if (repeat) {
		t.wrapS = t.wrapT = THREE.RepeatWrapping;
		t.repeat.set(repeat[0], repeat[1]);
	}
	return t;
};
export const blotches = (g: CanvasRenderingContext2D, r: () => number, w: number, h: number, cols: string[], n: number, rmin: number, rmax: number, alpha = 0.25) => {
	for (let i = 0; i < n; i++) {
		g.globalAlpha = alpha * (0.4 + r() * 0.6);
		g.fillStyle = cols[Math.floor(r() * cols.length)];
		g.beginPath();
		g.ellipse(r() * w, r() * h, rmin + r() * (rmax - rmin), (rmin + r() * (rmax - rmin)) * (0.5 + r() * 0.5), r() * 3, 0, Math.PI * 2);
		g.fill();
	}
	g.globalAlpha = 1;
};
// ---------- ink: crease lines + silhouettes ----------
export const InkLines: React.FC<{geometry: THREE.BufferGeometry; width?: number; crease?: number}> = ({geometry, width = 2.6, crease = 35}) => {
	const {size} = useThree();
	const obj = useMemo(() => {
		const eg = new THREE.EdgesGeometry(geometry, crease);
		const lg = new LineSegmentsGeometry().fromEdgesGeometry(eg);
		const mat = new LineMaterial({color: 0x0b0a0c, linewidth: width, worldUnits: false});
		mat.resolution.set(size.width, size.height);
		return new LineSegments2(lg, mat);
	}, [geometry, width, crease, size.width, size.height]);
	return <primitive object={obj} />;
};
export const Hull: React.FC<{geometry: THREE.BufferGeometry; t?: number}> = ({geometry, t = 1.035}) => (
	<mesh geometry={geometry} scale={[t, t, t]}>
		<meshBasicMaterial color="#0b0a0c" side={THREE.BackSide} />
	</mesh>
);

export type P3 = [number, number, number];
export const Box: React.FC<{s: P3; p: P3; r?: P3; color?: string; map?: THREE.Texture; ink?: boolean; shadow?: boolean}> = ({s, p, r = [0, 0, 0], color = '#ffffff', map, ink = true, shadow = true}) => {
	const geo = useMemo(() => new THREE.BoxGeometry(...s), [s[0], s[1], s[2]]);
	return (
		<group position={p} rotation={r}>
			<mesh geometry={geo} castShadow={shadow} receiveShadow>
				<meshStandardMaterial color={color} map={map} roughness={0.95} />
			</mesh>
			{ink ? <InkLines geometry={geo} /> : null}
		</group>
	);
};
export const Prism: React.FC<{w: number; h: number; d: number; p: P3; r?: P3; color?: string; map?: THREE.Texture}> = ({w, h, d, p, r = [0, 0, 0], color = '#fff', map}) => {
	const geo = useMemo(() => {
		const sh = new THREE.Shape();
		sh.moveTo(-w / 2, 0);
		sh.lineTo(w / 2, 0);
		sh.lineTo(0, h);
		sh.closePath();
		const g = new THREE.ExtrudeGeometry(sh, {depth: d, bevelEnabled: false});
		g.translate(0, 0, -d / 2);
		return g;
	}, [w, h, d]);
	return (
		<group position={p} rotation={r}>
			<mesh geometry={geo} castShadow receiveShadow>
				<meshStandardMaterial color={color} map={map} roughness={0.95} />
			</mesh>
			<InkLines geometry={geo} />
		</group>
	);
};
export const Blob: React.FC<{p: P3; r: number; color: string; detail?: number}> = ({p, r, color, detail = 3}) => {
	const geo = useMemo(() => new THREE.IcosahedronGeometry(r, detail), [r, detail]);
	return (
		<group position={p}>
			<mesh geometry={geo} castShadow receiveShadow>
				<meshStandardMaterial color={color} roughness={1} />
			</mesh>
			<Hull geometry={geo} t={1.04} />
		</group>
	);
};
export const Cyl: React.FC<{p: P3; rt: number; rb: number; h: number; color: string; map?: THREE.Texture; seg?: number; r?: P3}> = ({p, rt, rb, h, color, map, seg = 14, r = [0, 0, 0]}) => {
	const geo = useMemo(() => new THREE.CylinderGeometry(rt, rb, h, seg), [rt, rb, h, seg]);
	return (
		<group position={p} rotation={r}>
			<mesh geometry={geo} castShadow receiveShadow>
				<meshStandardMaterial color={color} map={map} roughness={0.95} />
			</mesh>
			<InkLines geometry={geo} crease={40} />
			<Hull geometry={geo} t={1.03} />
		</group>
	);
};

export const Window: React.FC<{p: P3; w?: number; h?: number}> = ({p, w = 0.7, h = 0.95}) => (
	<group position={p}>
		<Box s={[w + 0.14, h + 0.14, 0.06]} p={[0, 0, 0]} color="#fbf6ee" />
		<Box s={[w, h, 0.07]} p={[0, 0, 0.01]} color="#ffd98a" ink={false} shadow={false} />
		<Box s={[0.05, h, 0.08]} p={[0, 0, 0.02]} color="#fbf6ee" ink={false} />
		<Box s={[w, 0.05, 0.08]} p={[0, 0, 0.02]} color="#fbf6ee" ink={false} />
	</group>
);


// generic plank/tile texture factories
export const planksTex = (base: string, dark: string, light: string, seed: number, vertical = false, rep: [number, number] = [1, 1]) =>
	canvasTex(256, 256, (g, r) => {
		g.fillStyle = base;
		g.fillRect(0, 0, 256, 256);
		for (let i = 0; i < 8; i++) {
			const y = i * 32;
			g.fillStyle = r() > 0.5 ? light : base;
			g.globalAlpha = 0.35;
			if (vertical) g.fillRect(y + 2, 0, 28, 256);
			else g.fillRect(0, y + 2, 256, 28);
			g.globalAlpha = 0.8;
			g.fillStyle = dark;
			if (vertical) g.fillRect(y, 0, 2.5, 256);
			else g.fillRect(0, y, 256, 2.5);
		}
		blotches(g, r, 256, 256, [dark, light], 40, 3, 16, 0.18);
		g.globalAlpha = 1;
	}, seed, rep);
export const noiseTex = (base: string, cols: string[], seed: number, rep: [number, number], n = 220, rmin = 8, rmax = 50, a = 0.25) =>
	canvasTex(512, 512, (g, r) => {
		g.fillStyle = base;
		g.fillRect(0, 0, 512, 512);
		blotches(g, r, 512, 512, cols, n, rmin, rmax, a);
	}, seed, rep);
export const checkerTex = (c1: string, c2: string, seed: number, rep: [number, number]) =>
	canvasTex(256, 256, (g, r) => {
		for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
			g.fillStyle = (x + y) % 2 ? c1 : c2;
			g.fillRect(x * 64, y * 64, 64, 64);
		}
		blotches(g, r, 256, 256, ['#ffffff', '#b8b0a8'], 30, 4, 20, 0.12);
	}, seed, rep);
