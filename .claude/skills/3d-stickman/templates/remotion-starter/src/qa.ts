import * as THREE from 'three';
export function probeScene(scene:THREE.Scene,camera:THREE.Camera){
 scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);const flags:{flag:string;subject:string}[]=[];
 const props:THREE.Object3D[]=[],subjects:THREE.Sprite[]=[];
 scene.traverse(o=>{if(o.userData.qaObstacle)props.push(o);if(o.userData.qaSubject)subjects.push(o as THREE.Sprite);});
 for(const p of props)if(new THREE.Box3().setFromObject(p).containsPoint(camera.position))flags.push({flag:'CAMERA_INSIDE_PROP',subject:p.userData.qaObstacle});
 if(camera.position.y<0)flags.push({flag:'CAMERA_UNDER_GROUND',subject:'camera'});
 const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion),up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
 for(const s of subjects){const [x0,y0,x1,y1]=s.userData.alphaBounds;const pos=s.getWorldPosition(new THREE.Vector3());const size=s.getWorldScale(new THREE.Vector3());
 const point=(x:number,y:number)=>pos.clone().addScaledVector(right,(x-s.center.x)*size.x).addScaledVector(up,(1-y-s.center.y)*size.y);
 const samples=[[x0,y0],[x1,y0],[x0,y1],[x1,y1],[(x0+x1)/2,(y0+y1)/2]];
 if(samples.some(([x,y])=>{const n=point(x,y).project(camera);return Math.abs(n.x)>1||Math.abs(n.y)>1||n.z>1||n.z< -1;}))flags.push({flag:'SUBJECT_CLIPPED',subject:s.userData.qaSubject});
 const target=point((x0+x1)/2,y0+(y1-y0)*.2);const ray=new THREE.Raycaster(camera.position,target.clone().sub(camera.position).normalize(),.05,camera.position.distanceTo(target)-.02);
 if(ray.intersectObjects(props,true).length)flags.push({flag:'SUBJECT_OCCLUDED',subject:s.userData.qaSubject});
 if(samples.some(([x,y])=>point(x,y).y<-.08))flags.push({flag:'SUBJECT_BELOW_GROUND',subject:s.userData.qaSubject});
 }
 return flags;
}
