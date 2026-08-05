const API_BASE=(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())?'https://zanova-dz.onrender.com':'';

let PRODUCTS=[], CART=[];
let activeCat='all';
let searchQuery='';
let currentLang='ar';
function renderCatTabs(){
  const cats=[...new Set(PRODUCTS.map(p=>p.category).filter(Boolean))];
  const tabs=document.getElementById('catTabs');
  const allLabel=currentLang==='en'?'All':'الكل';
  const hotLabel=currentLang==='en'?'🔥 Hot Deals':'🔥 عروض نارية';
  tabs.innerHTML=`<button class="cat-tab active" data-cat="all">${allLabel}</button><button class="cat-tab" data-cat="__hot__">${hotLabel}</button>`+cats.map(c=>`<button class="cat-tab" data-cat="${c}">${c}</button>`).join('');
  tabs.querySelectorAll('.cat-tab').forEach(t=>t.addEventListener('click',()=>{
    tabs.querySelectorAll('.cat-tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    activeCat=t.dataset.cat;
    load();
  }));
}
async function load(){
  try{
    const r=await fetch(API_BASE+'/api/products');
    PRODUCTS=await r.json();
    renderCatTabs();
    const g=document.getElementById('grid');
    if(PRODUCTS.length===0){g.innerHTML='<p style=color:#8a8d93;padding:20px>لا توجد منتجات بعد</p>';return;}
    let list=activeCat==='all'?PRODUCTS:(activeCat==='__hot__'?PRODUCTS.filter(p=>p.hot):PRODUCTS.filter(p=>p.category===activeCat));
    if(searchQuery){list=list.filter(p=>(p.name||'').toLowerCase().includes(searchQuery)||(p.description||'').toLowerCase().includes(searchQuery));}
g.innerHTML=list.map(p=>`<div class=card onclick="openProduct('${p.id}')">${p.image?`<img class=card-img src="${p.image}" loading=lazy>`:'<div class=card-img-placeholder>🛍️</div>'}<div class=card-info><h3>${tr(p,'name')}</h3><span class=price>${p.price} ${currentLang==='en'?'DZD':'دج'}</span></div></div>`).join('');

window.openProduct=function(id){
  const p=PRODUCTS.find(x=>x.id===id); if(!p) return;
  let m=document.getElementById('productModal');
  if(!m){ m=document.createElement('div'); m.id='productModal'; m.className='product-modal'; m.onclick=e=>{if(e.target===m)closeProduct()}; document.body.appendChild(m); }
  m.innerHTML=`<div class=product-modal-inner><button class=pm-close onclick="closeProduct()">✕</button>${renderImgHTML(p)}<div class=body><h3>${tr(p,'name')}</h3><p>${tr(p,'description')}</p>${p.sizes?`<select id="size-${p.id}" class=opt-select><option value="">${currentLang==='en'?'Size':'مقاس'}</option>${p.sizes.split(',').map(s=>`<option value="${s}">${s}</option>`).join('')}</select>`:''}${p.colors?`<select id="color-${p.id}" class=opt-select><option value="">${currentLang==='en'?'Color':'لون'}</option>${p.colors.split(',').map(c=>`<option value="${c}">${c}</option>`).join('')}</select>`:''}${p.deliveryTime?`<p class=delivery>🚚 ${currentLang==='en'?'Delivery':'التوصيل'}: ${p.deliveryTime}</p>`:''}<div class=row><span class=price>${p.price} ${currentLang==='en'?'DZD':'دج'}</span><button class=add-btn onclick="add('${p.id}')">${currentLang==='en'?'Add to Cart':'أضف للسلة'}</button></div></div></div>`;
  m.classList.add('open');
};
window.closeProduct=function(){ const m=document.getElementById('productModal'); if(m) m.classList.remove('open'); };
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
function renderImgHTML(p){
  if(p.images&&p.images.length>1){
    return '<div class=gallery data-idx=0>'+p.images.map((im,gi)=>'<img src="'+im+'" data-src="'+im+'" style="display:'+(gi===0?'block':'none')+'">').join('')+'<div class=gallery-counter>1/'+p.images.length+'</div><button type=button class=gal-prev onclick="galNav(event,this,-1)">‹</button><button type=button class=gal-next onclick="galNav(event,this,1)">›</button></div>';
  }
  if(p.image){
    return '<div class=gallery><img src="'+p.image+'"></div>';
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
  const counter=g.querySelector('.gallery-counter');
  if(counter) counter.textContent=(idx+1)+'/'+imgs.length;
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
  const r=await fetch(API_BASE+'/api/orders',{method:'POST',body:fd});
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


function initSearch(){
  const input=document.getElementById('searchInput');
  if(!input) return;
  input.addEventListener('input',()=>{
    searchQuery=input.value.trim().toLowerCase();
    load();
  });
}
function tr(p,field){
  if(currentLang==='en' && p[field+'En']) return p[field+'En'];
  return p[field] || '';
}
function initLang(){
  const btn=document.getElementById('langToggle');
  if(!btn) return;
  btn.addEventListener('click',()=>{
    currentLang = currentLang==='ar' ? 'en' : 'ar';
    btn.textContent = currentLang==='ar' ? 'EN' : 'AR';
    document.body.dir = currentLang==='en' ? 'ltr' : 'rtl';
    const si=document.getElementById('searchInput');
    if(si) si.placeholder = currentLang==='en' ? '🔍 Search products...' : '🔍 ابحث عن منتج...';
    renderCatTabs();
    load();
  });
}
document.addEventListener('DOMContentLoaded',()=>{initSearch();initLang();});


function authToken(){ return localStorage.getItem('authToken')||''; }

function renderAuthUI(){
  let bar = document.getElementById('authBar');
  if(!bar){
    bar = document.createElement('div');
    bar.id = 'authBar';
    bar.style.cssText = 'position:static;display:inline-block;margin:10px auto;background:#1a1a1a;border:1px solid #d4af37;border-radius:20px;padding:8px 16px;color:#fff;font-size:13px;cursor:pointer';
    document.body.appendChild(bar);
  }
  const token = authToken();
  const name = localStorage.getItem('authName')||'';
  if(token){
    bar.textContent = '👤 '+(name||'حسابي')+' | خروج';
    bar.onclick = ()=>{ localStorage.removeItem('authToken'); localStorage.removeItem('authName'); renderAuthUI(); };
  } else {
    bar.textContent = '🔑 تسجيل الدخول';
    bar.onclick = openAuthModal;
  }
}

function openAuthModal(){
  let modal = document.getElementById('authModal');
  if(modal){ modal.style.display='flex'; return; }
  modal = document.createElement('div');
  modal.id = 'authModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:10000;display:flex;align-items:center;justify-content:center';
  modal.innerHTML = `
    <div style="background:#1a1a1a;border:1px solid #d4af37;border-radius:12px;padding:20px;width:90%;max-width:340px">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px">
        <button id="tabLogin" style="flex:1;padding:8px;background:#d4af37;color:#000;border:none;border-radius:6px;margin-inline-end:4px">دخول</button>
        <button id="tabRegister" style="flex:1;padding:8px;background:#333;color:#fff;border:none;border-radius:6px">تسجيل</button>
      </div>
      <input id="authName" placeholder="الاسم" style="display:none;width:100%;margin-bottom:8px;padding:10px;border-radius:6px;border:1px solid #555;background:#000;color:#fff">
      <input id="authEmail" placeholder="البريد الإلكتروني" style="width:100%;margin-bottom:8px;padding:10px;border-radius:6px;border:1px solid #555;background:#000;color:#fff">
      <input id="authPass" type="password" placeholder="كلمة السر" style="width:100%;margin-bottom:8px;padding:10px;border-radius:6px;border:1px solid #555;background:#000;color:#fff">
      <div id="authError" style="color:#ff6b6b;font-size:12px;margin-bottom:8px"></div>
      <button id="authSubmit" style="width:100%;padding:10px;background:#d4af37;color:#000;border:none;border-radius:6px;font-weight:bold">دخول</button>
      <div style="text-align:center;margin-top:10px"><span onclick="document.getElementById('authModal').style.display='none'" style="color:#999;cursor:pointer">إغلاق</span></div>
    </div>`;
  document.body.appendChild(modal);

  let mode = 'login';
  const nameInput = modal.querySelector('#authName');
  const submitBtn = modal.querySelector('#authSubmit');
  const errBox = modal.querySelector('#authError');

  modal.querySelector('#tabLogin').onclick = ()=>{ mode='login'; nameInput.style.display='none'; submitBtn.textContent='دخول'; errBox.textContent=''; };
  modal.querySelector('#tabRegister').onclick = ()=>{ mode='register'; nameInput.style.display='block'; submitBtn.textContent='تسجيل'; errBox.textContent=''; };

  submitBtn.onclick = async ()=>{
    errBox.textContent='';
    const email = modal.querySelector('#authEmail').value.trim();
    const password = modal.querySelector('#authPass').value;
    const name = nameInput.value.trim();
    if(!email || !password){ errBox.textContent='عمر الحقول المطلوبة'; return; }
    try{
      const r = await fetch(API_BASE+'/api/'+mode, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name,email,password}) });
      const d = await r.json();
      if(!r.ok){ errBox.textContent = d.error || 'خطأ'; return; }
      localStorage.setItem('authToken', d.token);
      localStorage.setItem('authName', d.name||'');
      modal.style.display='none';
      renderAuthUI();
    }catch(e){ errBox.textContent='خطأ فـ الاتصال'; }
  };
}

document.addEventListener('DOMContentLoaded', renderAuthUI);
