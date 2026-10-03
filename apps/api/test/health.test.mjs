import { afterEach, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { parseHealthResponse } from '@aeki/contracts';
import { AppModule } from '../dist/app.module.js';
let apiApplication;
afterEach(async () => {
    await apiApplication?.close();
});
it('reports API liveness through the actual HTTP boundary', async () => {
    const testingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    apiApplication = testingModule.createNestApplication();
    await apiApplication.listen(0, '127.0.0.1');
    const healthHttpResponse = await fetch(`${await apiApplication.getUrl()}/health`);
    expect(healthHttpResponse.status).toBe(200);
    expect(parseHealthResponse(await healthHttpResponse.json())).toEqual({ status: 'ok', service: 'aeki-api' });
});
