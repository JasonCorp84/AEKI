export const englishReadinessMessages = {
  title: 'Database connection',
  checking: 'Checking database…',
  checkingDetail: 'Asking the API to check its database connection.',
  ready: 'Database ready',
  readyDetail: 'The API completed a real PostgreSQL connectivity query.',
  notReady: 'Database not ready',
  notReadyDetail: 'The API is responding, but its database connection is unavailable.',
  timedOutDetail: 'The database check exceeded its time limit. The API is still responding.',
  invalid: 'Invalid readiness response',
  invalidDetail: 'The API responded, but the readiness report did not match the agreed contract.',
  requestFailed: 'Readiness check failed',
  requestFailedDetail:
    'We could not complete the readiness request. Database availability is unknown.',
  retry: 'Retry database check',
  checkAgain: 'Check database again',
};

export type ReadinessMessages = { readonly [Key in keyof typeof englishReadinessMessages]: string };
