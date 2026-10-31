#!/usr/bin/env python3
"""Cut 16:9 per-scene clips, posters and the full-cut copy for the reel review page."""
import subprocess, shutil
OUT='/Users/booga/Growth/zuzone/reel/out'; R='/Users/booga/Growth/zuzone/reel/reel_review'
durs=[3,4,2,3,2,4,3,6,3,5,4,4,4,5,4,4]; t=0.0
def ff(*a): subprocess.run(['ffmpeg','-y','-loglevel','error',*a],check=True)
src=f'{OUT}/zuzone_reel_v2_wide.mp4'
for i,d in enumerate(durs,1):
    n=f's{i:02d}'
    ff('-ss',f'{t:.3f}','-i',src,'-t',f'{d:.3f}','-vf','scale=640:360','-c:v','libx264','-crf','25','-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',f'{R}/w/{n}.mp4')
    ff('-ss',f'{t+min(1.0,d/2):.3f}','-i',src,'-frames:v','1','-vf','scale=640:360','-q:v','4',f'{R}/w/{n}.jpg')
    t+=d
shutil.copy(f'{OUT}/zuzone_reel_v2_wide_720.mp4',f'{R}/full_169.mp4')
ff('-ss','32','-i',src,'-frames:v','1','-vf','scale=1280:720','-q:v','4',f'{R}/full_169.jpg')
ff('-i',src,'-vf','fps=1/2,scale=320:180,tile=6x5','-frames:v','1','/Users/booga/Growth/zuzone/reel/ref/sheet_reel_wide.png')
print('16:9 clips', t)
