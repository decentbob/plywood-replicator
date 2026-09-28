"""Render actual paired-D polygons from the archived mechanical assay."""
import gzip, hashlib, json, math, sys, time
from pathlib import Path
from html import escape
from PIL import Image, ImageDraw, ImageFont

started = time.process_time()
raw_path, stem = map(Path, sys.argv[1:3])
paths = [Path(str(stem)+s) for s in ('.report.json','.svg','.png')]
assert not any(p.exists() for p in paths), 'Refusing overwrite'
raw = json.loads(gzip.decompress(raw_path.read_bytes()))
assert raw['complete']
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
WIDTH, HEIGHT = 1200, 760
im = Image.new('RGB',(WIDTH*2,HEIGHT*2),'white'); draw = ImageDraw.Draw(im)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}">',
       '<title>Two complete prepared D assemblies under motion and imposed release</title>',
       '<rect width="1200" height="760" fill="white"/>']
def text(x,y,value,size=16,color='#253345'):
    try: font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf',size*2)
    except OSError: font = ImageFont.load_default()
    draw.text((2*x,2*y),value,font=font,fill=color)
    svg.append(f'<text x="{x}" y="{y+size}" font-family="Arial,sans-serif" font-size="{size}" fill="{color}">{escape(value)}</text>')
def poly(points,fill):
    draw.polygon([(2*x,2*y) for x,y in points],fill=fill,outline='#253345',width=2)
    svg.append(f'<polygon points="{" ".join(f"{x:.3f},{y:.3f}" for x,y in points)}" fill="{fill}" stroke="#253345" stroke-width="1"/>')
def line(a,b):
    draw.line((2*a[0],2*a[1],2*b[0],2*b[1]),fill='#a54388',width=4)
    svg.append(f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}" stroke="#a54388" stroke-width="2"/>')
text(24,14,'Two complete D-shaped assemblies with identical curved W blocks',25)
text(24,51,'Actual geometry | seed 761 | 16 solver passes | purple: temporary copying-face bonds',16)
panels=[]
for row,mode in enumerate(('body16','individual16')):
    rec=next(c for c in raw['records'] if c['job']==dict(seed=761,mode=mode,arm='closed'))
    for col,t in enumerate((0,40,120)):
        sample=rec['samples'][t]; f=sample['frame']; ids=rec['ids']; m=rec['metadata']
        shown=sum(ids['groups'],[]); points=[p for u in shown for p in f['polygons'][u]]
        minx,maxx=min(p[0] for p in points),max(p[0] for p in points)
        miny,maxy=min(p[1] for p in points),max(p[1] for p in points)
        scale=min(48,354/(maxx-minx),202/(maxy-miny));x0,y0=24+col*396,88+row*277
        xy=lambda p:(x0+180+(p[0]-(minx+maxx)/2)*scale,y0+128+(p[1]-(miny+maxy)/2)*scale)
        title=('Prepared pair','Held faces','After imposed release')[col]
        text(x0,y0,f'{"Body" if row==0 else "Individual"}: {title}, t={t}',16)
        for u in shown:
            kind={0:'A',4:'W',7:'P',8:'Q'}[m['types'][u]]
            color='#c4e7ce' if kind=='W' else '#f5d29a' if kind in ('P','Q') else '#dce7f2'
            poly([xy(p) for p in f['polygons'][u]],color)
            x,y=xy(f['centers'][u]);text(x-4,y-7,kind,11)
        bonds={tuple(p) for p in f['bonds']}
        for aa,bb in ids['faces']:
            if tuple(sorted((aa,bb))) not in bonds: continue
            u=aa//4;k=m['edgeOf'][m['types'][u]*4];ps=f['polygons'][u]
            line(xy(ps[k]),xy(ps[(k+1)%len(ps)]))
        q=sample['metrics']
        text(x0,y0+238,f'Pin {q["maxPin"]:.3f} | overlap {q["structuralOverlap"]:.3f} | gap {q["crossGap"]:.3f}',13)
        panels.append(dict(mode=mode,t=t,scale=scale))
text(24,661,'Each half: P-A-A-Q plus eight W wedges. Four conserved free E blocks are outside these cropped panels.',16)
text(24,689,'Both arcs and chains are prepared. Four copying-face bonds are removed experimentally after t40.',16)
text(24,717,'This tests shape and separation; it does not show autonomous growth, replication or a sealed protective wall.',16)
svg.append('</svg>');paths[1].write_bytes(('\n'.join(svg)+'\n').encode());im.save(paths[2])
closed=[r for r in raw['summary']['rows'] if r['arm']=='closed']
worst=max(((q['metrics']['structuralOverlap'],c['job'],q['frame']['t']) for c in raw['records'] if c['job']['arm']=='closed'
           for q in c['samples']),key=lambda x:x[0])
report=dict(command=sys.argv,sourceHash=sha(__file__),rawHash=sha(raw_path),passGate=raw['summary']['pass'],
    closedPassed=sum(r['pass'] for r in closed),closedWorlds=len(closed),worstStructuralOverlap=dict(value=worst[0],job=worst[1],t=worst[2]),
    design=raw['design'],rows=raw['summary']['rows'],panels=panels,
    figures=[dict(path=str(p).replace('\\','/'),sha256=sha(p)) for p in paths[1:]],cpuSeconds=time.process_time()-started,physicsSteps=0)
paths[0].write_bytes((json.dumps(report,indent=2)+'\n').encode())
print(json.dumps({k:report[k] for k in ('passGate','closedPassed','closedWorlds','worstStructuralOverlap','cpuSeconds')}))
