#!/usr/bin/env python3
"""Project initialization, cue compilation and explicit versioned asset reuse. Stdlib only."""
import argparse, hashlib, json, math, re, shutil, sys
from pathlib import Path

def read(p): return json.loads(Path(p).read_text(encoding='utf-8'))
def write(p, data):
    p=Path(p); p.parent.mkdir(parents=True, exist_ok=True)
    tmp=p.with_suffix(p.suffix+'.tmp'); tmp.write_text(json.dumps(data, indent=2)+'\n',encoding='utf-8'); tmp.replace(p)
def number(x): return isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x)
def tokens(s): return re.findall(r"[\w]+(?:['’][\w]+)*",str(s).lower().replace('’',"'"))
def need(ok, message):
    if not ok: raise ValueError(message)
def alignment_entries(alignment):
    entries=alignment.get('words',alignment.get('phrases',[])); duration=alignment.get('duration')
    need(number(duration) and duration>0,'Alignment needs a positive measured duration')
    need(alignment.get('method'),'Alignment must name its method and precision')
    result=[]; last=0
    for i,e in enumerate(entries):
        s=e.get('s',e.get('t0')); end=e.get('e',e.get('t1')); text=e.get('word',e.get('w',e.get('text','')))
        need(number(s) and number(end) and 0<=s<end<=duration and s>=last-1e-6,f'Invalid or overlapping alignment entry {i}')
        need(tokens(text),f'Empty alignment text at entry {i}')
        result.append((tokens(text),s,end)); last=end
    return result

