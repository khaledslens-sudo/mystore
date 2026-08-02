
let PRODUCTS=[], CART=[];
let activeCat='all';
function renderCatTabs(){
  const cats=[...new Set(PRODUCTS.map(p=>p.category).filter(Boolean))];
  const tabs=document.getElementById('catTabs');
  tabs.innerHTML='<button class="cat-tab active" data-cat="all">الكل</button>'+cats.map(c=>`<button class="cat-tab" data-cat="${c}">${c}</button>`).join('');
  tabs.querySelectorAll('.cat-tab').forEach(t=>t.addEventListener('click',()=>{
    tabs.querySelectorAll('.cat-tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    activeCat=t.dataset.cat;
    load();
  }));
}
async function load(){
  try{
    const r=await fetch('/api/products');
    PRODUCTS=await r.json();
    renderCatTabs();
    const g=document.getElementById('grid');
    if(PRODUCTS.length===0){g.innerHTML='<p style=color:#8a8d93;padding:20px>لا توجد منتجات بعد</p>';return;}
    const list=activeCat==='all'?PRODUCTS:PRODUCTS.filter(p=>p.category===activeCat);
g.innerHTML=list.map(p=>`<div class=card>${renderImgHTML(p)}<div class=no-img>${p.image?`<img src="${p.image}" data-src="${p.image}">`:'🛍️'}</div><div class=body><h3>${p.name}</h3><p>${p.description||''}</p>${p.sizes?`<select id="size-${p.id}" class=opt-select><option value="">المقاس</option>${p.sizes.split(',').map(s=>`<option value="${s}">${s}</option>`).join('')}</select>`:''}${p.colors?`<select id="color-${p.id}" class=opt-select><option value="">اللون</option>${p.colors.split(',').map(c=>`<option value="${c}">${c}</option>`).join('')}</select>`:''}${p.deliveryTime?`<p class=delivery>🚚 التوصيل: ${p.deliveryTime}</p>`:''}<div class=row><span class=price>${p.price} دج</span><button class=add-btn onclick="add('${p.id}')">أضف للسلة</button></div></div></div>`).join('');
  }catch(e){console.error(e);}
}
function add(id){
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p)return;
  let size='',color='';
  if(p.sizes){size=document.getElementById('size-'+id).value;if(!size){alert('اختر المقاس أولاً');return;}}
  if(p.colors){color=document.getElementById('color-'+id).value;if(!color){alert('اختر اللون أولاً');return;}}
  const key=id+'|'+size+'|'+color;
  const e=CART.find(x=>x.key===key);
  if(e)e.qty++;else CART.push({...p,key,size,color,qty:1});
  document.getElementById('cartCount').textContent=CART.reduce((s,i)=>s+i.qty,0);
  renderCart();openDrawer();
}
function getTotal(){return CART.reduce((s,i)=>s+i.price*i.qty,0);}
function renderCart(){
  const body=document.getElementById('drawerBody');
  const foot=document.getElementById('drawerFoot');
  if(CART.length===0){body.innerHTML='<div class=empty>السلة فارغة</div>';foot.style.display='none';return;}
  foot.style.display='block';
  body.innerHTML=CART.map(i=>`<div class=cart-item><div class=info><h4>${i.name}${i.size?` - ${i.size}`:''}${i.color?` - ${i.color}`:''}</h4><div class=qty-ctrl><button onclick="chqty('${i.key}',-1)">-</button><span>${i.qty}</span><button onclick="chqty('${i.key}',1)">+</button><span>${i.price*i.qty} دج</span></div></div></div>`).join('');
  document.getElementById('totalAmt').textContent=getTotal()+' دج';
}
function chqty(key,d){
  const i=CART.find(x=>x.key===key);if(!i)return;
  i.qty+=d;if(i.qty<=0)CART=CART.filter(x=>x.key!==key);
  document.getElementById('cartCount').textContent=CART.reduce((s,i)=>s+i.qty,0);
  renderCart();
}
const lightboxEl=document.createElement('div');
lightboxEl.id='lightbox';
lightboxEl.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;align-items:center;justify-content:center';
lightboxEl.innerHTML='<span onclick="closeLightbox()" style="position:absolute;top:16px;right:20px;color:#fff;font-size:2.2rem;cursor:pointer;z-index:10000;line-height:1">×</span><img id="lightboxImg" style="max-width:95%;max-height:90%;object-fit:contain">';
lightboxEl.addEventListener('click',(ev)=>{if(ev.target.id==='lightbox')closeLightbox();});
document.body.appendChild(lightboxEl);
document.addEventListener('click',(ev)=>{const t=ev.target.closest('img[data-src]');if(t)openLightbox(t.dataset.src);});
function openLightbox(src){document.getElementById('lightboxImg').src=src;document.getElementById('lightbox').style.display='flex';}
function closeLightbox(){document.getElementById('lightbox').style.display='none';}
function renderImgHTML(p){
  if(p.images&&p.images.length>1){
    return '<div class=gallery data-idx=0>'+p.images.map((im,gi)=>'<img src="'+im+'" data-src="'+im+'" style="display:'+(gi===0?'block':'none')+'">').join('')+'<button type=button class=gal-prev onclick="galNav(event,this,-1)">‹</button><button type=button class=gal-next onclick="galNav(event,this,1)">›</button></div>';
  }
  return '';
}
function galNav(e,btn,d){
  e.stopPropagation();
  const g=btn.parentElement;
  const imgs=[...g.querySelectorAll('img')];
  let idx=Number(g.dataset.idx);
  imgs[idx].style.display='none';
  idx=(idx+d+imgs.length)%imgs.length;
  imgs[idx].style.display='block';
  g.dataset.idx=idx;
}
function openDrawer(){document.getElementById('drawer').classList.add('open');document.getElementById('overlay').classList.add('open');}
function closeDrawer(){document.getElementById('drawer').classList.remove('open');document.getElementById('overlay').classList.remove('open');}
document.getElementById('openCart').addEventListener('click',openDrawer);
document.getElementById('closeCart').addEventListener('click',closeDrawer);
document.getElementById('overlay').addEventListener('click',closeDrawer);
document.querySelectorAll('.pay-tab').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('.pay-tab').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  document.querySelectorAll('.pay-panel').forEach(p=>p.style.display='none');
  document.getElementById('panel-'+t.dataset.m).style.display='block';
}));
const WILAYAS=['ادرار','الشلف','الاغواط','ام البواقي','باتنة','بجاية','بسكرة','بشار','البليدة','البويرة','تمنراست','تبسة','تلمسان','تيارت','تيزي وزو','الجزائر','الجلفة','جيجل','سطيف','سعيدة','سكيكدة','سيدي بلعباس','عنابة','قالمة','قسنطينة','المدية','مستغانم','المسيلة','معسكر','ورقلة','وهران','البيض','اليزي','برج بوعريريج','بومرداس','الطارف','تندوف','تيسمسيلت','الوادي','خنشلة','سوق اهراس','تيبازة','ميلة','عين الدفلى','النعامة','عين تموشنت','غرداية','غليزان'];
const sel=document.getElementById('cWilaya');
WILAYAS.forEach((w,i)=>{const o=document.createElement('option');o.value=w;o.textContent=(i+1)+' - '+w;sel.appendChild(o);});
const cAddrEl=document.getElementById('cAddr');
if(cAddrEl){const wrap=cAddrEl.closest('.form-group')||cAddrEl.parentElement;const refWrap=document.createElement('div');refWrap.className='form-group';refWrap.innerHTML='<label>رقم مرجع التحويل</label><input id="cRef" placeholder="رقم العملية من بريدي موب/Redot Pay">';wrap.after(refWrap);}
async function submitOrder(method,receipt){
  const name=document.getElementById('cName').value.trim();
  const phone=document.getElementById('cPhone').value.trim();
  const wilaya=document.getElementById('cWilaya').value;
  const addr=document.getElementById('cAddr').value.trim();
  if(!name||!phone||!wilaya||!addr){alert('عبي جميع الحقول');return;}
  const reference=document.getElementById('cRef')?document.getElementById('cRef').value.trim():'';
  if(method!=='paypal' && !reference){alert('الرجاء إدخال رقم مرجع التحويل');return;}
  const fd=new FormData();
  fd.append('reference',reference);
  fd.append('items',JSON.stringify(CART.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price,size:i.size||'',color:i.color||''}))));
  fd.append('total',getTotal());
  fd.append('paymentMethod',method);
  fd.append('customer',JSON.stringify({name,phone,wilaya,address:addr}));
  if(receipt)fd.append('receipt',receipt);
  const r=await fetch('/api/orders',{method:'POST',body:fd});
  if(r.ok){CART=[];renderCart();closeDrawer();alert('تم تسجيل طلبك بنجاح!');}
  else alert('حدث خطأ، حاول مرة أخرى');
}
document.getElementById('btnBaridi').addEventListener('click',()=>{
  const f=document.getElementById('receiptBaridi').files[0];
  submitOrder('baridimob',f);
});
document.getElementById('btnRedot').addEventListener('click',()=>{
  const f=document.getElementById('receiptRedot').files[0];
  submitOrder('redotpay',f);
});
load();

