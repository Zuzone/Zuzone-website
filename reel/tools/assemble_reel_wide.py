#!/usr/bin/env python3
"""Rebrand reel, 16:9 (1920x1080): same 16 shots, durations, captions and audio as the approved 9:16 v2.
Platform shots come from the desktop capture; the old site from out/old_wide; plates from out/plates_wide;
audio is taken from the 9:16 masters so both formats sound identical."""
import json, os, subprocess, bisect, shutil
ROOT='/Users/booga/Growth/zuzone/reel'; OUT=f'{ROOT}/out'
FR=f'{OUT}/desktop_frames'; SEG=f'{OUT}/segments_reel_wide'; PW=f'{OUT}/plates_wide'; CAPD=f'{OUT}/captions_wide'; SPW=f'{OUT}/segments_promo_wide'; OLD=f'{OUT}/old_wide'
SKIP=os.environ.get('SKIP_EXISTING')=='1'; VER=os.environ.get('VERSION','v2')
os.makedirs(SEG,exist_ok=True)
ENC=['-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-r','30','-an']
def ff(*a): subprocess.run(['ffmpeg','-y','-loglevel','error',*a],check=True)
def dur(p): return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout.strip() or 0)
m=json.load(open(f'{FR}/manifest.json')); frames=m['frames']; ts=[f['ts'] for f in frames]; marks={}
for k in m['marks']: marks.setdefault(k['name'].split(':')[0],k['ts'])
T0=marks['load']
def mk(name,off=0): return marks[name]-T0+off
def ensure_len(path,d):
    got=dur(path)
    if got<d-0.02:
        tmp=path+'.pad.mp4'; ff('-i',path,'-vf',f'tpad=stop_mode=clone:stop_duration={d-got+0.1:.3f}','-t',f'{d:.3f}',*ENC,tmp); os.replace(tmp,path)
    return path
def seq_clip(name,a,b):
    out=f'{SEG}/{name}.mp4'
    if SKIP and os.path.exists(out): return out
    d=f'{SEG}/seq_{name}'; shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
    for k in range(round((b-a)*30)):
        i=max(0,bisect.bisect_right(ts,T0+a+k/30)-1); os.symlink(f"{FR}/f{frames[i]['i']:05d}.jpg",f'{d}/{k:05d}.jpg')
    ff('-framerate','30','-i',f'{d}/%05d.jpg','-vf','scale=1920:1080:flags=lanczos',*ENC,out); return out
def vfr_clip(name,a,b):
    out=f'{SEG}/{name}.mp4'
    if SKIP and os.path.exists(out): return out
    sel=[f for f in frames if T0+a<=f['ts']<=T0+b]
    lst=f'{SEG}/{name}.txt'
    with open(lst,'w') as fh:
        for j,f in enumerate(sel):
            dd=(sel[j+1]['ts']-f['ts']) if j+1<len(sel) else 1/30
            fh.write(f"file '{FR}/f{f['i']:05d}.jpg'\nduration {max(dd,0.001):.4f}\n")
        fh.write(f"file '{FR}/f{sel[-1]['i']:05d}.jpg'\nduration 1.0\nfile '{FR}/f{sel[-1]['i']:05d}.jpg'\n")
    ff('-f','concat','-safe','0','-i',lst,'-vf',"scale=1920:1080:flags=lanczos,minterpolate='fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1'",'-t',f'{b-a:.3f}',*ENC,out)
    return ensure_len(out,b-a)
OLDGRADE='eq=saturation=0.55:contrast=1.08:brightness=-0.02,vignette=PI/5'
def still_zoom(name,img,d,z0,z1,fx,fy):
    out=f'{SEG}/{name}.mp4'
    if SKIP and os.path.exists(out): return out
    n=d*30; zp=f"zoompan=z='{z0}+({z1}-{z0})*on/{n}':x='iw*{fx}-(iw/zoom)*{fx}':y='ih*{fy}-(ih/zoom)*{fy}':d={n}:s=1920x1080:fps=30"
    ff('-loop','1','-i',img,'-t',str(d),'-vf',f'scale=3840:2160:flags=lanczos,{zp},{OLDGRADE}',*ENC,out); return out
def plate(name,d):
    out=f'{SEG}/p_{name}.mp4'
    if SKIP and os.path.exists(out): return out
    ff('-i',f'{PW}/{name}.mp4','-t',str(d),'-vf','scale=1920:1080',*ENC,out); return out
def concat(name,parts):
    out=f'{SEG}/{name}.mp4'
    with open(f'{SEG}/{name}.txt','w') as f: f.write(''.join(f"file '{p}'\n" for p in parts))
    ff('-f','concat','-safe','0','-i',f'{SEG}/{name}.txt','-c','copy',out); return out
