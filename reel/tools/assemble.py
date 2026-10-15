#!/usr/bin/env python3
"""Assemble the Zuzone rebrand reel: plates + captures + Seedance + captions + audio -> out/reel.mp4 and per-shot clips."""
import json, os, subprocess, bisect, shutil, sys
ROOT='/Users/booga/Growth/zuzone/reel'; OUT=f'{ROOT}/out'; AUD=f'{ROOT}/audio'
FR=f'{OUT}/new_frames5'; SEG=f'{OUT}/segments'; SHOTS=f'{OUT}/shots'
os.makedirs(SEG,exist_ok=True); os.makedirs(SHOTS,exist_ok=True)
ENC=['-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-r','30','-an']
SKIP=os.environ.get('SKIP_EXISTING')=='1'; NOVO=os.environ.get('NOVO')=='1'; VER=os.environ.get('VERSION','v1')
NAME=f'zuzone_reel_{VER}'+('_bed' if NOVO else '')
def run(cmd): subprocess.run(cmd,check=True)
def ff(*args): run(['ffmpeg','-y','-loglevel','error',*args])
m=json.load(open(f'{FR}/manifest.json')); frames=m['frames']; marks={}
for k in m['marks']: marks.setdefault(k['name'].split(':')[0],k['ts'])
T0=marks['load']; ts=[f['ts'] for f in frames]
def mk(name,off=0): return marks[name]-T0+off
def seq_clip(name,a,b):
    if SKIP and os.path.exists(f'{SEG}/{name}.mp4'): return f'{SEG}/{name}.mp4'
    """nearest-earlier screencast frame for every 1/30 s in [a,b] (seconds since load) -> mp4"""
    d=f'{SEG}/seq_{name}'; shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
    n=round((b-a)*30)
    for k in range(n):
        t=T0+a+k/30; i=bisect.bisect_right(ts,t)-1; i=max(0,i)
        os.symlink(f"{FR}/f{frames[i]['i']:05d}.jpg", f'{d}/{k:05d}.jpg')
    out=f'{SEG}/{name}.mp4'; ff('-framerate','30','-i',f'{d}/%05d.jpg','-vf','scale=1080:1920:flags=lanczos',*ENC,out); return out

def ensure_len(path,dur):
    """pad a segment with its last frame if it came out short (minterpolate drops tail frames)"""
    got=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',path],capture_output=True,text=True).stdout.strip() or 0)
    if got<dur-0.02:
        tmp=path+'.pad.mp4'; ff('-i',path,'-vf',f'tpad=stop_mode=clone:stop_duration={dur-got+0.1:.3f}','-t',f'{dur:.3f}',*ENC,tmp); os.replace(tmp,path)
    return path
def vfr_clip(name,a,b):
    if SKIP and os.path.exists(f'{SEG}/{name}.mp4'): return f'{SEG}/{name}.mp4'
    """distinct screencast frames in [a,b] with their real durations, motion-interpolated to 30 fps"""
    sel=[f for f in frames if T0+a<=f['ts']<=T0+b]
    if len(sel)<4: return seq_clip(name,a,b)
    lst=f'{SEG}/{name}.txt'
    with open(lst,'w') as fh:
        for j,f in enumerate(sel):
            dur=(sel[j+1]['ts']-f['ts']) if j+1<len(sel) else 1/30
            fh.write(f"file '{FR}/f{f['i']:05d}.jpg'\nduration {max(dur,0.001):.4f}\n")
        fh.write(f"file '{FR}/f{sel[-1]['i']:05d}.jpg'\nduration 1.0\nfile '{FR}/f{sel[-1]['i']:05d}.jpg'\n")
    out=f'{SEG}/{name}.mp4'
    ff('-f','concat','-safe','0','-i',lst,'-vf',"scale=1080:1920:flags=lanczos,minterpolate='fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1'",'-t',f'{b-a:.3f}',*ENC,out); return ensure_len(out,b-a)
OLDGRADE='eq=saturation=0.55:contrast=1.08:brightness=-0.02,vignette=PI/5'
def still_zoom(name,img,dur,z0,z1,fx,fy):
    if SKIP and os.path.exists(f'{SEG}/{name}.mp4'): return f'{SEG}/{name}.mp4'
    n=dur*30
    zp=f"zoompan=z='{z0}+({z1}-{z0})*on/{n}':x='iw*{fx}-(iw/zoom)*{fx}':y='ih*{fy}-(ih/zoom)*{fy}':d={n}:s=1080x1920:fps=30"
    out=f'{SEG}/{name}.mp4'; ff('-loop','1','-i',img,'-t',str(dur),'-vf',f'scale=2160:3840:flags=lanczos,{zp},{OLDGRADE}',*ENC,out); return out
