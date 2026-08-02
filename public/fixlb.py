with open('app.js','r',encoding='utf-8') as f:
    app = f.read()

a = '<img src="${p.image}">'
b = '<img src="${p.image}" data-src="${p.image}">'
assert a in app, "edit A anchor not found"
app = app.replace(a, b, 1)

c = "'<img src=\"'+im+'\" style=\"display:'+(gi===0?'block':'none')+'\">'"
d = "'<img src=\"'+im+'\" data-src=\"'+im+'\" style=\"display:'+(gi===0?'block':'none')+'\">'"
assert c in app, "edit B anchor not found"
app = app.replace(c, d, 1)

e = "function renderImgHTML(p){"
f2 = ("const lightboxEl=document.createElement('div');\n"
"lightboxEl.id='lightbox';\n"
"lightboxEl.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;align-items:center;justify-content:center';\n"
"lightboxEl.innerHTML='<span onclick=\"closeLightbox()\" style=\"position:absolute;top:16px;right:20px;color:#fff;font-size:2.2rem;cursor:pointer;z-index:10000;line-height:1\">\u00d7</span><img id=\"lightboxImg\" style=\"max-width:95%;max-height:90%;object-fit:contain\">';\n"
"lightboxEl.addEventListener('click',(ev)=>{if(ev.target.id==='lightbox')closeLightbox();});\n"
"document.body.appendChild(lightboxEl);\n"
"document.addEventListener('click',(ev)=>{const t=ev.target.closest('img[data-src]');if(t)openLightbox(t.dataset.src);});\n"
"function openLightbox(src){document.getElementById('lightboxImg').src=src;document.getElementById('lightbox').style.display='flex';}\n"
"function closeLightbox(){document.getElementById('lightbox').style.display='none';}\n"
"function renderImgHTML(p){")
assert e in app, "edit C anchor not found"
app = app.replace(e, f2, 1)

with open('app.js','w',encoding='utf-8') as f:
    f.write(app)
print('app.js OK')

with open('style.css','a',encoding='utf-8') as f:
    f.write("\n.gallery img,.no-img img{cursor:pointer}\n")
print('style.css OK')
