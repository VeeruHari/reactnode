import test from 'node:test';
import assert from 'node:assert/strict';

import { getSessionSecret } from '../middleware/sessionMiddleware.js';

test('getSessionSecret falls back to a development secret when env is missing', () => {
  const previousSecret = process.env.SESSION_SECRET;
  delete process.env.SESSION_SECRET;

  try {
    const secret = getSessionSecret();
    assert.equal(typeof secret, 'string');
    assert.ok(secret.length > 0);
  } finally {
    if (previousSecret === undefined) {
      delete process.env.SESSION_SECRET;
    } else {
      process.env.SESSION_SECRET = previousSecret;
    }
  }
});

test('getSessionSecret returns the configured env value when present', () => {
  const previousSecret = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = 'test-secret';

  try {
    assert.equal(getSessionSecret(), 'test-secret');
  } finally {
    if (previousSecret === undefined) {
      delete process.env.SESSION_SECRET;
    } else {
      process.env.SESSION_SECRET = previousSecret;
    }
  }
});
