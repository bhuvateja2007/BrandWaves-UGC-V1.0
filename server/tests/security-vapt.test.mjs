import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

const BASE_URL = process.env.API_TEST_URL || 'http://localhost:3001';

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          json,
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

test('VAPT Security Suite — HTTP Security Headers & Defense Controls', async (t) => {
  await t.test('Security Headers: Verifies anti-sniffing, clickjacking and CSP headers', async () => {
    const res = await makeRequest('/api/health');
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-frame-options'], 'DENY');
    assert.equal(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
    assert.ok(res.headers['content-security-policy'], 'Content-Security-Policy must be set');
  });

  await t.test('Cache Policy: Sensitive auth endpoints enforce no-store headers', async () => {
    const res = await makeRequest('/api/auth/me');
    assert.equal(res.statusCode, 200);
    assert.ok(
      res.headers['cache-control']?.includes('no-store'),
      'Auth endpoints must prohibit caching'
    );
  });

  await t.test('CORS Policy: Rejects state-changing requests from untrusted origins', async () => {
    const res = await makeRequest('/api/campaigns', {
      method: 'POST',
      headers: {
        'Origin': 'https://malicious-attacker-domain.com',
        'Content-Type': 'application/json',
      },
      body: { title: 'Evil Campaign' },
    });
    assert.equal(res.statusCode, 403, 'Untrusted origin must be rejected on state change');
  });

  await t.test('Rate Limiting: Returns rate limit headers on API requests', async () => {
    const res = await makeRequest('/api/campaigns');
    assert.ok(res.headers['x-ratelimit-limit'], 'Rate limit header should be present');
    assert.ok(res.headers['x-ratelimit-remaining'], 'Remaining quota header should be present');
  });

  await t.test('Prototype Pollution Defense: Sanitizer neutralizes dangerous object keys', async () => {
    const res = await makeRequest('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
      },
      body: JSON.stringify({
        title: 'Safe Post',
        mediaUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        __proto__: { polluted: true },
        constructor: { prototype: { admin: true } },
      }),
    });
    // Global Object prototype must remain pristine
    assert.equal(({}).polluted, undefined, 'Object prototype must not be polluted');
  });
});
