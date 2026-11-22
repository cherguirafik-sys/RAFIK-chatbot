#!/usr/bin/env python3
"""Prepare explicitly mapped transparent layers; never guess anatomy. Requires Pillow."""
import argparse,json,math,shutil
from pathlib import Path
from PIL import Image,ImageDraw

def need(x,m):
    if not x:raise ValueError(m)
def validate(rig):
    size=rig['size'];need(len(size)==2 and all(isinstance(x,int) and x>0 for x in size),'Invalid canvas size')
    layers=rig['layers']; ids=[x['id'] for x in layers];need(len(ids)==len(set(ids)) and ids,'Unique layer IDs required')
    for x in layers:
        need(len(x['box'])==4 and all(isinstance(v,int) for v in x['box']),'box needs integer x,y,w,h')
        a,b,w,h=x['box'];need(a>=0 and b>=0 and w>0 and h>0 and a+w<=size[0] and b+h<=size[1],'Layer crop outside canvas')
        need(len(x['pivot'])==2 and all(isinstance(v,(int,float)) and math.isfinite(v) for v in x['pivot']),'Invalid pivot')
        need(0<=x['pivot'][0]<=size[0] and 0<=x['pivot'][1]<=size[1],'Pivot outside canvas')
        visited={x['id']}; parent=x.get('parent')
        while parent:
            need(parent in ids,'Unknown parent '+parent);need(parent not in visited,'Cyclic layer parenting');visited.add(parent)
            parent=next(y for y in layers if y['id']==parent).get('parent')
    return rig
# 2D affine matrices [a,c,e,b,d,f], matching Pillow's forward coordinate convention.
def mul(m,n):
    a,c,e,b,d,f=m;A,C,E,B,D,F=n
    return [a*A+c*B,a*C+c*D,a*E+c*F+e,b*A+d*B,b*C+d*D,b*E+d*F+f]
def inv(m):
    a,c,e,b,d,f=m;det=a*d-b*c;return [d/det,-c/det,(c*f-d*e)/det,-b/det,a/det,(b*e-a*f)/det]
def render(rig,folder,angles=None):
    angles=angles or {};W,H=rig['size']; pad=int(max(W,H)*.35);out=Image.new('RGBA',(W+pad*2,H+pad*2)); by={x['id']:x for x in rig['layers']}
    for x in rig['layers']:
        chain=[];cur=x
        while cur:chain.insert(0,cur);cur=by.get(cur.get('parent'))
        m=[1,0,pad,0,1,pad]
        for part in chain:
            px,py=part['pivot'];a=math.radians(angles.get(part['id'],0));c,s=math.cos(a),math.sin(a)
            m=mul(m,[c,-s,px-c*px+s*py,s,c,py-s*px-c*py])
        m=mul(m,[1,0,x['box'][0],0,1,x['box'][1]])
        im=Image.open(folder/x['file']).convert('RGBA');layer=im.transform(out.size,Image.Transform.AFFINE,inv(m),Image.Resampling.BICUBIC);out.alpha_composite(layer)
    return out

def prepare(specpath,out):
    specpath=Path(specpath);spec=json.loads(specpath.read_text(encoding='utf-8'));validate(spec);need(spec.get('poseTests'),'Include representative poseTests in the preparation spec');out=Path(out);need(not out.exists(),'Output exists; create a new asset version')
    source=Image.open(specpath.parent/spec['source']).convert('RGBA') if spec.get('source') else None
    if source:need(source.size==tuple(spec['size']),'Source and canvas size differ');need(source.getextrema()[3][0]<255,'Remove background before slicing; this tool does not remove backgrounds')
    rig={'version':1,'size':spec['size'],'feetY':spec.get('feetY',spec['size'][1]),'layers':[],'faces':spec.get('faces',{}),'poseTests':spec.get('poseTests',[])}
    prepared=[]
    for i,x in enumerate(spec['layers']):
        a,b,w,h=x['box']
        if x.get('file'):im=Image.open(specpath.parent/x['file']).convert('RGBA');need(im.size==(w,h),'Layer dimensions differ from box')
        else:
            need(source is not None,'Layer needs file or source crop');im=source.copy()
            if x.get('polygon'):
                mask=Image.new('L',source.size);ImageDraw.Draw(mask).polygon([tuple(p) for p in x['polygon']],fill=255)
                from PIL import ImageChops
                im.putalpha(ImageChops.multiply(im.getchannel('A'),mask))
            im=im.crop((a,b,a+w,b+h))
        need(im.getbbox() is not None,'Empty layer '+x['id'])
        filename=f'layer-{i:02}.png';rig['layers'].append({k:v for k,v in x.items() if k in ['id','box','pivot','parent']}|{'file':filename});prepared.append((filename,im))
    # Validate face replacement paths before writing; expressions remain named by the author.
    faces={}
    for name,face in rig['faces'].items():
        need(face['layer'] in [x['id'] for x in rig['layers']],'Face targets unknown layer')
        target=next(x for x in rig['layers'] if x['id']==face['layer']);im=Image.open(specpath.parent/face['file']).convert('RGBA')
        need(im.size==tuple(target['box'][2:]),'Align replacement expression to the same layer size/pivot first')
        filename=f'face-{len(faces):02}.png';prepared.append((filename,im));faces[name]={'layer':face['layer'],'file':filename}
    rig['faces']=faces;out.mkdir(parents=True)
    for filename,im in prepared:im.save(out/filename)
    (out/'rig.json').write_text(json.dumps(rig,indent=2)+'\n',encoding='utf-8')
    original=source or render(rig,out);exploded=Image.new('RGBA',(int(spec['size'][0]*1.8),int(spec['size'][1]*1.4)))
    for i,x in enumerate(rig['layers']):exploded.alpha_composite(Image.open(out/x['file']).convert('RGBA'),(max(0,x['box'][0]+(i%3)*30),x['box'][1]+i*12))
    panels=[('Original / supplied layers',original),('Separated layers',exploded),('Reassembled',render(rig,out))]+[(p['name'],render(rig,out,p['angles'])) for p in rig['poseTests']]
    for name,face in rig['faces'].items():
        variant={**rig,'layers':[{**layer,'file':face['file']} if layer['id']==face['layer'] else layer for layer in rig['layers']]}
        panels.append(('Face: '+name,render(variant,out)))
    need(rig['poseTests'],'Include representative poseTests in the preparation spec')
    sheet=Image.new('RGB',(320*len(panels),540),'#ddd7c9');draw=ImageDraw.Draw(sheet)
    for i,(label,im) in enumerate(panels):
        im=im.copy();im.thumbnail((300,490));sheet.paste(im,(320*i+(320-im.width)//2,35+(490-im.height)//2),im);draw.text((i*320+10,10),label,fill='#172027')
    sheet.save(out/'preview.png');print(out/'preview.png','— inspect joints, silhouettes and intended action limits before selection')

def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('spec');ap.add_argument('output');a=ap.parse_args()
    try:prepare(a.spec,a.output)
    except (ValueError,KeyError,OSError) as e:ap.exit(2,str(e)+'\n')
if __name__=='__main__':main()
