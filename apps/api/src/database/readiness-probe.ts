import type { ReadinessResponse } from '@aeki/contracts';

export const databaseReadinessToken = Symbol('DatabaseReadinessProbe');
export interface DatabaseReadinessProbe {
  checkReadiness(): Promise<ReadinessResponse>;
}
