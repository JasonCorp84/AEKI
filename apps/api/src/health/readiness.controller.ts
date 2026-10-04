import { Controller, Get, Inject, Res } from '@nestjs/common';
import type { ReadinessResponse } from '@aeki/contracts';
import {
  databaseReadinessToken,
  type DatabaseReadinessProbe,
} from '../database/readiness-probe.js';

@Controller('readiness')
export class ReadinessController {
  constructor(
    @Inject(databaseReadinessToken) private readonly databaseReadiness: DatabaseReadinessProbe,
  ) {}

  @Get()
  async getReadiness(
    @Res({ passthrough: true }) response: { status(code: number): unknown },
  ): Promise<ReadinessResponse> {
    const readinessResult = await this.databaseReadiness.checkReadiness();
    response.status(readinessResult.status === 'ready' ? 200 : 503);
    return readinessResult;
  }
}