def compile_timeline(plan, alignment):
    fps=plan.get('fps',30); need(isinstance(fps,int) and fps>0,'fps must be a positive integer')
    entries=alignment_entries(alignment)
    # Phrase alignment resolves only an exact phrase ENTRY START, never invents word offsets inside it.
    flat=[(w,s,e,j,k) for j,(ws,s,e) in enumerate(entries) for k,w in enumerate(ws)]
    def resolve(value):
        if number(value):
            need(value>=0,'Negative time'); return float(value)
        need(isinstance(value,str) and value.startswith('say:'),'Time must be seconds or say:phrase[#occurrence]')
        m=re.fullmatch(r'say:(.+?)(?:#([1-9]\d*))?',value); need(m is not None,'Invalid cue '+value)
        want=tokens(m[1]); need(want,'Empty narration cue')
        matches=[i for i in range(len(flat)-len(want)+1) if [t[0] for t in flat[i:i+len(want)]]==want]
        need(matches,'Narration cue not found: '+value)
        if m[2] is None: need(len(matches)==1,'Ambiguous cue; specify #occurrence: '+value)
        n=int(m[2] or '1'); need(n<=len(matches),'Cue occurrence missing: '+value)
        hit=flat[matches[n-1]]; need(hit[4]==0,'Cue begins inside a phrase estimate; use its entry start or obtain word alignment: '+value)
        return hit[1]
    raw=plan.get('shots',[]); need(raw,'No shots')
    ids=[s.get('id') for s in raw]; need(all(isinstance(i,str) and i for i in ids) and len(set(ids))==len(ids),'Shot IDs must be unique nonempty strings')
    end=plan.get('end','audio'); end=alignment['duration'] if end=='audio' else resolve(end)
    need(end>=alignment['duration'] or plan.get('allowNarrationTrim') is True,'End would truncate narration; select an excerpt explicitly')
    frames=math.ceil(end*fps-1e-8); starts=[round(resolve(s['start'])*fps) for s in raw]
    need(starts[0]==0,'First shot must start at frame 0')
    need(all(a<b for a,b in zip(starts,starts[1:])) and starts[-1]<frames,'Shot starts must increase after frame rounding and precede the end')
    shots=[]
    for i,s in enumerate(raw):
        shot={k:v for k,v in s.items() if k not in ['start','events']}; shot.update(a=starts[i],b=starts[i+1] if i+1<len(starts) else frames)
        events=[]
        for e in s.get('events',[]):
            ef=round(resolve(e['cue'])*fps) if 'cue' in e else shot['a']+round(float(e.get('at',0))*fps)
            need(shot['a']<=ef<shot['b'],f"Event outside shot {s['id']}")
            events.append({**{k:v for k,v in e.items() if k not in ['cue','at']},'frame':ef})
        shot['events']=events
        shot['reviewFrames']=sorted(set([shot['a'],(shot['a']+shot['b']-1)//2,shot['b']-1]+[e['frame'] for e in events]+[shot['a']+round(float(t)*fps) for t in s.get('reviewAt',[])]))
        need(all(shot['a']<=f<shot['b'] for f in shot['reviewFrames']),'reviewAt outside shot '+s['id'])
        shots.append(shot)
    return {'revision':plan.get('revision',1),'fps':fps,'durationInFrames':frames,'alignment':{'method':alignment['method'],'verified':alignment.get('verified',False),'duration':alignment['duration']},'shots':shots,'events':[],'xfade':[],'planned':[],'flash':None,
            'sourceHash':hashlib.sha256(json.dumps([plan,alignment],sort_keys=True).encode()).hexdigest()}

def initialize(dest):
    source=Path(__file__).resolve().parents[1]/'templates/remotion-starter'; dest=Path(dest)
    need(source.is_dir(),'Initializer must run from the installed skill scripts folder')
    need(not dest.exists(),'Destination exists; choose a new project folder')
    shutil.copytree(source,dest)
    (dest/'tools').mkdir()
    for name in ['studio.py','prepare_rig.py','compare_style.py']:
        shutil.copy2(Path(__file__).with_name(name),dest/'tools'/name)
    print('Created',dest,'— run npm ci, npm run compile, npm run dev -- --no-open in that folder.')

def valid_id(value): need(re.fullmatch(r'[A-Za-z0-9_-]+',value or ''),'Use letters, digits, _ or - for IDs/versions')
def digest_tree(path):
    return {str(p.relative_to(path)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(path.rglob('*')) if p.is_file() and p!=path/'asset.json'}
def library_add(args):
    need(args.copy_allowed,'Library import copies media; --copy-allowed requires actual user authorization')
    valid_id(args.id);valid_id(args.version);source=Path(args.source).resolve();need(source.exists(),'Source missing')
    out=Path(args.library)/args.id/args.version;need(not out.exists(),'Asset version already exists; use a new version')
    candidates=[source] if source.is_file() else list(source.rglob('*'))
    need(not source.is_symlink() and all(not p.is_symlink() for p in candidates),'Resolve symlinks explicitly before import')
    need(not source.is_dir() or not out.resolve().is_relative_to(source),'Library destination cannot be inside source')
    out.mkdir(parents=True)
    if source.is_dir(): shutil.copytree(source,out/'files')
    else: (out/'files').mkdir();shutil.copy2(source,out/'files'/source.name)
    write(out/'asset.json',{'id':args.id,'version':args.version,'role':args.role,'status':'received','copyAllowed':True,'hashes':digest_tree(out)})
    print(out,'— inspect and select before using; importing is not approval')
def library_use(args):
    valid_id(args.id);valid_id(args.version);src=Path(args.library)/args.id/args.version
    meta=read(src/'asset.json'); need(meta.get('copyAllowed') is True,'Asset cannot be copied')
    need(meta.get('status')=='selected','Inspect asset and record status=selected before reuse')
    need(meta.get('hashes')==digest_tree(src),'Asset changed since registration; create a new version')
    project=Path(args.project); target=project/'public/library'/args.id/args.version
    need(not target.exists(),'Project asset version already exists')
    lock_path=project/'ASSETS.json'; lock=read(lock_path) if lock_path.exists() else {'assets':[]}
    need(not any(a['id']==args.id and a['version']==args.version for a in lock['assets']),'Asset already pinned')
    shutil.copytree(src/'files',target)
    lock['assets'].append({'id':args.id,'version':args.version,'role':meta['role'],'path':str(target.relative_to(project/'public')),'hashes':meta['hashes']})
    write(lock_path,lock);print('Pinned',args.id,args.version,'— bind the path to a scene role and record shot dependencies')

def main():
    ap=argparse.ArgumentParser(description=__doc__);sub=ap.add_subparsers(dest='cmd',required=True)
    p=sub.add_parser('init');p.add_argument('destination')
    p=sub.add_parser('compile');p.add_argument('plan');p.add_argument('alignment');p.add_argument('-o','--output',required=True)
    p=sub.add_parser('library-list');p.add_argument('library')
    p=sub.add_parser('library-add');p.add_argument('library');p.add_argument('id');p.add_argument('version');p.add_argument('source');p.add_argument('--role',required=True);p.add_argument('--copy-allowed',action='store_true')
    p=sub.add_parser('library-use');p.add_argument('library');p.add_argument('id');p.add_argument('version');p.add_argument('project')
    a=ap.parse_args()
    try:
        if a.cmd=='init': initialize(a.destination)
        elif a.cmd=='compile': write(a.output,compile_timeline(read(a.plan),read(a.alignment)));print('Compiled',a.output)
        elif a.cmd=='library-add': library_add(a)
        elif a.cmd=='library-use': library_use(a)
        else:
            for p in sorted(Path(a.library).glob('*/*/asset.json')):
                m=read(p);print(m['id'],m['version'],m['role'],m['status'])
    except (ValueError,KeyError,TypeError,OSError) as e: ap.exit(2,str(e)+'\n')
if __name__=='__main__':main()
