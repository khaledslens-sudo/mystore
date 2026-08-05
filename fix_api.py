with open('public/app.js','r',encoding='utf-8') as f:
    c = f.read()

changed = []

old1 = "fetch('/api/products')"
new1 = "fetch(API_BASE+'/api/products')"
if old1 in c: c = c.replace(old1, new1); changed.append("products")

old2 = "fetch('/api/orders',{method:"
new2 = "fetch(API_BASE+'/api/orders',{method:"
if old2 in c: c = c.replace(old2, new2); changed.append("orders")

old3 = "fetch('/api/'+mode,"
new3 = "fetch(API_BASE+'/api/'+mode,"
if old3 in c: c = c.replace(old3, new3); changed.append("auth")

# نزيد تعريف API_BASE فـ أول الملف
prefix = "const API_BASE=(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())?'https://zanova-dz.onrender.com':'';\n"
c = prefix + c

with open('public/app.js','w',encoding='utf-8') as f:
    f.write(c)

print("CHANGED:", changed)
