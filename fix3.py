with open('public/app.js','r',encoding='utf-8') as f:
    lines = f.readlines()

# تأكيد أن السطر 76 هو بداية renderImgHTML
assert 'function renderImgHTML(p){' in lines[75], "OFFSET_MISMATCH: " + lines[75]

new_block = '''function renderImgHTML(p){
  if(p.images&&p.images.length>1){
    return '<div class=gallery data-idx=0>'+p.images.map((im,gi)=>'<img src="'+im+'" data-src="'+im+'" style="display:'+(gi===0?'block':'none')+'">').join('')+'<div class=gallery-counter>1/'+p.images.length+'</div><button type=button class=gal-prev onclick="galNav(event,this,-1)">\u2039</button><button type=button class=gal-next onclick="galNav(event,this,1)">\u203a</button></div>';
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
'''

# نبدل من السطر 76 (index 75) لغاية السطر 91 (index 90) شامل
lines[75:91] = [new_block]

with open('public/app.js','w',encoding='utf-8') as f:
    f.writelines(lines)
print("APP_JS_OK")
