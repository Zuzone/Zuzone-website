#!/usr/bin/env python3
"""Zuzone promo, 16:9 (1920x1080): plates_promo_wide + desktop capture + captions_promo_wide + audio_promo -> out/zuzone_promo_v1_wide[.bed].mp4"""
import json, os, subprocess, bisect, shutil
ROOT='/Users/booga/Growth/zuzone/reel'; OUT=f'{ROOT}/out'; AUD=f'{ROOT}/audio_promo'; AUD0=f'{ROOT}/audio'
FR=f'{OUT}/desktop_frames'; FRP=FR; SEG=f'{OUT}/segments_promo_wide'; SHOTS=f'{OUT}/shots_promo_wide'; PL=f'{OUT}/plates_promo_wide'; CAPD=f'{OUT}/captions_promo_wide'
os.makedirs(SEG,exist_ok=True); os.makedirs(SHOTS,exist_ok=True)
SKIP=os.environ.get('SKIP_EXISTING')=='1'; NOVO=os.environ.get('NOVO')=='1'; VER=os.environ.get('VERSION','v1')
NAME=f'zuzone_promo_{VER}_wide'+('_bed' if NOVO else '')
ENC=['-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-r','30','-an']
def ff(*a): subprocess.run(['ffmpeg','-y','-loglevel','error',*a],check=True)
def load(fr):
    m=json.load(open(f'{fr}/manifest.json')); frames=m['frames']; marks={}
    for k in m['marks']: marks.setdefault(k['name'].split(':')[0],k['ts'])
    return frames,marks,[f['ts'] for f in frames]
F1,M1,T1=load(FR); F2,M2,T2=F1,M1,T1
def mk(marks,name,off=0): return marks[name]-marks['load']+off
def seq_clip(name,fr,frames,marks,ts,a,b):
    out=f'{SEG}/{name}.mp4'
    if SKIP and os.path.exists(out): return out
    d=f'{SEG}/seq_{name}'; shutil.rmtree(d,ignore_errors=True); os.makedirs(d); T0=marks['load']
    for k in range(round((b-a)*30)):
        i=max(0,bisect.bisect_right(ts,T0+a+k/30)-1); os.symlink(f"{fr}/f{frames[i]['i']:05d}.jpg",f'{d}/{k:05d}.jpg')
    ff('-framerate','30','-i',f'{d}/%05d.jpg','-vf','scale=1920:1080:flags=lanczos',*ENC,out); return out

def ensure_len(path,dur):
    """pad a segment with its last frame if it came out short (minterpolate drops tail frames)"""
    got=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',path],capture_output=True,text=True).stdout.strip() or 0)
    if got<dur-0.02:
        tmp=path+'.pad.mp4'; ff('-i',path,'-vf',f'tpad=stop_mode=clone:stop_duration={dur-got+0.1:.3f}','-t',f'{dur:.3f}',*ENC,tmp); os.replace(tmp,path)
    return path
def vfr_clip(name,fr,frames,marks,ts,a,b):
    out=f'{SEG}/{name}.mp4'
    if SKIP and os.path.exists(out): return out
    T0=marks['load']; sel=[f for f in frames if T0+a<=f['ts']<=T0+b]
    if len(sel)<4: return seq_clip(name,fr,frames,marks,ts,a,b)
    lst=f'{SEG}/{name}.txt'
    with open(lst,'w') as fh:
        for j,f in enumerate(sel):
            dur=(sel[j+1]['ts']-f['ts']) if j+1<len(sel) else 1/30
            fh.write(f"file '{fr}/f{f['i']:05d}.jpg'\nduration {max(dur,0.001):.4f}\n")
        fh.write(f"file '{fr}/f{sel[-1]['i']:05d}.jpg'\nduration 1.0\nfile '{fr}/f{sel[-1]['i']:05d}.jpg'\n")
    ff('-f','concat','-safe','0','-i',lst,'-vf',"scale=1920:1080:flags=lanczos,minterpolate='fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1'",'-t',f'{b-a:.3f}',*ENC,out); return ensure_len(out,b-a)
