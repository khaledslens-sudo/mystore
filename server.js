const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
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

app.post('/api/products', upload.single('image'), (req, res) => {
  const products = readDB('data/products.json');
  const p = { id: genId(), name: req.body.name, price: Number(req.body.price), category: req.body.category || '', stock: Number(req.body.stock) || 0, description: req.body.description || '', image: req.file ? '/uploads/' + req.file.filename : '' };
  products.push(p);
  writeDB('data/products.json', products);
  res.json(p);
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
  const products = readDB('data/products.json');
  const i = products.findIndex(p => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'غير موجود' });
  products[i] = { ...products[i], name: req.body.name || products[i].name, price: Number(req.body.price) || products[i].price, category: req.body.category || products[i].category, stock: Number(req.body.stock) ?? products[i].stock, description: req.body.description || products[i].description, image: req.file ? '/uploads/' + req.file.filename : products[i].image };
  writeDB('data/products.json', products);
  res.json(products[i]);
});

app.delete('/api/products/:id', (req, res) => {
  const products = readDB('data/products.json');
  writeDB('data/products.json', products.filter(p => p.id !== req.params.id));
  res.json({ ok: true });
});

app.post('/api/orders', upload.single('receipt'), (req, res) => {
  const { items, total, paymentMethod, customer } = req.body;
  const orders = readDB('data/orders.json');
  const order = { id: genId(), items: JSON.parse(items), total, paymentMethod, customer: JSON.parse(customer), receipt: req.file ? '/uploads/' + req.file.filename : null, status: paymentMethod === 'paypal' ? 'paid' : 'pending', createdAt: new Date().toISOString() };
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