def copy_plate(name,src,dur=None):
    if SKIP and os.path.exists(f'{SEG}/{name}.mp4'): return f'{SEG}/{name}.mp4'
    out=f'{SEG}/{name}.mp4'; args=['-i',src]+(['-t',str(dur)] if dur else [])+['-vf','scale=1080:1920',*ENC,out]; ff(*args); return out
segs=[]
# 1 hook (3) 2 old scroll (4) 3 crossword (2) 4 nav/tagline (3) 5 blank (2) 6 dots (4) 7 lime (3) 8 lockup (6) 9 flip (3)
segs.append(('s01',copy_plate('s01',f'{OUT}/plates/hook.mp4'),3.0))
(None if SKIP and os.path.exists(f'{SEG}/s02.mp4') else ff('-i',f'{OUT}/old/old_scroll.mp4','-vf',f'{OLDGRADE}',*ENC,f'{SEG}/s02.mp4')); segs.append(('s02',f'{SEG}/s02.mp4',4.0))
segs.append(('s03',still_zoom('s03',f'{OUT}/old/old_crossword.png',2,1.0,1.12,0.5,0.35),2.0))
segs.append(('s04',still_zoom('s04',f'{OUT}/old/old_top.png',3,1.0,1.7,0.42,0.1),3.0))
segs.append(('s05',copy_plate('s05',f'{OUT}/plates/blank.mp4'),2.0))
segs.append(('s06',copy_plate('s06',f'{OUT}/plates/dots.mp4'),4.0))
segs.append(('s07',copy_plate('s07',f'{OUT}/plates/lime.mp4'),3.0))
segs.append(('s08',copy_plate('s08',f'{OUT}/plates/lockup.mp4'),6.0))
segs.append(('s09',copy_plate('s09',f'{OUT}/plates/flip.mp4'),3.0))
# 10 globe (5) 11 village (4) 12 gantt (4) 13 zupulse (4) 14 trio (5)
segs.append(('s10',vfr_clip('s10',mk('globe_ready',0.2),mk('globe_ready',5.2)),5.0))
segs.append(('s11',seq_clip('s11',mk('tap_pin',-0.7),mk('tap_pin',3.3)),4.0))
segs.append(('s12',seq_clip('s12',mk('gantt_open',-1.3),mk('gantt_open',2.7)),4.0))
segs.append(('s13',seq_clip('s13',mk('zupulse_open',-0.8),mk('zupulse_open',3.2)),4.0))
trio=[seq_clip('s14a',mk('events_open',-0.4),mk('events_open',1.267)),seq_clip('s14b',mk('newsletter_type',0),mk('newsletter_type',1.667)),seq_clip('s14c',mk('why_scroll',0.3),mk('why_scroll',1.967))]
with open(f'{SEG}/trio.txt','w') as f: f.write(''.join(f"file '{p}'\n" for p in trio))
(None if SKIP and os.path.exists(f'{SEG}/s14.mp4') else ff('-f','concat','-safe','0','-i',f'{SEG}/trio.txt','-c','copy',f'{SEG}/s14.mp4')); segs.append(('s14',f'{SEG}/s14.mp4',5.0))
# 15 transition (4): Seedance if present, else split composite
sd=f'{OUT}/seedance_s15.mp4'
if SKIP and os.path.exists(f'{SEG}/s15.mp4'): pass
elif os.path.exists(sd):
    ff('-i',sd,'-vf','scale=1080:1920:flags=lanczos,setpts=0.8*PTS','-t','4',*ENC,f'{SEG}/s15.mp4')
else:
    base=seq_clip('s15base',mk('globe_ready',1.0),mk('globe_ready',5.0))
    ff('-i',base,'-loop','1','-i',f'{OUT}/old/old_top.png','-filter_complex',f"[1:v]scale=1080:1920,crop=540:1920:270:0,{OLDGRADE},format=rgba[o];[0:v][o]overlay=x='if(lt(t,2.4),0,-540*min(1,(t-2.4)/0.4))':y=0:shortest=1",'-t','4',*ENC,f'{SEG}/s15.mp4')
