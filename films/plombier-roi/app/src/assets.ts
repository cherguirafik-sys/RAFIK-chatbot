import {useEffect,useLayoutEffect,useMemo,useState} from 'react';
import {cancelRender,continueRender,delayRender} from 'remotion';
import {useThree} from '@react-three/fiber';
// Hold rendering from the first component render until the asset is committed and painted.
export function useAsset<T>(key:string|undefined,load:()=>Promise<T>):T|null{
 const advance=useThree(s=>s.advance);
 const handle=useMemo(()=>key?delayRender('Loading '+key):null,[key]);
 const [state,set]=useState<{key:string;value:T}|null>(null);
 useEffect(()=>{if(!key)return;let live=true;load().then(value=>{if(live)set({key,value});}).catch(cancelRender);return()=>{live=false;if(handle!==null)continueRender(handle);};},[key,handle]);
 const value=state&&state.key===key?state.value:null;
 useLayoutEffect(()=>{if(value!==null&&handle!==null){let next=0;const id=requestAnimationFrame(()=>{window.dispatchEvent(new Event('studio-assets-ready'));/* ThreeCanvas disables its render loop during export; paint the committed asset explicitly. */advance(performance.now());next=requestAnimationFrame(()=>continueRender(handle));});return()=>{cancelAnimationFrame(id);cancelAnimationFrame(next);};}},[value,handle,advance]);
 return value;
}