def plate(name,src,dur):
    out=f'{SEG}/{name}.mp4'
    if SKIP and os.path.exists(out): return out
    ff('-i',src,'-t',str(dur),'-vf','scale=1920:1080',*ENC,out); return out
segs=[]
segs.append(('s01',plate('s01',f'{PL}/hookfast.mp4',3.0),3.0))
ga=vfr_clip('s02a',FR,F1,M1,T1,mk(M1,'globe_ready',6.0),mk(M1,'globe_ready',10.0)); gl=seq_clip('s02b',FRP,F2,M2,T2,mk(M2,'list_open',0.3),mk(M2,'list_open',2.3))
with open(f'{SEG}/s02.txt','w') as f: f.write(f"file '{ga}'\nfile '{gl}'\n")
if not (SKIP and os.path.exists(f'{SEG}/s02.mp4')): ff('-f','concat','-safe','0','-i',f'{SEG}/s02.txt','-c','copy',f'{SEG}/s02.mp4')
segs.append(('s02',f'{SEG}/s02.mp4',6.0))
va=seq_clip('s03a',FR,F1,M1,T1,mk(M1,'tap_pin',-0.75),mk(M1,'tap_pin',0.05)); vb=seq_clip('s03b',FR,F1,M1,T1,mk(M1,'tap_pin',1.0),mk(M1,'tap_pin',3.0))
if not (SKIP and os.path.exists(f'{SEG}/s03c.mp4')): ff('-sseof','-0.05','-i',vb,'-frames:v','1','-q:v','2',f'{SEG}/s03_last.jpg'); ff('-loop','1','-i',f'{SEG}/s03_last.jpg','-t','1.2','-vf','scale=1920:1080',*ENC,f'{SEG}/s03c.mp4')
with open(f'{SEG}/s03.txt','w') as f: f.write(f"file '{va}'\nfile '{vb}'\nfile '{SEG}/s03c.mp4'\n")
if not (SKIP and os.path.exists(f'{SEG}/s03.mp4')): ff('-f','concat','-safe','0','-i',f'{SEG}/s03.txt','-c','copy',f'{SEG}/s03.mp4')
segs.append(('s03',f'{SEG}/s03.mp4',4.0))
GA=float(os.environ.get('GANTT_OFF','-1.0')); segs.append(('s04',seq_clip('s04',FR,F1,M1,T1,mk(M1,'gantt_open',GA),mk(M1,'gantt_open',GA+4.0)),4.0))
segs.append(('s05',seq_clip('s05',FR,F1,M1,T1,mk(M1,'zupulse_open',0.5),mk(M1,'zupulse_open',4.5)),4.0))
segs.append(('s06',seq_clip('s06',FR,F1,M1,T1,mk(M1,'newsletter_type',-0.2),mk(M1,'newsletter_type',2.8)),3.0))
segs.append(('s07',seq_clip('s07',FR,F1,M1,T1,mk(M1,'why_scroll',0.5),mk(M1,'why_scroll',4.5)),4.0))
segs.append(('s08',seq_clip('s08',FRP,F2,M2,T2,mk(M2,'add_tap',-1.0),mk(M2,'add_tap',3.0)),4.0))
segs.append(('s09',plate('s09',f'{PL}/lockup2.mp4',8.0),8.0))
segs.append(('s10',plate('s10',f'{PL}/tagline.mp4',3.0),3.0))
segs.append(('s11',plate('s11',f'{PL}/end.mp4',5.0),5.0))
TOTAL=sum(d for _,_,d in segs); assert abs(TOTAL-48)<0.01, TOTAL
with open(f'{SEG}/all.txt','w') as f: f.write(''.join(f"file '{p}'\n" for _,p,_ in segs))
if not (SKIP and os.path.exists(f'{SEG}/video_nocap.mp4')): ff('-f','concat','-safe','0','-i',f'{SEG}/all.txt','-c','copy',f'{SEG}/video_nocap.mp4')
starts={}; t=0.0
for n,_,d in segs: starts[n]=t; t+=d
CAP=[('p01','s01',0.3,2.9),('p02','s02',0.4,5.9),('p03','s03',0.3,3.9),('p04','s04',0.3,3.9),('p05','s05',0.3,3.9),('p06','s06',0.3,2.9),('p07','s07',0.3,3.9),('p08','s08',0.3,3.9),('p09','s09',0.3,7.9)]
if not (SKIP and os.path.exists(f'{SEG}/video_cap.mp4')):
    inputs=['-i',f'{SEG}/video_nocap.mp4']; fc=[]; last='[0:v]'
    for i,(c,s,a,b) in enumerate(CAP,1):
        inputs+=['-loop','1','-i',f'{CAPD}/{c}.png']; A=starts[s]+a; B=starts[s]+b
        fc.append(f"[{i}:v]format=rgba,fade=in:st={A:.2f}:d=0.2:alpha=1,fade=out:st={B-0.2:.2f}:d=0.2:alpha=1,setpts=PTS-STARTPTS[c{i}]")
        fc.append(f"{last}[c{i}]overlay=0:0:enable='between(t,{A:.2f},{B:.2f})'[v{i}]"); last=f'[v{i}]'
    ff(*inputs,'-filter_complex',';'.join(fc),'-map',last,'-t',str(TOTAL),*ENC,f'{SEG}/video_cap.mp4')