segs=[]
segs.append(('s01',plate('hook',3.0),3.0))
s02=f'{SEG}/s02.mp4'
if not (SKIP and os.path.exists(s02)): ff('-i',f'{OLD}/old_scroll.mp4','-vf',OLDGRADE,*ENC,s02)
segs.append(('s02',s02,4.0))
segs.append(('s03',still_zoom('s03',f'{OLD}/old_crossword.png',2,1.0,1.12,0.5,0.4),2.0))
segs.append(('s04',still_zoom('s04',f'{OLD}/old_top.png',3,1.0,1.6,0.5,0.12),3.0))
segs.append(('s05',plate('blank',2.0),2.0))
segs.append(('s06',plate('dots',4.0),4.0))
segs.append(('s07',plate('lime',3.0),3.0))
segs.append(('s08',plate('lockup',6.0),6.0))
segs.append(('s09',plate('flip',3.0),3.0))
segs.append(('s10',vfr_clip('s10',mk('globe_ready',0.2),mk('globe_ready',5.2)),5.0))
segs.append(('s11',f'{SPW}/village.mp4',4.0))
segs.append(('s12',f'{SPW}/gantt.mp4',4.0))
segs.append(('s13',f'{SPW}/zupulse.mp4',4.0))
trio=[seq_clip('s14a',mk('events_open',-1.45),mk('events_open',0.217)),seq_clip('s14b',mk('newsletter_typed',-1.5),mk('newsletter_typed',0.167)),seq_clip('s14c',mk('why_scroll',0.3),mk('why_scroll',1.967))]
segs.append(('s14',concat('s14',trio),5.0))
sd=f'{OUT}/seedance_s15_wide.mp4'; s15=f'{SEG}/s15.mp4'
if os.path.exists(sd): ff('-i',sd,'-vf','scale=1920:1080:flags=lanczos,setpts=0.8*PTS','-t','4',*ENC,s15)
else:
    base=vfr_clip('s15base',mk('globe_ready',1.0),mk('globe_ready',5.0))
    ff('-i',base,'-loop','1','-i',f'{OLD}/old_top.png','-filter_complex',f"[1:v]scale=1920:1080,crop=960:1080:0:0,{OLDGRADE},format=rgba[o];[0:v][o]overlay=x='if(lt(t,2.4),0,-960*min(1,(t-2.4)/0.4))':y=0:shortest=1",'-t','4',*ENC,s15)
ensure_len(s15,4.0); segs.append(('s15',s15,4.0))
segs.append(('s16',plate('end',4.0),4.0))
TOTAL=sum(d for _,_,d in segs); assert abs(TOTAL-60)<0.01, TOTAL
for n,p,d in segs:
    got=dur(p); assert abs(got-d)<0.05,(n,got,d)
concat('video_nocap',[p for _,p,_ in segs])
starts={}; t=0.0
for n,_,d in segs: starts[n]=t; t+=d
CAP=[('c01','s01',0.3,2.9),('c02','s02',0.3,3.9),('c03','s03',0.15,1.9),('c04','s04',0.3,2.9),('c05','s05',0.3,1.9),('c06','s06',0.3,3.9),('c07','s07',0.3,2.9),('c08','s08',0.3,5.9),('c09','s09',0.2,2.9),('c10','s10',0.4,4.9),('c11','s11',0.3,3.9),('c12','s12',0.3,3.9),('c13','s13',0.3,3.9),('c14','s14',0.3,4.9),('c15','s15',0.4,3.9)]
inputs=['-i',f'{SEG}/video_nocap.mp4']; fc=[]; last='[0:v]'
for i,(c,s,a,b) in enumerate(CAP,1):
    inputs+=['-loop','1','-i',f'{CAPD}/{c}.png']; A=starts[s]+a; B=starts[s]+b
    fc.append(f"[{i}:v]format=rgba,fade=in:st={A:.2f}:d=0.2:alpha=1,fade=out:st={B-0.2:.2f}:d=0.2:alpha=1,setpts=PTS-STARTPTS[c{i}]")
    fc.append(f"{last}[c{i}]overlay=0:0:enable='between(t,{A:.2f},{B:.2f})'[v{i}]"); last=f'[v{i}]'
ff(*inputs,'-filter_complex',';'.join(fc),'-map',last,'-t','60',*ENC,f'{SEG}/video_cap.mp4')
for src,name in [(f'{OUT}/zuzone_reel_{VER}.mp4',f'zuzone_reel_{VER}_wide'),(f'{OUT}/zuzone_reel_{VER}_bed.mp4',f'zuzone_reel_{VER}_wide_bed')]:
    ff('-i',f'{SEG}/video_cap.mp4','-i',src,'-map','0:v','-map','1:a','-c:v','copy','-c:a','copy','-shortest','-movflags','+faststart',f'{OUT}/{name}.mp4')
    ff('-i',f'{OUT}/{name}.mp4','-vf','scale=1280:720','-c:v','libx264','-crf','24','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',f'{OUT}/{name}_720.mp4')
json.dump({'segments':[{'id':n,'start':starts[n],'dur':d} for n,_,d in segs],'seedance':os.path.exists(sd)},open(f'{OUT}/reel_wide_manifest.json','w'),indent=1)
print('done', 'seedance' if os.path.exists(sd) else 'composite', TOTAL)
