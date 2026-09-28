"""Render actual assay corners; Pillow only. No simulation or image generation."""
import gzip, hashlib, json, math, sys, time
from pathlib import Path
from html import escape
from PIL import Image, ImageDraw, ImageFont

started = time.process_time()
raw_path, stem = map(Path, sys.argv[1:3])
targets = [Path(str(stem) + suffix) for suffix in ('.report.json', '.svg', '.png')]
assert not any(p.exists() for p in targets), 'Refusing overwrite'
raw = json.loads(gzip.decompress(raw_path.read_bytes()))
assert raw['complete'] and raw['summary']['pass']
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
rows = raw['summary']['rows']
summary = []
for fixture in ('Pattach', 'Qattach', 'Pextend', 'Qextend', 'M+', 'M-'):
    rs = [r for r in rows if r['fixture'] == fixture and r['arm'] == 'on']
    summary.append(dict(fixture=fixture, passed=sum(r['pass'] for r in rs), worlds=len(rs),
        **{k: max(r[k] for r in rs) for k in ('maxPin', 'maxOverlap', 'tailPin', 'tailOverlap', 'tailProbeOverlap', 'tailProbePin')}))
worst = max(((q['metrics']['overlap'], c, q) for c in raw['records'] if c['job']['arm'] == 'on'
             for q in c['samples']), key=lambda x: x[0])

W, H = 1120, 710
im = Image.new('RGB', (W * 2, H * 2), 'white')
draw = ImageDraw.Draw(im)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
       '<title>Prepared angled W extension, transient overlap and final fit</title>', '<rect width="1120" height="710" fill="white"/>']
def text(x, y, value, size=16, color='#253345'):
    try:
        font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', size * 2)
    except OSError:
        font = ImageFont.load_default()
    draw.text((2*x, 2*y), value, font=font, fill=color)
    svg.append(f'<text x="{x}" y="{y+size}" font-family="Arial,sans-serif" font-size="{size}" fill="{color}">{escape(value)}</text>')
def poly(points, fill, stroke='#253345', ghost=False):
    ps = [(x*2, y*2) for x,y in points]
    if not ghost:
        draw.polygon(ps, fill=fill, outline=stroke, width=3)
    else:
        for a,b in zip(ps, ps[1:]+ps[:1]):
            d = math.dist(a,b)
            for t in range(0, max(1, math.ceil(d)), 12):
                p = min(1, t/d) if d else 0
                q = min(1, (t+6)/d) if d else 1
                draw.line((a[0]+p*(b[0]-a[0]),a[1]+p*(b[1]-a[1]),a[0]+q*(b[0]-a[0]),a[1]+q*(b[1]-a[1])), fill=stroke, width=3)
    dash = ' stroke-dasharray="5 4"' if ghost else ''
    svg.append(f'<polygon points="{" ".join(f"{x:.3f},{y:.3f}" for x,y in points)}" fill="{"none" if ghost else fill}" stroke="{stroke}" stroke-width="1.5"{dash}/>')

text(24, 16, 'Angled W attachments: alignment and room for another block', 24)
text(24, 49, 'Actual polygons | seed 733 | individual kicks, 16 solver passes | prepared bonds, physics only', 16)
panels = []
for row, fixture in enumerate(('Pextend', 'Qextend')):
    rec = next(c for c in raw['records'] if c['job'] == dict(fixture=fixture, seed=733, mode='individual16', arm='on'))
    worst_t = max(range(1,61), key=lambda t: rec['samples'][t]['metrics']['overlap'])
    for col,t in enumerate((0,worst_t,60)):
        sample = rec['samples'][t]; frame = sample['frame']; ids = rec['ids']
        shown = [u for u in range(5) if u != ids['probe']]
        ps = [p for u in shown for p in frame['polygons'][u]] + sample['metrics']['probe']['polygon']
        minx,maxx = min(p[0] for p in ps),max(p[0] for p in ps)
        miny,maxy = min(p[1] for p in ps),max(p[1] for p in ps)
        scale = min(105, 310/(maxx-minx), 170/(maxy-miny))
        x0,y0 = 24+col*368, 88+row*260
        xy = lambda p: (x0+174+(p[0]-(minx+maxx)/2)*scale, y0+123+(p[1]-(miny+maxy)/2)*scale)
        title = ('Prepared angle', 'Largest overlap', 'Final geometry')[col]
        text(x0,y0,f'{fixture[0]} end: {title}, t={t}',17)
        for u in shown:
            kind = {0:'A',4:'W',7:'P',8:'Q'}[rec['metadata']['types'][u]]
            color = '#96d3ab' if u == ids['v'] else '#c9e8d2' if kind == 'W' else '#c5dcf2' if kind in ('P','Q') else '#e2e8f0'
            poly([xy(p) for p in frame['polygons'][u]],color)
            cx,cy = xy(frame['centers'][u]);text(cx-5,cy-9,kind,15)
        poly([xy(p) for p in sample['metrics']['probe']['polygon']],None, '#5d748c',True)
        text(x0,y0+221,f'Overlap {sample["metrics"]["overlap"]:.4f}; pin error {sample["metrics"]["pin"]:.4f}',14)
        panels.append(dict(fixture=fixture,t=t,scale=scale,shown=shown))
text(24,622,'Dashed polygon: possible placement of the existing spare W, measured without moving or bonding it.',16)
text(24,649,'All 24 bound worlds pass the final 10-frame gate; 0/24 unbound controls maintain edge alignment.',16)
text(24,676,'Temporary overlap remains. This is a mechanical fixture, not autonomous growth or a complete half-cell.',16)
svg.append('</svg>')
targets[1].write_text('\n'.join(svg)+'\n',encoding='utf-8')
im.save(targets[2])
report = dict(command=sys.argv,sourceHash=sha(__file__),rawHash=sha(raw_path),summary=summary,
    worstOverlap=dict(value=worst[0],job=worst[1]['job'],t=worst[2]['frame']['t']),panels=panels,
    figures=[dict(path=str(p).replace('\\','/'),sha256=sha(p)) for p in targets[1:]],
    cpuSeconds=time.process_time()-started,physicsSteps=0)
targets[0].write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(worstOverlap=report['worstOverlap'],cpuSeconds=report['cpuSeconds'],figures=report['figures'])))
