# ---- server.js ----
with open('server.js','r',encoding='utf-8') as f:
    server = f.read()

old1 = "app.post('/api/products', upload.single('image'), (req, res) => {"
new1 = "app.post('/api/products', upload.array('images', 5), (req, res) => {"
assert old1 in server, "server edit1 anchor not found"
server = server.replace(old1, new1, 1)

old2 = "image: req.file ? '/uploads/' + req.file.filename : '', sizes: req.body.sizes || '', colors: req.body.colors || '', deliveryTime: req.body.deliveryTime || '' };"
new2 = "image: req.files && req.files[0] ? '/uploads/' + req.files[0].filename : '', images: req.files ? req.files.map(f=>'/uploads/'+f.filename) : [], sizes: req.body.sizes || '', colors: req.body.colors || '', deliveryTime: req.body.deliveryTime || '' };"
assert old2 in server, "server edit2 anchor not found"
server = server.replace(old2, new2, 1)

old3 = "app.put('/api/products/:id', upload.single('image'), (req, res) => {"
new3 = "app.put('/api/products/:id', upload.array('images', 5), (req, res) => {"
assert old3 in server, "server edit3 anchor not found"
server = server.replace(old3, new3, 1)

old4 = "image: req.file ? '/uploads/' + req.file.filename : products[i].image, sizes: req.body.sizes !== undefined ? req.body.sizes : products[i].sizes, colors: req.body.colors !== undefined ? req.body.colors : products[i].colors, deliveryTime: req.body.deliveryTime !== undefined ? req.body.deliveryTime : products[i].deliveryTime };"
new4 = "image: req.files && req.files[0] ? '/uploads/' + req.files[0].filename : products[i].image, images: req.files && req.files.length ? req.files.map(f=>'/uploads/'+f.filename) : products[i].images, sizes: req.body.sizes !== undefined ? req.body.sizes : products[i].sizes, colors: req.body.colors !== undefined ? req.body.colors : products[i].colors, deliveryTime: req.body.deliveryTime !== undefined ? req.body.deliveryTime : products[i].deliveryTime };"
assert old4 in server, "server edit4 anchor not found"
server = server.replace(old4, new4, 1)

old5 = "const { items, total, paymentMethod, customer } = req.body;"
new5 = "const { items, total, paymentMethod, customer, reference } = req.body;"
assert old5 in server, "server edit5 anchor not found"
server = server.replace(old5, new5, 1)

old6 = "const order = { id: genId(), items: JSON.parse(items), total, paymentMethod, customer: JSON.parse(customer), receipt: req.file ? '/uploads/' + req.file.filename : null, status: paymentMethod === 'paypal' ? 'paid' : 'pending', createdAt: new Date().toISOString() };"
new6 = "const order = { id: genId(), items: JSON.parse(items), total, paymentMethod, customer: JSON.parse(customer), reference: reference || '', receipt: req.file ? '/uploads/' + req.file.filename : null, status: paymentMethod === 'paypal' ? 'paid' : 'pending', createdAt: new Date().toISOString() };"
assert old6 in server, "server edit6 anchor not found"
server = server.replace(old6, new6, 1)

with open('server.js','w',encoding='utf-8') as f:
    f.write(server)
print('server.js OK')

# ---- admin.html ----
with open('public/admin.html','r',encoding='utf-8') as f:
    html = f.read()

a1 = "id=pimg accept=image/*>"
b1 = "id=pimg accept=image/* multiple>"
assert a1 in html, "admin edit1 anchor not found"
html = html.replace(a1, b1, 1)

a2 = "if(img) fd.append('image',img);"
b2 = "const imgsAll=document.getElementById('pimg').files;for(let gi=0;gi<imgsAll.length;gi++) fd.append('images',imgsAll[gi]);"
assert a2 in html, "admin edit2 anchor not found"
html = html.replace(a2, b2, 1)

a3 = "+o.status+(o.receipt?"
b3 = "+o.status+(o.reference?'<br>رقم المرجع: '+o.reference:'')+(o.receipt?"
assert a3 in html, "admin edit3 anchor not found"
html = html.replace(a3, b3, 1)

