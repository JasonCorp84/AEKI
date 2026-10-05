import {Ajv} from 'ajv';
import type {components} from './generated/openapi.js';
import {healthSchema} from './generated/health-schema.js';
import {readinessSchema} from './generated/readiness-schema.js';
import {
  productSearchSchema,
  productSearchErrorSchema,
} from './generated/product-search-schema.js';

export type {components, operations} from './generated/openapi.js';
export type HealthResponse = components['schemas']['HealthResponse'];
export type ReadinessResponse = components['schemas']['ReadinessResponse'];
export type Product = components['schemas']['Product'];
export type ProductSearchResponse =
  components['schemas']['ProductSearchResponse'];
export type ProductSearchErrorResponse =
  components['schemas']['ProductSearchErrorResponse'];

const isValidProductSearchResponse = new Ajv({
  allErrors: true,
}).compile<ProductSearchResponse>(productSearchSchema);
const isValidProductSearchErrorResponse = new Ajv({
  allErrors: true,
}).compile<ProductSearchErrorResponse>(productSearchErrorSchema);

export function parseProductSearchResponse(
  untrustedResponse: unknown,
): ProductSearchResponse {
  if (!isValidProductSearchResponse(untrustedResponse))
    throw new Error('Invalid product search response.');
  return untrustedResponse;
}

export function parseProductSearchErrorResponse(
  untrustedResponse: unknown,
): ProductSearchErrorResponse {
  if (!isValidProductSearchErrorResponse(untrustedResponse))
    throw new Error('Invalid product search error response.');
  return untrustedResponse;
}

const isValidReadinessResponse = new Ajv({
  allErrors: true,
}).compile<ReadinessResponse>(readinessSchema);

export function parseReadinessResponse(
  untrustedReadinessResponse: unknown,
): ReadinessResponse {
  if (!isValidReadinessResponse(untrustedReadinessResponse)) {
    throw new Error('Invalid readiness response.');
  }
  return untrustedReadinessResponse;
}

const isValidHealthResponse = new Ajv({
  allErrors: true,
}).compile<HealthResponse>(healthSchema);

export function parseHealthResponse(
  untrustedHealthResponse: unknown,
): HealthResponse {
  if (!isValidHealthResponse(untrustedHealthResponse))
    throw new Error('Invalid health response.');
  return untrustedHealthResponse;
}
