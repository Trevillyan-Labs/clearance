import json, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

src=Path('/private/tmp/clearance-video-capture')
out=Path('/private/tmp/clearance-video-render')
frames=json.loads((src/'manifest.json').read_text())['frames']
groups={}
for f in frames:
    if f.get('shot'): groups.setdefault(f['shot'],[]).append(f)
font='/System/Library/Fonts/Supplemental/Arial.ttf'
bold='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
def text(draw,xy,s,size=32,color='#edf4f2',heavy=False):
    draw.text(xy,s,font=ImageFont.truetype(bold if heavy else font,size),fill=color)
def card(name,title,subtitle,closing=False):
    im=Image.new('RGB',(1920,1080),'#102e2a');d=ImageDraw.Draw(im)
    d.rounded_rectangle((110,140,1810,940),radius=35,outline='#46766d',width=3)
    text(d,(180,210),'TREVILLYAN LABS  /  CLEARANCE',27,'#a9c8be',True)
    text(d,(180,355),title,100,heavy=True)
    text(d,(185,505),subtitle,44,'#c7ddd6')
    text(d,(185,665),'Share the brain. Isolate the context.',48,'#ecc279',True)
    text(d,(185,835),'Built by Bill Trevillyan  |  Ask Bill for a walkthrough' if closing else 'A real prototype demo  |  Synthetic company data',28,'#a9c8be')
    im.save(out/name)
card('title.png','Clearance','Useful agents. Precise permissions.')
card('closing.png','More autonomy.','Less unnecessary access.',True)
scenes=[
 ('title',7,None,'',''),
 ('overview',14,None,'One company brain. Different permissions.','Synthetic company data | Real application states'),
 ('mission-start',8,None,'Five workers. Two client proposals.','Real model execution | Generation time shortened'),
 ('beacon-context',15,None,'Shared firm knowledge. Separate client context.','Connections show sources actually admitted to the selected worker'),
 ('executive-comparison',13,(1230,0,1900,510),'Same document. Different clearance.','Intern denied | Chief of staff permitted | Actual policy evaluation'),
 ('scope-comparison',10,(1230,0,1900,510),'High clearance is not a master key.','Neither profile has access to the client compartment'),
 ('approval-request',17,(50,180,1850,650),'A precise approval, not a blanket upgrade.','One worker | One document version | One read | Expiring grant'),
 ('approval-consumed',8,None,'Approve the read. Resume the work.','Real approval and worker execution | Generation time shortened'),
 ('pricing-manifest',8,(1230,0,1900,620),'New context. Same C2 clearance.','The restricted policy is recorded in the worker input manifest'),
 ('internal-delivery',11,(1310,180,1845,605),'Useful software, with inherited restrictions.','Both proposals passed 19 checks | Internal partner delivery succeeds'),
 ('calculator-actual',12,(400,50,1500,840),'Ten percent discount. Commercial review required.','$63,000 proposed fees | 33.333% margin | Below the 35% floor'),
 ('public-refusal',9,(1310,180,1845,605),'Permission follows the work product.','Public delivery blocked by the actual delivery policy'),
 ('architecture',21,(375,195,1525,940),'Small architecture. Explicit permission checks.','Vercel + authenticated tunnel + Mac orchestrator | HydraDB | Separate histories'),
 ('closing',21,None,'','')]
lines=['ffconcat version 1.0'];timeline=[];elapsed=0
def add(file,duration):
    lines.extend(["file '"+str(file)+"'",f'duration {duration:.6f}'])
def compose(file,name,index,crop,title,caption):
    im=Image.open(file).convert('RGB')
    if crop: im=im.crop(crop)
    canvas=Image.new('RGB',(1920,1080),'#102e2a');d=ImageDraw.Draw(canvas)
    fit=ImageOps.contain(im,(1840,860))
    canvas.paste(fit,((1920-fit.width)//2,115+(860-fit.height)//2))
    text(d,(40,32),title,39,heavy=True)
    text(d,(42,1005),caption,27,'#c7ddd6')
    dst=out/f'{name}-{index:04d}.png';canvas.save(dst);return dst
for name,duration,crop,title,caption in scenes:
    timeline.append({'scene':name,'start':elapsed,'duration':duration,'title':title,'caption':caption});elapsed+=duration
    if name in ['title','closing']:add(out/f'{name}.png',duration);continue
    if name=='overview': chosen=[groups['beacon-context'][-1]]
    elif name=='approval-request':chosen=[groups['mission-start'][-1]]
    else:chosen=groups[name]
    if len(chosen)>2: chosen=chosen[1:]
    durations=[min(.4,max(.042,chosen[i+1]['timestamp']-f['timestamp'])) for i,f in enumerate(chosen[:-1])]
    scale=min(1,(duration-2)/sum(durations)) if durations else 1
    durations=[v*scale for v in durations];durations.append(duration-sum(durations))
    for i,(f,hold) in enumerate(zip(chosen,durations)):
        add(compose(src/f['name'],name,i,crop,title,caption),hold)
lines.append(lines[-2])
(out/'edit.ffconcat').write_text('\n'.join(lines)+'\n')
(out/'timeline.json').write_text(json.dumps(timeline,indent=2))
subprocess.run(['/opt/homebrew/bin/ffmpeg','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',str(out/'edit.ffconcat'),'-vf','fps=24,format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','20','-t','174','-movflags','+faststart','-an','-y',str(out/'clearance-silent-cut.mp4')],check=True)
print(json.dumps({'video':str(out/'clearance-silent-cut.mp4'),'seconds':elapsed,'scenes':len(scenes)}))
