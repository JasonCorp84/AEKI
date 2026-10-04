import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, sep } from 'node:path';
import SwaggerParser from '@apidevtools/swagger-parser';
import openapiTS, { astToString } from 'openapi-typescript';
import { parse } from 'yaml';
import { format, resolveConfig } from 'prettier';

const openApiSpecificationUrl = new URL('../contracts/openapi.yaml', import.meta.url);

await SwaggerParser.validate(fileURLToPath(openApiSpecificationUrl));

const openApiSpecification = parse(await readFile(openApiSpecificationUrl, 'utf8'));
const outputArgumentIndex = process.argv.indexOf('--output');
const generatedContractsDirectoryUrl =
  outputArgumentIndex === -1
    ? new URL('../packages/api-contracts/src/generated/', import.meta.url)
    : pathToFileURL(resolve(process.argv[outputArgumentIndex + 1]) + sep);
const generatedContractContents = {
  'openapi.ts': astToString(await openapiTS(openApiSpecificationUrl)),
  'health-schema.ts': `// Generated from OpenAPI. Do not edit.\nexport const healthSchema = ${JSON.stringify(openApiSpecification.components.schemas.HealthResponse, null, 2)};\n`,
  'readiness-schema.ts': `// Generated from OpenAPI. Do not edit.\nexport const readinessSchema = ${JSON.stringify({ oneOf: [openApiSpecification.components.schemas.ReadyResponse, openApiSpecification.components.schemas.NotReadyResponse] }, null, 2)};\n`,
};
for (const [generatedFileName, generatedFileContent] of Object.entries(generatedContractContents)) {
  const generatedFilePath = fileURLToPath(
    new URL(generatedFileName, generatedContractsDirectoryUrl),
  );
  const formattingOptions = await resolveConfig(generatedFilePath);
  generatedContractContents[generatedFileName] = await format(generatedFileContent, {
    ...formattingOptions,
    filepath: generatedFilePath,
  });
}
if (process.argv.includes('--check')) {
  for (const [generatedFileName, expectedFileContent] of Object.entries(
    generatedContractContents,
  )) {
    let actualFileContent;
    try {
      actualFileContent = await readFile(
        new URL(generatedFileName, generatedContractsDirectoryUrl),
        'utf8',
      );
    } catch {
      throw new Error(
        `Missing generated contract: ${generatedFileName}. Run npm run contracts:generate.`,
      );
    }
    if (actualFileContent !== expectedFileContent)
      throw new Error(`Contract drift: ${generatedFileName}. Run npm run contracts:generate.`);
  }
  console.log('OpenAPI valid; generated contracts match.');
} else {
  await mkdir(generatedContractsDirectoryUrl, { recursive: true });
  for (const [generatedFileName, generatedFileContent] of Object.entries(generatedContractContents))
    await writeFile(
      new URL(generatedFileName, generatedContractsDirectoryUrl),
      generatedFileContent,
    );
  console.log('OpenAPI valid; contracts generated.');
}
