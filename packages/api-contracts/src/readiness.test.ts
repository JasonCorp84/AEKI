import { expect, it } from 'vitest';
import { parseReadinessResponse } from './index.js';

it('accepts a contracted database-ready response', () => {
  expect(parseReadinessResponse({ status: 'ready', database: 'reachable' })).toEqual({
    status: 'ready',
    database: 'reachable',
  });
});

it.each(['DATABASE_UNAVAILABLE', 'DATABASE_TIMEOUT'])(
  'accepts the expected not-ready response: %s',
  (code) => {
    expect(parseReadinessResponse({ status: 'not_ready', database: 'unreachable', code })).toEqual({
      status: 'not_ready',
      database: 'unreachable',
      code,
    });
  },
);

it.each([
  null,
  {},
  { status: 'ready', database: 'unreachable' },
  { status: 'not_ready', database: 'unreachable' },
  { status: 'not_ready', database: 'unreachable', code: 'UNKNOWN' },
  { status: 'ready', database: 'reachable', connection: 'secret' },
])('rejects readiness outside the contract: %j', (response) => {
  expect(() => parseReadinessResponse(response)).toThrow('Invalid readiness response.');
});
