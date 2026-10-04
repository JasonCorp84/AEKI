import { Ajv } from 'ajv';
import type { components } from './generated/openapi.js';
import { healthSchema } from './generated/health-schema.js';
import { readinessSchema } from './generated/readiness-schema.js';

export type { components, operations } from './generated/openapi.js';
export type HealthResponse = components['schemas']['HealthResponse'];
export type ReadinessResponse = components['schemas']['ReadinessResponse'];

const isValidReadinessResponse = new Ajv({ allErrors: true }).compile<ReadinessResponse>(
  readinessSchema,
);

export function parseReadinessResponse(untrustedReadinessResponse: unknown): ReadinessResponse {
  if (!isValidReadinessResponse(untrustedReadinessResponse)) {
    throw new Error('Invalid readiness response.');
  }
  return untrustedReadinessResponse;
}

const isValidHealthResponse = new Ajv({ allErrors: true }).compile<HealthResponse>(healthSchema);

export function parseHealthResponse(untrustedHealthResponse: unknown): HealthResponse {
  if (!isValidHealthResponse(untrustedHealthResponse)) throw new Error('Invalid health response.');
  return untrustedHealthResponse;
}
