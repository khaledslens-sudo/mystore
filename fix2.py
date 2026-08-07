with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# استبدال الدوال
old_functions = """function readDB(f) { return JSON.parse(fs.readFileSync(f, 'utf8')); }
function writeDB(f, d) { fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
function genId() { return Math.random().toString(36).slice(2, 9); }"""

new_functions = """const { MongoClient } = require('mongodb');
const MONGO_URI = process.env.MONGODB_URI || '';
let mongoClient, mongoDb;
const cache = {};

async function connectDB() {
  if (!MONGO_URI) { console.log('MONGODB_URI missing - using local files only'); return; }
  mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  mongoDb = mongoClient.db('zanova');
  console.log('MongoDB connected');
}

async function loadCache(files) {
  for (const f of files) {
    if (mongoDb) {
      const doc = await mongoDb.collection('store').findOne({ _id: f });
      if (doc) { cache[f] = doc.data; continue; }
    }
    cache[f] = fs.existsSync('data/' + f) ? JSON.parse(fs.readFileSync('data/' + f, 'utf8')) : [];
  }
}

function readDB(f) {
  const key = f.replace('data/', '');
  return cache[key] || [];
}

function writeDB(f, d) {
  const key = f.replace('data/', '');
  cache[key] = d;
  fs.writeFileSync(f, JSON.stringify(d, null, 2));
  if (mongoDb) {
    mongoDb.collection('store').updateOne({ _id: key }, { $set: { data: d } }, { upsert: true })
      .catch(e => console.error('MongoDB write error:', e.message));
  }
}

function genId() { return Math.random().toString(36).slice(2, 9); }"""

if old_functions not in content:
    print("ERROR: functions not found - no changes made")
    exit(1)

content = content.replace(old_functions, new_functions)

# استبدال app.listen (سطر واحد بسيط)
listen_pattern = re.compile(r"app\.listen\(PORT,.*?\);\n")
match = listen_pattern.search(content)
if not match:
    print("ERROR: app.listen not found - no changes made")
    exit(1)

old_listen = match.group(0)
new_listen = """connectDB().then(() => loadCache(['products.json', 'orders.json', 'users.json', 'settings.json'])).then(() => {
  app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));
});
"""

content = content.replace(old_listen, new_listen)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: server.js updated")
