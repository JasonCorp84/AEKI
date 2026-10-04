export function requireDatabaseUrl(configuredDatabaseUrl: string | undefined): string {
  if (!configuredDatabaseUrl) {
    throw new Error(
      'DATABASE_URL is required. Copy .env.example to .env and configure PostgreSQL.',
    );
  }
  try {
    const databaseUrl = new URL(configuredDatabaseUrl);
    if (
      !['postgres:', 'postgresql:'].includes(databaseUrl.protocol) ||
      !databaseUrl.hostname ||
      !databaseUrl.username ||
      !databaseUrl.password ||
      databaseUrl.pathname.length < 2
    ) {
      throw new Error();
    }
    return configuredDatabaseUrl;
  } catch {
    throw new Error(
      'DATABASE_URL must be a PostgreSQL URL with host, credentials and database name.',
    );
  }
}
