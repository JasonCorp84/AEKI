export const englishHealthMessages = {
  brand: 'AEKI',
  tagline: 'Everyday, considered.',
  navigation: 'System health',
  eyebrow: 'A place to begin',
  title: 'A solid start. A better everyday.',
  introduction:
    'A simple connection check for your AEKI workspace. One good foundation, ready to grow.',
  cardTitle: 'Your connection',
  cardEyebrow: 'Workspace status',
  checking: 'Checking API…',
  reachable: 'API reachable',
  unreachable: 'API unreachable',
  invalid: 'Invalid API response',
  checkingDetail: 'Connecting to your workspace. This will only take a moment.',
  reachableDetail: 'The API is responding with a valid health report.',
  unreachableDetail:
    'We could not reach the API. Check that it is running, then try again.',
  invalidDetail:
    'The API responded, but its health report did not match the agreed contract.',
  retry: 'Retry connection',
  checkAgain: 'Check again',
  scope:
    'The API and database checks are independent. Database readiness confirms connectivity, not product data or schema completeness.',
  footer: 'Built one thoughtful step at a time.',
};

export type HealthMessages = {
  readonly [Key in keyof typeof englishHealthMessages]: string;
};
