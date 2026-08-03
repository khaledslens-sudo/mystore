with open('public/app.js','r',encoding='utf-8') as f: c=f.read()

old = '''g.innerHTML=list.map(p=>`<div class=card>${renderImgHTML(p)}<div class=no-img>${p.image?`<img src="${p.image}" data-src="${p.image}">`:'🛍️'}</div><div class=body><h3>${tr(p,'name')}</h3><p>${tr(p,'description')}</p>${p.sizes?`<select id="size-${p.id}" class=opt-select><option value="">مقاس</option>${p.sizes.split(',').map(s=>`<option value="${s}">${s}</option>`).join('')}</select>`:''}${p.colors?`<select id="color-${p.id}" class=opt-select><option value="">لون</option>${p.colors.split(',').map(c=>`<option value="${c}">${c}</option>`).join('')}</select>`:''}${p.deliveryTime?`<p class=delivery>🚚 ${currentLang==='en'?'Delivery':'التوصيل'}: ${p.deliveryTime}</p>`:''}<div class=row><span class=price>${p.price} ${currentLang==='en'?'DZD':'دج'}</span><button class=add-btn onclick="add('${p.id}')">${currentLang==='en'?'Add to Cart':'أضف للسلة'}</button></div></div></div>`).join('');'''

new = '''g.innerHTML=list.map(p=>`<div class=card onclick="openProduct('${p.id}')">${p.image?`<img class=card-img src="${p.image}" loading=lazy>`:'<div class=card-img-placeholder>🛍️</div>'}<div class=card-info><h3>${tr(p,'name')}</h3><span class=price>${p.price} ${currentLang==='en'?'DZD':'دج'}</span></div></div>`).join('');

window.openProduct=function(id){
  const p=PRODUCTS.find(x=>x.id===id); if(!p) return;
  let m=document.getElementById('productModal');
  if(!m){ m=document.createElement('div'); m.id='productModal'; m.className='product-modal'; m.onclick=e=>{if(e.target===m)closeProduct()}; document.body.appendChild(m); }
  m.innerHTML=`<div class=product-modal-inner><button class=pm-close onclick="closeProduct()">✕</button>${renderImgHTML(p)}<div class=body><h3>${tr(p,'name')}</h3><p>${tr(p,'description')}</p>${p.sizes?`<select id="size-${p.id}" class=opt-select><option value="">${currentLang==='en'?'Size':'مقاس'}</option>${p.sizes.split(',').map(s=>`<option value="${s}">${s}</option>`).join('')}</select>`:''}${p.colors?`<select id="color-${p.id}" class=opt-select><option value="">${currentLang==='en'?'Color':'لون'}</option>${p.colors.split(',').map(c=>`<option value="${c}">${c}</option>`).join('')}</select>`:''}${p.deliveryTime?`<p class=delivery>🚚 ${currentLang==='en'?'Delivery':'التوصيل'}: ${p.deliveryTime}</p>`:''}<div class=row><span class=price>${p.price} ${currentLang==='en'?'DZD':'دج'}</span><button class=add-btn onclick="add('${p.id}')">${currentLang==='en'?'Add to Cart':'أضف للسلة'}</button></div></div></div>`;
  m.classList.add('open');
};
window.closeProduct=function(){ const m=document.getElementById('productModal'); if(m) m.classList.remove('open'); };'''

if old not in c:
    print("NOT_FOUND")
else:
    c=c.replace(old,new)
    with open('public/app.js','w',encoding='utf-8') as f: f.write(c)
    print("APP_JS_OK")

css='''
.grid{grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;padding:10px}
.card{cursor:pointer;padding:0}
.card-img,.card-img-placeholder{width:100%;height:130px;object-fit:cover;display:flex;align-items:center;justify-content:center;font-size:2rem;background:#16213e}
.card-info{padding:8px}
.card-info h3{font-size:.8rem;margin:0 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-info .price{font-size:.85rem;font-weight:700;color:#d4af37}
.product-modal{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;display:none;align-items:flex-end;justify-content:center}
.product-modal.open{display:flex}
.product-modal-inner{background:#1a1a2e;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;border-radius:16px 16px 0 0;position:relative;padding-bottom:16px}
.pm-close{position:absolute;top:10px;right:10px;background:rgba(0,0,0,.5);color:#fff;border:none;border-radius:50%;width:32px;height:32px;font-size:1rem;z-index:2}
'''
with open('public/style.css','a',encoding='utf-8') as f: f.write(css)
print("CSS_OK")
