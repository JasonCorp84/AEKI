import {expect, it} from 'vitest';
import {parseHealthResponse} from './index.js';
it('rejects an untrusted response that reports an unsupported health status', () => {
  expect(() =>
    parseHealthResponse({status: 'unhealthy', service: 'aeki-api'}),
  ).toThrow();
});
it('returns the validated liveness payload', () => {
  expect(parseHealthResponse({status: 'ok', service: 'aeki-api'})).toEqual({
    status: 'ok',
    service: 'aeki-api',
  });
});
it.each([
  null,
  {},
  {status: 'ok'},
  {status: 'ok', service: 'other'},
  {status: 'ok', service: 'aeki-api', extra: true},
])(
  'rejects a payload outside the health contract: %j',
  invalidHealthResponse => {
    expect(() => parseHealthResponse(invalidHealthResponse)).toThrow(
      'Invalid health response.',
    );
  },
);
