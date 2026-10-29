import json,urllib.request,base64,time,sys,os
BASE='http://127.0.0.1:4444'
def req(method,path,data=None,timeout=60):
    url=BASE+path
    body=None
    if data is not None:
        body=json.dumps(data).encode()
    r=urllib.request.Request(url,data=body,method=method,headers={'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(r,timeout=timeout) as resp:
            raw=resp.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        print('HTTP ERROR', e.code, e.read().decode(errors='replace'))
        raise
caps={'capabilities':{'alwaysMatch':{'browserName':'firefox','moz:firefoxOptions':{'args':['-headless','--width=854','--height=662'],'prefs':{'ui.prefersReducedMotion':0,'layout.css.devPixelsPerPx':'1.0'}}}}}
print('creating session...')
s=req('POST','/session',caps,timeout=120)
print(s)
sid=s['value']['sessionId']
print('session',sid)
try:
    req('POST',f'/session/{sid}/window/rect',{'width':854,'height':662,'x':0,'y':0})
    req('POST',f'/session/{sid}/url',{'url':'http://127.0.0.1:8000/index.html'})
    time.sleep(4)
    title=req('GET',f'/session/{sid}/title')
    print('title',title)
    r=req('POST',f'/session/{sid}/execute/sync',{'script':'''
      return {
        title: document.getElementById('productTitle').textContent,
        desc: document.getElementById('productDescription').textContent,
        price: document.getElementById('productPrice').textContent,
        compare: document.getElementById('productComparePrice').textContent,
        compareHidden: document.getElementById('productComparePrice').hidden,
        category: document.getElementById('productCategory').textContent,
        img: document.getElementById('productImage').currentSrc,
        busy: document.getElementById('productCard').getAttribute('aria-busy'),
        retryHidden: document.getElementById('retryButton').hidden,
        popupHidden: document.getElementById('productPopup').hidden,
        bodyClass: document.body.className,
        size: [window.innerWidth, window.innerHeight],
        card: (() => { const r=document.getElementById('productCard').getBoundingClientRect(); return [r.x,r.y,r.width,r.height]; })(),
        image: (() => { const r=document.getElementById('productImage').getBoundingClientRect(); return [r.x,r.y,r.width,r.height]; })()
      };
    ''','args':[]})
    print(json.dumps(r,indent=2))
    # screenshot
    shot=req('GET',f'/session/{sid}/screenshot')
    out=sys.argv[1] if len(sys.argv)>1 else '.tmp-tools/shot.png'
    open(out,'wb').write(base64.b64decode(shot['value']))
    print('saved',out,os.path.getsize(out))
finally:
    req('DELETE',f'/session/{sid}')
