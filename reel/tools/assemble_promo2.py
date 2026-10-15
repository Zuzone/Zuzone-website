#!/usr/bin/env python3
"""Zuzone promo v2 (58 s, client feedback: independent hubs / shared zone). WIDE=1 for 16:9. Reuses cached platform segments (globe, list, village, gantt, zupulse, newsletter, history, addvillage)."""
import json, os, subprocess
ROOT='/Users/booga/Growth/zuzone/reel'; OUT=f'{ROOT}/out'; AUD=f'{ROOT}/audio_promo2'; AUD0=f'{ROOT}/audio'
WIDE=os.environ.get('WIDE')=='1'; NOVO=os.environ.get('NOVO')=='1'; VER=os.environ.get('VERSION','v2'); SKIP=os.environ.get('SKIP_EXISTING')=='1'
SEG=f'{OUT}/segments_promo'+('_wide' if WIDE else ''); PL=f'{OUT}/plates_promo'+('_wide' if WIDE else ''); CAPD=f'{OUT}/captions_promo'+('_wide' if WIDE else ''); SHOTS=f'{OUT}/shots_promo'+('_wide' if WIDE else '')
W,H=(1920,1080) if WIDE else (1080,1920)
NAME=f'zuzone_promo_{VER}'+('_wide' if WIDE else '')+('_bed' if NOVO else '')
os.makedirs(SHOTS,exist_ok=True)
ENC=['-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','-r','30','-an']
def ff(*a): subprocess.run(['ffmpeg','-y','-loglevel','error',*a],check=True)
def plate(name,dur):
    out=f'{SEG}/p_{name}.mp4'; ff('-i',f'{PL}/{name}.mp4','-t',str(dur),'-vf',f'scale={W}:{H}',*ENC,out); return out
for c in ['globe','list','village','gantt','zupulse','newsletter','history','addvillage']: assert os.path.exists(f'{SEG}/{c}.mp4'), c
with open(f'{SEG}/globelist.txt','w') as f: f.write(f"file '{SEG}/globe.mp4'\nfile '{SEG}/list.mp4'\n")
ff('-f','concat','-safe','0','-i',f'{SEG}/globelist.txt','-c','copy',f'{SEG}/globelist.mp4')
segs=[('s01',plate('hookfast',3.0),3.0),('s02',f'{SEG}/globelist.mp4',6.0),('s03',plate('ownthing',5.0),5.0),('s04',plate('sharedzone',6.0),6.0),('s05',f'{SEG}/village.mp4',4.0),('s06',f'{SEG}/gantt.mp4',4.0),('s07',f'{SEG}/zupulse.mp4',4.0),('s08',f'{SEG}/newsletter.mp4',3.0),('s09',f'{SEG}/history.mp4',4.0),('s10',f'{SEG}/addvillage.mp4',4.0),('s11',plate('lockup2',7.0),7.0),('s12',plate('tagline',3.0),3.0),('s13',plate('end',5.0),5.0)]
TOTAL=sum(d for _,_,d in segs); assert abs(TOTAL-58)<0.01, TOTAL
for n,p,d in segs:
    got=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout.strip())
    assert abs(got-d)<0.05, (n,got,d)
