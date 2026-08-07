with open('server.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re

old_decl = """const { MongoClient } = require('mongodb');
const MONGO_URI = process.env.MONGODB_URI || '';
let mongoClient, mongoDb;
const cache = {};

async function connectDB"""

if old_decl not in content:
    print("ERROR: declaration block not found - no changes made")
    exit(1)

content = content.replace(old_decl, "async function connectDB")

insertion = """const { MongoClient } = require('mongodb');
const MONGO_URI = process.env.MONGODB_URI || '';
let mongoClient, mongoDb;
const cache = {};

"""

require_pattern = re.compile(r"(const path = require\('path'\);\n)")
if not require_pattern.search(content):
    print("ERROR: require block not found - no changes made")
    exit(1)

content = require_pattern.sub(lambda m: m.group(1) + insertion, content, count=1)

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: moved cache declaration to top of file")
