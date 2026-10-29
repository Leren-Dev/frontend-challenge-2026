import zlib,struct,subprocess,os
def load(path):
    d=open(path,'rb').read(); p=8; idat=b''
    while p<len(d):
        l=struct.unpack('>I',d[p:p+4])[0]; t=d[p+4:p+8]; c=d[p+8:p+8+l]; p+=12+l
        if t==b'IHDR': w,h,bd,ct,_,_,_=struct.unpack('>IIBBBBB',c)
        elif t==b'IDAT': idat+=c
        elif t==b'IEND': break
    raw=zlib.decompress(idat); ch={0:1,2:3,4:2,6:4}[ct]; bpp=ch; st=w*bpp
    out=bytearray(); prev=bytearray(st); i=0
    for y in range(h):
        f=raw[i]; i+=1; ln=bytearray(raw[i:i+st]); i+=st
        for x in range(st):
            a=ln[x-bpp] if x>=bpp else 0; b=prev[x]; c=prev[x-bpp] if x>=bpp else 0
            if f==1: ln[x]=(ln[x]+a)&255
            elif f==2: ln[x]=(ln[x]+b)&255
            elif f==3: ln[x]=(ln[x]+(a+b)//2)&255
            elif f==4:
                p=a+b-c; pa=abs(p-a); pb=abs(p-b); pc=abs(p-c)
                pr=a if (pa<=pb and pa<=pc) else (b if pb<=pc else c)
                ln[x]=(ln[x]+pr)&255
        out+=ln; prev=ln
    return w,h,ch,bytes(out)
def measure(font,text,size,out):
    subprocess.run(['ffmpeg','-loglevel','error','-y','-f','lavfi','-i','color=c=white:s=1200x200','-vf',f"drawtext=fontfile=./{font}:text='{text}':fontcolor=black:fontsize={size}:x=20:y=50",'-frames:v','1',out],check=True)
    w,h,ch,px=load(out); xs=[];ys=[]
    for y in range(h):
        for x in range(w):
            o=(y*w+x)*ch
            if sum(px[o:o+3])<400: xs.append(x);ys.append(y)
    return (max(xs)-min(xs)+1, max(ys)-min(ys)+1)
for text in ['Gabrielle','Essence Eau','De Parfum','$149.99','$169.99','PERFUME']:
    for font in ['Fraunces-Bold.ttf','PlayfairDisplay-Bold.ttf']:
        print(font,repr(text), measure(font,text.replace('$','\\$'),40,'t.png'))
