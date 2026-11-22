#!/usr/bin/env python3
"""Compare comparable stills, not story quality. Requires Pillow and NumPy."""
import argparse,json
from pathlib import Path
import numpy as np
from PIL import Image

def metrics(path):
    im=Image.open(path).convert('RGB');im.thumbnail((360,640));a=np.asarray(im,dtype=float)/255
    l=a@np.array([.2126,.7152,.0722]);hi=a.max(2);lo=a.min(2);sat=(hi-lo)/np.maximum(hi,1e-6)
    # Luminance-defined dark region is a proxy, not a semantic shadow detector.
    dark=a[l<=np.quantile(l,.2)]; shadow=dark.mean(0)
    return {'luma_mean':float(l.mean()),'contrast':float(l.std()),'dark_p10':float(np.quantile(l,.1)),'highlight_p95':float(np.quantile(l,.95)),
            'saturation':float(np.median(sat)),'dark_region_red_blue':float(shadow[0]-shadow[2]),
            'edge_density_proxy':float((np.abs(np.diff(l,axis=1))>.12).mean()),'near_black_share':float((l<.025).mean())}
HINTS={
 'luma_mean':('Increase exposure or fill cautiously.','Reduce exposure; preserve face readability.'),
 'contrast':('Increase key/fill separation.','Reduce key/fill separation.'),
 'dark_p10':('Lift fill or ground bounce.','Deepen fill shadows if the approved look calls for it.'),
 'highlight_p95':('Increase highlights without clipping.','Reduce key light or exposure.'),
 'saturation':('Increase material saturation selectively.','Mute material colours selectively.'),
 'dark_region_red_blue':('Warm the shadow tint only if comparable surfaces are shown.','Cool the shadow tint only if comparable surfaces are shown.'),
 'edge_density_proxy':('Inspect outlines and texture detail; this metric also counts texture.','Inspect busy textures and outlines; do not blindly remove detail.'),
 'near_black_share':('No correction required solely for fewer black pixels.','Inspect crushed shadows; intentional silhouettes may be correct.')}
def compare(a,b):
    ours,ref=metrics(a),metrics(b);diff={k:ours[k]-ref[k] for k in ours}
    return {'ours':ours,'reference':ref,'difference':diff,'suggestions':[{'metric':k,'difference':diff[k],'suggestion':HINTS[k][int(diff[k]>0)]} for k in sorted(diff,key=lambda k:abs(diff[k]),reverse=True)[:4]],
            'limitations':'Compare matching framing, lighting and subject coverage. Edge density is not measured stroke width; dark regions are not semantic shadows. Statistics never establish identity, acting, pacing or visual quality.'}
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('ours');p.add_argument('reference');p.add_argument('-o','--output');a=p.parse_args();result=compare(a.ours,a.reference);text=json.dumps(result,indent=2)
    if a.output:Path(a.output).write_text(text+'\n',encoding='utf-8')
    print(text)