VO=[('p01',0.4),('p02',3.4),('p03',9.3),('p04',13.3),('p05',17.3),('p06',21.3),('p07',24.3),('p08',28.3),('p09',32.3),('p10',40.3)]
ff('-i',f'{AUD0}/sfx_tock.mp3','-af','apad=whole_dur=0.8','-t','0.8',f'{SEG}/tock08.wav')
ff('-stream_loop','59','-i',f'{SEG}/tock08.wav','-t',str(TOTAL),f'{SEG}/tocks.wav')
ain=['-i',f'{AUD}/music.mp3','-i',f'{SEG}/tocks.wav']; af=[f"[0:a]volume=0.22,afade=t=out:st={TOTAL-1.6:.1f}:d=1.6[m]","[1:a]volume=0.55[tk]"]; mix=['[m]','[tk]']
for i,(v,at) in enumerate(([] if NOVO else VO),2): ain+=['-i',f'{AUD}/{v}.mp3']; af.append(f'[{i}:a]volume=1.0,adelay={int(at*1000)}|{int(at*1000)}[v{i}]'); mix.append(f'[v{i}]')
k=len(ain)//2; ain+=['-i',f'{AUD0}/sfx_whoosh.mp3']; af.append(f'[{k}:a]volume=0.6,adelay=2800|2800[wh]'); mix.append('[wh]'); k+=1
ain+=['-i',f'{AUD0}/sfx_ding.mp3']; af.append(f'[{k}:a]volume=0.7,adelay=46400|46400[dg]'); mix.append('[dg]')
af.append(''.join(mix)+f'amix=inputs={len(mix)}:normalize=0:duration=first,alimiter=limit=0.95[a]')
ff(*ain,'-filter_complex',';'.join(af),'-map','[a]','-t',str(TOTAL),'-ar','44100','-ac','2',f'{SEG}/mix{"_bed" if NOVO else ""}.wav')
ff('-i',f'{SEG}/video_cap.mp4','-i',f'{SEG}/mix{"_bed" if NOVO else ""}.wav','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',f'{OUT}/{NAME}.mp4')
ff('-i',f'{OUT}/{NAME}.mp4','-vf','scale=1280:720','-c:v','libx264','-crf','24','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',f'{OUT}/{NAME}_720.mp4')
for n,_,d in ([] if NOVO else segs):
    a=starts[n]; ff('-ss',f'{a:.3f}','-i',f'{OUT}/{NAME}.mp4','-t',f'{d:.3f}','-vf','scale=720:405','-c:v','libx264','-crf','25','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',f'{SHOTS}/{n}.mp4')
    ff('-ss',f'{a+min(1.0,d/2):.3f}','-i',f'{OUT}/{NAME}.mp4','-frames:v','1','-vf','scale=720:405','-q:v','4',f'{SHOTS}/{n}.jpg')
json.dump({'segments':[{'id':n,'start':starts[n],'dur':d} for n,_,d in segs]},open(f'{OUT}/promo_wide_manifest.json','w'),indent=1)
print('done',NAME,TOTAL)
