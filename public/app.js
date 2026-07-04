
let PRODUCTS=[], CART=[];
async function load(){
  try{
    const r=await fetch('/api/products');
    PRODUCTS=await r.json();
    const g=document.getElementById('grid');
let activeCat='all';
    if(PRODUCTS.length===0){g.innerHTML='<p style=color:#8a8d93;padding:20px>لا توجد منتجات بعد</p>';return;}
    const list=activeCat==='all'?PRODUCTS:PRODUCTS.filter(p=>p.category===activeCat);
g.innerHTML=list.map(p=>`<div class=card><div class=no-img>${p.image?`<img src="${p.image}">`:'🛍️'}</div><div class=body><h3>${p.name}</h3><p>${p.description||''}</p><div class=row><span class=price>${p.price} دج</span><button class=add-btn onclick="add('${p.id}')">أضف للسلة</button></div></div></div>`).join('');
  }catch(e){console.error(e);}
}
function add(id){
  const p=PRODUCTS.find(x=>x.id===id);
  if(!p)return;
  const e=CART.find(x=>x.id===id);
  if(e)e.qty++;else CART.push({...p,qty:1});
  document.getElementById('cartCount').textContent=CART.reduce((s,i)=>s+i.qty,0);
  renderCart();openDrawer();
}
function getTotal(){return CART.reduce((s,i)=>s+i.price*i.qty,0);}
function renderCart(){
  const body=document.getElementById('drawerBody');
  const foot=document.getElementById('drawerFoot');
  if(CART.length===0){body.innerHTML='<div class=empty>السلة فارغة</div>';foot.style.display='none';return;}
  foot.style.display='block';
  body.innerHTML=CART.map(i=>`<div class=cart-item><div class=info><h4>${i.name}</h4><div class=qty-ctrl><button onclick="chqty('${i.id}',-1)">-</button><span>${i.qty}</span><button onclick="chqty('${i.id}',1)">+</button><span>${i.price*i.qty} دج</span></div></div></div>`).join('');
  document.getElementById('totalAmt').textContent=getTotal()+' دج';
}
function chqty(id,d){
  const i=CART.find(x=>x.id===id);if(!i)return;
  i.qty+=d;if(i.qty<=0)CART=CART.filter(x=>x.id!==id);
  document.getElementById('cartCount').textContent=CART.reduce((s,i)=>s+i.qty,0);
  renderCart();
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
async function submitOrder(method,receipt){
  const name=document.getElementById('cName').value.trim();
  const phone=document.getElementById('cPhone').value.trim();
  const wilaya=document.getElementById('cWilaya').value;
  const addr=document.getElementById('cAddr').value.trim();
  if(!name||!phone||!wilaya||!addr){alert('عبي جميع الحقول');return;}
  const fd=new FormData();
  fd.append('items',JSON.stringify(CART.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price}))));
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

document.querySelectorAll('.cat-tab').forEach(t=>t.addEventListener('click',()=>{document.querySelectorAll('.cat-tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');activeCat=t.dataset.cat;load();}));
