import copy,importlib.util,json,tempfile,unittest
from pathlib import Path
from types import SimpleNamespace
ROOT=Path(__file__).resolve().parents[1]
def module(name):
 spec=importlib.util.spec_from_file_location(name,ROOT/'scripts'/f'{name}.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
studio=module('studio')
class CueTests(unittest.TestCase):
 def setUp(self):
  self.a={'duration':6,'method':'test words','words':[{'w':'Go','t0':0,'t1':.4},{'w':'now','t0':.5,'t1':.9},{'w':'Go','t0':3,'t1':3.4},{'w':'now','t0':3.5,'t1':3.9}]}
  self.p={'fps':30,'shots':[{'id':'one','start':0},{'id':'two','start':'say:Go now#2','events':[{'cue':'say:now#2','kind':'hop'}]}]}
 def test_repeated_phrase_and_event(self):
  t=studio.compile_timeline(self.p,self.a);self.assertEqual(t['shots'][1]['a'],90);self.assertEqual(t['shots'][1]['events'][0]['frame'],105);self.assertEqual(t['shots'][-1]['b'],180)
 def test_ambiguity_and_missing_rejected(self):
  for cue in ['say:Go now','say:missing']:
   p=copy.deepcopy(self.p);p['shots'][1]['start']=cue
   with self.assertRaises(ValueError):studio.compile_timeline(p,self.a)
 def test_narration_revision_changes_derived_frames(self):
  a=copy.deepcopy(self.a);a['words'][2]['t0']=2.8;t=studio.compile_timeline(self.p,a);self.assertEqual(t['shots'][1]['a'],84);self.assertNotEqual(t['sourceHash'],studio.compile_timeline(self.p,self.a)['sourceHash'])
 def test_phrase_interior_never_invents_word_time(self):
  a={'duration':6,'method':'ASR phrases','phrases':[{'text':'Go now','s':0,'e':2},{'text':'Try again','s':3,'e':5}]};p=copy.deepcopy(self.p);p['shots'][1]={'id':'two','start':'say:again'}
  with self.assertRaises(ValueError):studio.compile_timeline(p,a)
 def test_rounding_gap_trim_and_bad_alignment(self):
  for mutation in ['start','trim','overlap']:
   p,a=copy.deepcopy(self.p),copy.deepcopy(self.a)
   if mutation=='start':p['shots'][1]['start']=.001
   if mutation=='trim':p['end']=4
   if mutation=='overlap':a['words'][1]['t0']=.2
   with self.assertRaises(ValueError):studio.compile_timeline(p,a)
class LibraryTests(unittest.TestCase):
 def test_version_immutability_selection_and_hash(self):
  with tempfile.TemporaryDirectory() as d:
   d=Path(d);source=d/'source.png';source.write_bytes(b'test asset');lib=d/'library';args=SimpleNamespace(copy_allowed=False,source=str(source),library=str(lib),id='hero',version='v1',role='character')
   with self.assertRaises(ValueError):studio.library_add(args)
   args.copy_allowed=True;studio.library_add(args)
   with self.assertRaises(ValueError):studio.library_add(args)
   use=SimpleNamespace(library=str(lib),id='hero',version='v1',project=str(d/'film'))
   with self.assertRaises(ValueError):studio.library_use(use)
   meta=lib/'hero/v1/asset.json';j=studio.read(meta);j['status']='selected';studio.write(meta,j);studio.library_use(use)
   self.assertEqual(studio.read(d/'film/ASSETS.json')['assets'][0]['version'],'v1')
   (lib/'hero/v1/files/source.png').write_bytes(b'changed');use.project=str(d/'second-film')
   with self.assertRaises(ValueError):studio.library_use(use)
class RigTests(unittest.TestCase):
 def test_prepare_and_parent_cycle(self):
  from PIL import Image,ImageDraw
  rig=module('prepare_rig')
  with tempfile.TemporaryDirectory() as d:
   d=Path(d);im=Image.new('RGBA',(200,300));draw=ImageDraw.Draw(im);draw.ellipse((70,10,130,70),fill='#fff0d5');draw.rectangle((80,70,120,220),fill='#327a9e');draw.rectangle((120,80,160,95),fill='#282132');im.save(d/'source.png')
   spec={'source':'source.png','size':[200,300],'feetY':220,'layers':[{'id':'body','box':[80,70,40,150],'pivot':[100,200]},{'id':'head','box':[70,10,60,60],'pivot':[100,70],'parent':'body'},{'id':'arm','box':[120,80,40,15],'pivot':[120,87],'parent':'body'}],'poseTests':[{'name':'reach','angles':{'body':8,'arm':-70}}]}
   (d/'spec.json').write_text(json.dumps(spec));rig.prepare(d/'spec.json',d/'rig');self.assertTrue((d/'rig/preview.png').exists());self.assertEqual(len(json.loads((d/'rig/rig.json').read_text(encoding='utf-8'))['layers']),3)
   spec['layers'][0]['parent']='head'
   with self.assertRaises(ValueError):rig.validate(spec)
class CompareTests(unittest.TestCase):
 def test_identical_and_lighter_frame(self):
  from PIL import Image
  compare=module('compare_style')
  with tempfile.TemporaryDirectory() as d:
   d=Path(d);Image.new('RGB',(40,40),'#444444').save(d/'a.png');Image.new('RGB',(40,40),'#bbbbbb').save(d/'b.png')
   self.assertTrue(all(x==0 for x in compare.compare(d/'a.png',d/'a.png')['difference'].values()));self.assertGreater(compare.compare(d/'b.png',d/'a.png')['difference']['luma_mean'],0)
if __name__=='__main__':unittest.main()