segs.append(('s15',f'{SEG}/s15.mp4',4.0))
segs.append(('s16',copy_plate('s16',f'{OUT}/plates/end.mp4'),4.0))
# concat video
with open(f'{SEG}/all.txt','w') as f: f.write(''.join(f"file '{p}'\n" for _,p,_ in segs))
ff('-f','concat','-safe','0','-i',f'{SEG}/all.txt','-c','copy',f'{SEG}/video_nocap.mp4')
# captions
starts={}; t=0.0
for n,_,d in segs: starts[n]=t; t+=d
CAP=[('c01','s01',0.3,2.9),('c02','s02',0.3,3.9),('c03','s03',0.15,1.9),('c04','s04',0.3,2.9),('c05','s05',0.3,1.9),('c06','s06',0.3,3.9),('c07','s07',0.3,2.9),('c08','s08',0.3,5.9),('c09','s09',0.2,2.9),('c10','s10',0.4,4.9),('c11','s11',0.3,3.9),('c12','s12',0.3,3.9),('c13','s13',0.3,3.9),('c14','s14',0.3,4.9),('c15','s15',0.4,3.9)]
inputs=['-i',f'{SEG}/video_nocap.mp4']; fc=[]; last='[0:v]'
for i,(c,s,a,b) in enumerate(CAP,1):
    inputs+=['-loop','1','-i',f'{OUT}/captions/{c}.png']; A=starts[s]+a; B=starts[s]+b
    fc.append(f"[{i}:v]format=rgba,fade=in:st={A:.2f}:d=0.2:alpha=1,fade=out:st={B-0.2:.2f}:d=0.2:alpha=1,setpts=PTS-STARTPTS[c{i}]")
    fc.append(f"{last}[c{i}]overlay=0:0:enable='between(t,{A:.2f},{B:.2f})'[v{i}]"); last=f'[v{i}]'
(None if SKIP and os.path.exists(f'{SEG}/video_cap.mp4') else ff(*inputs,'-filter_complex',';'.join(fc),'-map',last,'-t','60',*ENC,f'{SEG}/video_cap.mp4'))
# audio
VO=[('vo01',0.4),('vo02',4.0),('vo03',9.2),('vo04',12.4),('vo05',14.4),('vo06',18.3),('vo07',21.3),('vo08',30.6),('vo09',52.6)]
ff('-i',f'{AUD}/sfx_tock.mp3','-af','apad=whole_dur=0.8','-t','0.8',f'{SEG}/tock08.wav')
ff('-stream_loop','74','-i',f'{SEG}/tock08.wav','-t','60',f'{SEG}/tocks.wav')
ain=['-i',f'{AUD}/music.mp3','-i',f'{SEG}/tocks.wav']; af=["[0:a]volume='if(between(t,12,14),0,0.22)':eval=frame,afade=t=out:st=58.5:d=1.5[m]","[1:a]volume=0.55[tk]"]; mix=['[m]','[tk]']
for i,(v,at) in enumerate(([] if NOVO else VO),2): ain+=['-i',f'{AUD}/{v}.mp3']; af.append(f'[{i}:a]volume=1.0,adelay={int(at*1000)}|{int(at*1000)}[v{i}]'); mix.append(f'[v{i}]')
k=len(ain)//2; ain+=['-i',f'{AUD}/sfx_whoosh.mp3']; af.append(f'[{k}:a]volume=0.6,adelay=29800|29800[wh]'); mix.append('[wh]'); k+=1
ain+=['-i',f'{AUD}/sfx_ding.mp3']; af.append(f'[{k}:a]volume=0.7,adelay=58400|58400[dg]'); mix.append('[dg]')
af.append(''.join(mix)+f'amix=inputs={len(mix)}:normalize=0:duration=first,alimiter=limit=0.95[a]')
ff(*ain,'-filter_complex',';'.join(af),'-map','[a]','-t','60','-ar','44100','-ac','2',f'{SEG}/mix.wav')
ff('-i',f'{SEG}/video_cap.mp4','-i',f'{SEG}/mix.wav','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',f'{OUT}/{NAME}.mp4')
# web versions + per-shot clips with their captions and posters
ff('-i',f'{OUT}/{NAME}.mp4','-vf','scale=720:1280','-c:v','libx264','-crf','24','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',f'{OUT}/{NAME}_720.mp4')
for n,_,d in ([] if NOVO else segs):
    a=starts[n]; ff('-ss',f'{a:.3f}','-i',f'{OUT}/{NAME}.mp4','-t',f'{d:.3f}','-vf','scale=540:960','-c:v','libx264','-crf','25','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',f'{SHOTS}/{n}.mp4')
    ff('-ss',f'{a+min(1.0,d/2):.3f}','-i',f'{OUT}/{NAME}.mp4','-frames:v','1','-vf','scale=540:960','-q:v','4',f'{SHOTS}/{n}.jpg')
json.dump({'segments':[{'id':n,'start':starts[n],'dur':d} for n,_,d in segs],'seedance':os.path.exists(sd)},open(f'{OUT}/reel_manifest.json','w'),indent=1)
print('done', NAME, 'seedance' if os.path.exists(sd) else 'composite', sum(d for _,_,d in segs))