with open(f'{SEG}/all2.txt','w') as f: f.write(''.join(f"file '{p}'\n" for _,p,_ in segs))
ff('-f','concat','-safe','0','-i',f'{SEG}/all2.txt','-c','copy',f'{SEG}/video2_nocap.mp4')
starts={}; t=0.0
for n,_,d in segs: starts[n]=t; t+=d
CAP=[('p01','s01',0.3,2.9),('p02','s02',0.4,5.9),('p05','s05',0.3,3.9),('p06','s06',0.3,3.9),('p07','s07',0.3,3.9),('p08','s08',0.3,2.9),('p09','s09',0.3,3.9),('p10','s10',0.3,3.9),('p11','s11',0.3,6.9)]
if not (SKIP and os.path.exists(f'{SEG}/video2_cap.mp4')):
    inputs=['-i',f'{SEG}/video2_nocap.mp4']; fc=[]; last='[0:v]'
    for i,(c,s,a,b) in enumerate(CAP,1):
        inputs+=['-loop','1','-i',f'{CAPD}/{c}.png']; A=starts[s]+a; B=starts[s]+b
        fc.append(f"[{i}:v]format=rgba,fade=in:st={A:.2f}:d=0.2:alpha=1,fade=out:st={B-0.2:.2f}:d=0.2:alpha=1,setpts=PTS-STARTPTS[c{i}]")
        fc.append(f"{last}[c{i}]overlay=0:0:enable='between(t,{A:.2f},{B:.2f})'[v{i}]"); last=f'[v{i}]'
    ff(*inputs,'-filter_complex',';'.join(fc),'-map',last,'-t',str(TOTAL),*ENC,f'{SEG}/video2_cap.mp4')
VO=[('v01',0.4),('v02',3.4),('v03',9.3),('v04',14.3),('v05',20.3),('v06',24.3),('v07',28.3),('v08',32.3),('v09',35.3),('v10',39.3),('v11',43.3),('v12',50.3)]
ff('-i',f'{AUD0}/sfx_tock.mp3','-af','apad=whole_dur=0.8','-t','0.8',f'{SEG}/tock08.wav'); ff('-stream_loop','72','-i',f'{SEG}/tock08.wav','-t',str(TOTAL),f'{SEG}/tocks2.wav')
ain=['-i',f'{AUD}/music.mp3','-i',f'{SEG}/tocks2.wav']; af=[f"[0:a]volume=0.22,afade=t=out:st={TOTAL-1.6:.1f}:d=1.6[m]","[1:a]volume=0.55[tk]"]; mix=['[m]','[tk]']
for i,(v,at) in enumerate(([] if NOVO else VO),2): ain+=['-i',f'{AUD}/{v}.mp3']; af.append(f'[{i}:a]volume=1.0,adelay={int(at*1000)}|{int(at*1000)}[v{i}]'); mix.append(f'[v{i}]')
k=len(ain)//2; ain+=['-i',f'{AUD0}/sfx_whoosh.mp3']; af.append(f'[{k}:a]volume=0.6,adelay=2800|2800[wh]'); mix.append('[wh]'); k+=1
ain+=['-i',f'{AUD0}/sfx_ding.mp3']; af.append(f'[{k}:a]volume=0.7,adelay=56800|56800[dg]'); mix.append('[dg]')
af.append(''.join(mix)+f'amix=inputs={len(mix)}:normalize=0:duration=first,alimiter=limit=0.95[a]')
ff(*ain,'-filter_complex',';'.join(af),'-map','[a]','-t',str(TOTAL),'-ar','44100','-ac','2',f'{SEG}/mix2{"_bed" if NOVO else ""}.wav')
ff('-i',f'{SEG}/video2_cap.mp4','-i',f'{SEG}/mix2{"_bed" if NOVO else ""}.wav','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',f'{OUT}/{NAME}.mp4')
ff('-i',f'{OUT}/{NAME}.mp4','-vf',f'scale={1280 if WIDE else 720}:{720 if WIDE else 1280}','-c:v','libx264','-crf','24','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',f'{OUT}/{NAME}_720.mp4')
for n,_,d in ([] if NOVO else segs):
    a=starts[n]; sc='720:405' if WIDE else '540:960'
    ff('-ss',f'{a:.3f}','-i',f'{OUT}/{NAME}.mp4','-t',f'{d:.3f}','-vf',f'scale={sc}','-c:v','libx264','-crf','25','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',f'{SHOTS}/{n}.mp4')
    ff('-ss',f'{a+min(1.0,d/2):.3f}','-i',f'{OUT}/{NAME}.mp4','-frames:v','1','-vf',f'scale={sc}','-q:v','4',f'{SHOTS}/{n}.jpg')
print('done',NAME,TOTAL)
