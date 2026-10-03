import { Ajv } from 'ajv';
import type { components } from './generated/openapi.js';
import { healthSchema } from './generated/health-schema.js';
export type { components, operations } from './generated/openapi.js';
export type HealthResponse = components['schemas']['HealthResponse'];
const isValidHealthResponse = new Ajv({ allErrors: true }).compile<HealthResponse>(healthSchema);
export function parseHealthResponse(untrustedHealthResponse: unknown): HealthResponse {
    if (!isValidHealthResponse(untrustedHealthResponse))
        throw new Error('Invalid health response.');
    return untrustedHealthResponse;
}
