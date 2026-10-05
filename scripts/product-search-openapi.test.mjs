import assert from 'node:assert/strict';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';
import SwaggerParser from '@apidevtools/swagger-parser';
import {Ajv} from 'ajv';

const specificationPath = fileURLToPath(
  new URL('../contracts/openapi.yaml', import.meta.url),
);

test('the documented search operation accepts a name or a leading-zero article number and rejects empty transport criteria', async () => {
  const specification = await SwaggerParser.dereference(specificationPath);
  const operation = specification.paths['/products']?.get;
  assert.ok(operation, 'OpenAPI must define GET /products.');
  assert.equal(operation.operationId, 'searchProducts');
  const queryParameter = operation.parameters.find(
    parameter => parameter.name === 'query' && parameter.in === 'query',
  );
  assert.ok(
    queryParameter,
    'Search criteria must be declared in the query string.',
  );
  assert.equal(queryParameter.required, true);
  const validateQuery = new Ajv().compile(queryParameter.schema);
  assert.equal(validateQuery('LINDEN'), true);
  assert.equal(validateQuery('00012345'), true);
  assert.equal(validateQuery(''), false);
  assert.equal(validateQuery(12345), false);
});

test('documented success and error examples conform to their response schemas', async () => {
  const specification = await SwaggerParser.dereference(specificationPath);
  const operation = specification.paths['/products']?.get;
  assert.ok(operation, 'OpenAPI must define GET /products.');
  const success = operation.responses['200'].content['application/json'];
  const unavailable = operation.responses['503'].content['application/json'];
  const ajv = new Ajv({strict: false, validateFormats: false});
  const validateSuccess = ajv.compile(success.schema);
  const validateUnavailable = ajv.compile(unavailable.schema);
  assert.ok(
    success.examples?.results?.value,
    'Document a nonempty results example.',
  );
  assert.ok(
    success.examples?.empty?.value,
    'Document an empty-results example.',
  );
  assert.ok(unavailable.example, 'Document a recoverable service failure.');
  assert.equal(validateSuccess(success.examples.results.value), true);
  assert.equal(validateSuccess(success.examples.empty.value), true);
  assert.ok(success.examples.results.value.items.length > 0);
  assert.deepEqual(success.examples.empty.value, {items: []});
  assert.equal(validateUnavailable(unavailable.example), true);
  assert.deepEqual(unavailable.example, {code: 'PRODUCT_SEARCH_UNAVAILABLE'});
  assert.equal(validateUnavailable({code: 'UNKNOWN'}), false);
});
