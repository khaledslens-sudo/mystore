with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_write = """function writeDB(f, d) {
  const key = f.replace('data/', '');
  cache[key] = d;
  fs.writeFileSync(f, JSON.stringify(d, null, 2));
  if (mongoDb) {
    mongoDb.collection('store').updateOne({ _id: key }, { $set: { data: d } }, { upsert: true })
      .catch(e => console.error('MongoDB write error:', e.message));
  }
}"""

new_write = """let pendingWrites = 0;
function writeDB(f, d) {
  const key = f.replace('data/', '');
  cache[key] = d;
  fs.writeFileSync(f, JSON.stringify(d, null, 2));
  if (mongoDb) {
    pendingWrites++;
    mongoDb.collection('store').updateOne({ _id: key }, { $set: { data: d } }, { upsert: true })
      .catch(e => console.error('MongoDB write error:', e.message))
      .finally(() => { pendingWrites--; });
  }
}

async function waitForPendingWrites() {
  let waited = 0;
  while (pendingWrites > 0 && waited < 8000) {
    await new Promise(r => setTimeout(r, 100));
    waited += 100;
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, waiting for pending writes: ' + pendingWrites);
  await waitForPendingWrites();
  console.log('Shutdown complete');
  process.exit(0);
});"""

if old_write not in content:
    print("ERROR: writeDB function not found - no changes made")
    exit(1)

content = content.replace(old_write, new_write)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: server.js updated with graceful shutdown")
