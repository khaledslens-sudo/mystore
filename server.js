const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
if (!fs.existsSync('data/users.json')) writeDB('data/users.json', []);

function genToken(){ return Math.random().toString(36).slice(2)+Date.now().toString(36); }

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if(!email || !password) return res.status(400).json({error:'بيانات ناقصة'});
  const users = readDB('data/users.json');
  if(users.find(u=>u.email===email)) return res.status(400).json({error:'البريد مستعمل من قبل'});
  const hash = bcrypt.hashSync(password, 10);
  const token = genToken();
  users.push({ id: genId(), name: name||'', email, password: hash, token });
  writeDB('data/users.json', users);
  res.json({ token, name: name||'', email });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readDB('data/users.json');
  const u = users.find(x=>x.email===email);
  if(!u || !bcrypt.compareSync(password, u.password)) return res.status(401).json({error:'بيانات الدخول خاطئة'});
  u.token = genToken();
  writeDB('data/users.json', users);
  res.json({ token: u.token, name: u.name, email: u.email });
});

app.get('/api/me', (req, res) => {
  const token = req.headers['x-auth-token'];
  const users = readDB('data/users.json');
  const u = users.find(x=>x.token===token);
  if(!u) return res.status(401).json({error:'غير مسجل'});
  res.json({ name: u.name, email: u.email });
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/uploads/')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

function readDB(f) { return JSON.parse(fs.readFileSync(f, 'utf8')); }
function writeDB(f, d) { fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
function genId() { return Math.random().toString(36).slice(2, 9); }

if (!fs.existsSync('data/products.json')) writeDB('data/products.json', []);
if (!fs.existsSync('data/orders.json')) writeDB('data/orders.json', []);
if (!fs.existsSync('data/settings.json')) writeDB('data/settings.json', { currency: 'DZD', baridimob_rip: '', storeName: 'متجري' });

app.get('/api/products', (req, res) => res.json(readDB('data/products.json')));

app.post('/api/products', upload.array('images', 5), async (req, res) => {
  const products = readDB('data/products.json');
  const p = { id: genId(), name: req.body.name, price: Number(req.body.price), category: req.body.category || '', stock: Number(req.body.stock) || 0, description: req.body.description || '', image: req.files && req.files[0] ? '/uploads/' + req.files[0].filename : '', images: req.files ? req.files.map(f=>'/uploads/'+f.filename) : [], sizes: req.body.sizes || '', colors: req.body.colors || '', deliveryTime: req.body.deliveryTime || '', hot: req.body.hot==='true'||req.body.hot==='on' };
  p.nameEn = await translateText(p.name);
  p.descriptionEn = p.description ? await translateText(p.description) : '';
  products.push(p);
  writeDB('data/products.json', products);
  res.json(p);
});

app.put('/api/products/:id', upload.array('images', 5), async (req, res) => {
  const products = readDB('data/products.json');
  const i = products.findIndex(p => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'غير موجود' });
  products[i] = { ...products[i], name: req.body.name || products[i].name, price: Number(req.body.price) || products[i].price, category: req.body.category || products[i].category, stock: Number(req.body.stock) ?? products[i].stock, description: req.body.description || products[i].description, image: req.files && req.files[0] ? '/uploads/' + req.files[0].filename : products[i].image, images: req.files && req.files.length ? req.files.map(f=>'/uploads/'+f.filename) : products[i].images, sizes: req.body.sizes !== undefined ? req.body.sizes : products[i].sizes, colors: req.body.colors !== undefined ? req.body.colors : products[i].colors, deliveryTime: req.body.deliveryTime !== undefined ? req.body.deliveryTime : products[i].deliveryTime, hot: req.body.hot!==undefined ? (req.body.hot==='true'||req.body.hot==='on') : products[i].hot };
  products[i].nameEn = await translateText(products[i].name);
  products[i].descriptionEn = products[i].description ? await translateText(products[i].description) : '';
  writeDB('data/products.json', products);
  res.json(products[i]);
});

app.delete('/api/products/:id', (req, res) => {
  const products = readDB('data/products.json');
  writeDB('data/products.json', products.filter(p => p.id !== req.params.id));
  res.json({ ok: true });
});

app.get('/api/settings', (req, res) => res.json(readDB('data/settings.json')));
app.put('/api/settings', (req, res) => {
  const s = readDB('data/settings.json');
  const updated = { ...s, ...req.body };
  writeDB('data/settings.json', updated);
  res.json(updated);
});
app.delete('/api/orders/:id', (req, res) => {
  const orders = readDB('data/orders.json');
  writeDB('data/orders.json', orders.filter(o => o.id !== req.params.id));
  res.json({ ok: true });
});
app.post('/api/orders', upload.single('receipt'), (req, res) => {
  const { items, total, paymentMethod, customer, reference } = req.body;
  const orders = readDB('data/orders.json');
  const settingsNow = readDB('data/settings.json');
  const todayStr = new Date().toISOString().slice(0,10);
  const todayCount = readDB('data/orders.json').filter(o => o.createdAt && o.createdAt.slice(0,10) === todayStr).length;
  if (settingsNow.maxOrdersPerDay && todayCount >= settingsNow.maxOrdersPerDay) {
    return res.status(403).json({ error: 'عذراً، وصلنا للحد الأقصى من الطلبات اليوم. حاول غداً.' });
  }
  const order = { id: genId(), items: JSON.parse(items), total, paymentMethod, customer: JSON.parse(customer), reference: reference || '', receipt: req.file ? '/uploads/' + req.file.filename : null, status: paymentMethod === 'paypal' ? 'paid' : 'pending', createdAt: new Date().toISOString() };
  orders.push(order);
  writeDB('data/orders.json', orders);
  res.json(order);
});

app.get('/api/orders', (req, res) => res.json(readDB('data/orders.json').reverse()));

app.put('/api/orders/:id', (req, res) => {
  const orders = readDB('data/orders.json');
  const o = orders.find(o => o.id === req.params.id);
  if (!o) return res.status(404).json({ error: 'غير موجود' });
  o.status = req.body.status;
  writeDB('data/orders.json', orders);
  res.json(o);
});

app.get('/api/settings', (req, res) => res.json(readDB('data/settings.json')));
app.put('/api/settings', (req, res) => { writeDB('data/settings.json', req.body); res.json(req.body); });

app.listen(PORT, () => console.log('المتجر يعمل على http://localhost:' + PORT));


async function translateText(text){
  if(!text) return '';
  try{
    const r = await fetch('https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair=ar|en');
    const d = await r.json();
    return d.responseData && d.responseData.translatedText ? d.responseData.translatedText : text;
  }catch(e){ return text; }
}