a4 = "</a>':'')+'</div>').join('');"
b4 = "</a>':'')+'<br><button onclick=\"setStatus(\\''+o.id+'\\',\\'confirmed\\')\" style=\"background:#2ecc71;color:#000;border:none;padding:4px 10px;border-radius:4px;margin-top:6px;cursor:pointer\">تأكيد الدفع</button> <button onclick=\"setStatus(\\''+o.id+'\\',\\'rejected\\')\" style=\"background:#ff4d4d;color:#000;border:none;padding:4px 10px;border-radius:4px;margin-top:6px;cursor:pointer\">رفض</button>'+'</div>').join('');"
assert a4 in html, "admin edit4 anchor not found"
html = html.replace(a4, b4, 1)

a5 = "async function saveProduct(){"
b5 = "async function setStatus(id,status){\n  await fetch('/api/orders/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});\n  loadOrders();\n}\nasync function saveProduct(){"
assert a5 in html, "admin edit5 anchor not found"
html = html.replace(a5, b5, 1)

with open('public/admin.html','w',encoding='utf-8') as f:
    f.write(html)
print('admin.html OK')

# ---- app.js ----
with open('public/app.js','r',encoding='utf-8') as f:
    app = f.read()

c1 = "sel.appendChild(o);});"
d1 = "sel.appendChild(o);});\nconst cAddrEl=document.getElementById('cAddr');\nif(cAddrEl){const wrap=cAddrEl.closest('.form-group')||cAddrEl.parentElement;const refWrap=document.createElement('div');refWrap.className='form-group';refWrap.innerHTML='<label>رقم مرجع التحويل</label><input id=\"cRef\" placeholder=\"رقم العملية من بريدي موب/Redot Pay\">';wrap.after(refWrap);}"
assert c1 in app, "app edit1 anchor not found"
app = app.replace(c1, d1, 1)

c2 = "const fd=new FormData();"
d2 = "const reference=document.getElementById('cRef')?document.getElementById('cRef').value.trim():'';\n  if(method!=='paypal' && !reference){alert('الرجاء إدخال رقم مرجع التحويل');return;}\n  const fd=new FormData();\n  fd.append('reference',reference);"
assert c2 in app, "app edit2 anchor not found"
app = app.replace(c2, d2, 1)

c3 = "function openDrawer(){"
d3 = "function renderImgHTML(p){\n  if(p.images&&p.images.length>1){\n    return '<div class=gallery data-idx=0>'+p.images.map((im,gi)=>'<img src=\"'+im+'\" style=\"display:'+(gi===0?'block':'none')+'\">').join('')+'<button type=button class=gal-prev onclick=\"galNav(event,this,-1)\">‹</button><button type=button class=gal-next onclick=\"galNav(event,this,1)\">›</button></div>';\n  }\n  return '';\n}\nfunction galNav(e,btn,d){\n  e.stopPropagation();\n  const g=btn.parentElement;\n  const imgs=[...g.querySelectorAll('img')];\n  let idx=Number(g.dataset.idx);\n  imgs[idx].style.display='none';\n  idx=(idx+d+imgs.length)%imgs.length;\n  imgs[idx].style.display='block';\n  g.dataset.idx=idx;\n}\nfunction openDrawer(){"
assert c3 in app, "app edit3 anchor not found"
app = app.replace(c3, d3, 1)

c4 = "<div class=no-img>"
d4 = "${renderImgHTML(p)}<div class=no-img>"
assert c4 in app, "app edit4 anchor not found"
app = app.replace(c4, d4, 1)

with open('public/app.js','w',encoding='utf-8') as f:
    f.write(app)
print('app.js OK')

# ---- style.css ----
with open('public/style.css','a',encoding='utf-8') as f:
    f.write("\n.gallery{position:relative;width:100%;height:180px;overflow:hidden}\n.gallery img{width:100%;height:180px;object-fit:cover;position:absolute;top:0;left:0}\n.gal-prev,.gal-next{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.5);color:#d4af37;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;z-index:2}\n.gal-prev{left:4px}\n.gal-next{right:4px}\n.gallery + .no-img{display:none}\n")
print('style.css OK')
