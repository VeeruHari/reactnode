import test from 'node:test';
import assert from 'node:assert/strict';

import { verifyTurnstileToken } from '../middleware/turnstileMiddleware.js';

test('verifyTurnstileToken skips validation in non-production environments', async () => {
  const previousEnv = process.env.NODE_ENV;
  const previousSkip = process.env.SKIP_TURNSTILE;

  process.env.NODE_ENV = 'development';
  process.env.SKIP_TURNSTILE = '';

  try {
    const result = await verifyTurnstileToken('dummy-token', undefined);
    assert.equal(result, true);
  } finally {
    process.env.NODE_ENV = previousEnv;
    process.env.SKIP_TURNSTILE = previousSkip;
  }
});
