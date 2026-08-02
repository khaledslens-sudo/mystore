with open('public/style.css','r',encoding='utf-8') as f:
    css = f.read()

old = ".gal-prev,.gal-next{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.5);color:#d4af37;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;z-index:2}"
new = ".gal-prev,.gal-next{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.65);color:#d4af37;border:none;width:40px;height:40px;font-size:1.4rem;line-height:1;border-radius:50%;cursor:pointer;z-index:2;display:flex;align-items:center;justify-content:center}"
assert old in css
css = css.replace(old, new, 1)

with open('public/style.css','w',encoding='utf-8') as f:
    f.write(css)
print("OK")
