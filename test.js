// Quick smoke-test script – run with: node test.js
const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = http.request(options, res => {
      let raw = '';
      res.on('data', chunk => (raw += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('=== Smoke Tests ===\n');

  let r;

  r = await request('GET', '/');
  console.log(`GET /           → ${r.status}`, JSON.stringify(r.body));

  r = await request('GET', '/health');
  console.log(`GET /health     → ${r.status}`, JSON.stringify(r.body));

  r = await request('GET', '/tasks');
  console.log(`GET /tasks      → ${r.status} (${r.body.length} tasks)`);

  r = await request('GET', '/tasks/1');
  console.log(`GET /tasks/1    → ${r.status}`, JSON.stringify(r.body));

  r = await request('GET', '/tasks/99');
  console.log(`GET /tasks/99   → ${r.status}`, JSON.stringify(r.body));  // expect 404

  r = await request('POST', '/tasks', { title: 'Walk the dog' });
  console.log(`POST /tasks     → ${r.status}`, JSON.stringify(r.body));  // expect 201

  r = await request('POST', '/tasks', {});
  console.log(`POST /tasks {}  → ${r.status}`, JSON.stringify(r.body));  // expect 400

  r = await request('PUT', '/tasks/1', { done: true });
  console.log(`PUT /tasks/1    → ${r.status}`, JSON.stringify(r.body));  // expect 200 done:true

  r = await request('DELETE', '/tasks/1', null);
  console.log(`DELETE /tasks/1 → ${r.status}`);  // expect 204

  r = await request('GET', '/tasks/1');
  console.log(`GET /tasks/1    → ${r.status}`, JSON.stringify(r.body));  // expect 404

  console.log('\n✅ All smoke tests completed.');
}

run().catch(err => { console.error('Test error:', err); process.exit(1); });
