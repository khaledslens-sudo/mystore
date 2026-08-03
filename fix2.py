with open('public/app.js','r',encoding='utf-8') as f:
    lines = f.readlines()

new_line = '''g.innerHTML=list.map(p=>`<div class=card onclick="openProduct('${p.id}')">${p.image?`<img class=card-img src="${p.image}" loading=lazy>`:'<div class=card-img-placeholder>🛍️</div>'}<div class=card-info><h3>${tr(p,'name')}</h3><span class=price>${p.price} ${currentLang==='en'?'DZD':'دج'}</span></div></div>`).join('');

window.openProduct=function(id){
  const p=PRODUCTS.find(x=>x.id===id); if(!p) return;
  let m=document.getElementById('productModal');
  if(!m){ m=document.createElement('div'); m.id='productModal'; m.className='product-modal'; m.onclick=e=>{if(e.target===m)closeProduct()}; document.body.appendChild(m); }
  m.innerHTML=`<div class=product-modal-inner><button class=pm-close onclick="closeProduct()">✕</button>${renderImgHTML(p)}<div class=body><h3>${tr(p,'name')}</h3><p>${tr(p,'description')}</p>${p.sizes?`<select id="size-${p.id}" class=opt-select><option value="">${currentLang==='en'?'Size':'مقاس'}</option>${p.sizes.split(',').map(s=>`<option value="${s}">${s}</option>`).join('')}</select>`:''}${p.colors?`<select id="color-${p.id}" class=opt-select><option value="">${currentLang==='en'?'Color':'لون'}</option>${p.colors.split(',').map(c=>`<option value="${c}">${c}</option>`).join('')}</select>`:''}${p.deliveryTime?`<p class=delivery>🚚 ${currentLang==='en'?'Delivery':'التوصيل'}: ${p.deliveryTime}</p>`:''}<div class=row><span class=price>${p.price} ${currentLang==='en'?'DZD':'دج'}</span><button class=add-btn onclick="add('${p.id}')">${currentLang==='en'?'Add to Cart':'أضف للسلة'}</button></div></div></div>`;
  m.classList.add('open');
};
window.closeProduct=function(){ const m=document.getElementById('productModal'); if(m) m.classList.remove('open'); };
'''

lines[27] = new_line  # line 28 (0-indexed 27)

with open('public/app.js','w',encoding='utf-8') as f:
    f.writelines(lines)
print("APP_JS_OK")
