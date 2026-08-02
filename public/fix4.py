# ---- server.js ----
with open('server.js','r',encoding='utf-8') as f:
    server = f.read()

s_old1 = "app.post('/api/orders', upload.single('receipt'), (req, res) => {"
s_new1 = (
"app.get('/api/settings', (req, res) => res.json(readDB('data/settings.json')));\n"
"app.put('/api/settings', (req, res) => {\n"
"  const s = readDB('data/settings.json');\n"
"  const updated = { ...s, ...req.body };\n"
"  writeDB('data/settings.json', updated);\n"
"  res.json(updated);\n"
"});\n"
"app.delete('/api/orders/:id', (req, res) => {\n"
"  const orders = readDB('data/orders.json');\n"
"  writeDB('data/orders.json', orders.filter(o => o.id !== req.params.id));\n"
"  res.json({ ok: true });\n"
"});\n"
+ s_old1)
assert s_old1 in server, "server edit1 anchor not found"
server = server.replace(s_old1, s_new1, 1)

s_old2 = "const order = { id: genId(), items: JSON.parse(items), total, paymentMethod, customer: JSON.parse(customer), reference: reference || '', receipt: req.file ? '/uploads/' + req.file.filename : null, status: paymentMethod === 'paypal' ? 'paid' : 'pending', createdAt: new Date().toISOString() };"
s_new2 = (
"const settingsNow = readDB('data/settings.json');\n"
"  const todayStr = new Date().toISOString().slice(0,10);\n"
"  const todayCount = readDB('data/orders.json').filter(o => o.createdAt && o.createdAt.slice(0,10) === todayStr).length;\n"
"  if (settingsNow.maxOrdersPerDay && todayCount >= settingsNow.maxOrdersPerDay) {\n"
"    return res.status(403).json({ error: 'عذراً، وصلنا للحد الأقصى من الطلبات اليوم. حاول غداً.' });\n"
"  }\n  "
+ s_old2)
assert s_old2 in server, "server edit2 anchor not found"
server = server.replace(s_old2, s_new2, 1)

with open('server.js','w',encoding='utf-8') as f:
    f.write(server)
print('server.js OK')

# ---- admin.html ----
with open('public/admin.html','r',encoding='utf-8') as f:
    html = f.read()

h_old1 = "<div id=productsList></div>"
h_new1 = ("<div class=panel><h3>إعدادات الطلبات</h3><div class=form-group>"
"<label>الحد الأقصى للطلبات في اليوم (0 = بلا حد)</label>"
"<input type=number id=maxOrders placeholder=0></div>"
"<button class=submit-btn onclick=saveSettings()>حفظ الإعدادات</button></div>"
+ h_old1)
assert h_old1 in html, "admin edit1 anchor not found"
html = html.replace(h_old1, h_new1, 1)

h_old2 = "رفض</button>'+'</div>').join('');"
h_new2 = ("رفض</button> <button onclick=\"setStatus(\\''+o.id+'\\',\\'done\\')\" "
"style=\"background:#3498db;color:#fff;border:none;padding:4px 10px;border-radius:4px;margin-top:6px;cursor:pointer\">تم ✅</button> "
"<button onclick=\"deleteOrder(\\''+o.id+'\\')\" "
"style=\"background:#555;color:#fff;border:none;padding:4px 10px;border-radius:4px;margin-top:6px;cursor:pointer\">حذف 🗑</button>"
"'+'</div>').join('');")
assert h_old2 in html, "admin edit2 anchor not found"
html = html.replace(h_old2, h_new2, 1)

h_old3 = "}\nasync function saveProduct(){"
h_new3 = ("}\nasync function deleteOrder(id){\n"
"  if(!confirm('متأكد من حذف الطلب؟')) return;\n"
"  await fetch('/api/orders/'+id,{method:'DELETE'});\n"
"  loadOrders();\n"
"}\nasync function saveProduct(){")
assert h_old3 in html, "admin edit3 anchor not found"
html = html.replace(h_old3, h_new3, 1)

h_old4 = "loadProducts();\nloadOrders();\n</script>"
h_new4 = ("async function loadSettings(){\n"
"  const r=await fetch('/api/settings');\n"
"  const s=await r.json();\n"
"  document.getElementById('maxOrders').value=s.maxOrdersPerDay||0;\n"
"}\n"
"async function saveSettings(){\n"
"  const maxOrdersPerDay=Number(document.getElementById('maxOrders').value)||0;\n"
"  await fetch('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({maxOrdersPerDay})});\n"
"  alert('تم حفظ الإعدادات');\n"
"}\n"
"loadProducts();\nloadOrders();\nloadSettings();\n</script>")
assert h_old4 in html, "admin edit4 anchor not found"
html = html.replace(h_old4, h_new4, 1)

with open('public/admin.html','w',encoding='utf-8') as f:
    f.write(html)
print('admin.html OK')
