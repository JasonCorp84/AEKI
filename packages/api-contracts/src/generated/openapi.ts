export interface paths {
  '/health': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Report whether the API process is reachable */
    get: operations['getHealth'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/readiness': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Report current database connectivity independently of process liveness */
    get: operations['getReadiness'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    HealthResponse: {
      /** @enum {string} */
      status: 'ok';
      /** @enum {string} */
      service: 'aeki-api';
    };
    ReadyResponse: {
      /** @enum {string} */
      status: 'ready';
      /** @enum {string} */
      database: 'reachable';
    };
    NotReadyResponse: {
      /** @enum {string} */
      status: 'not_ready';
      /** @enum {string} */
      database: 'unreachable';
      /** @enum {string} */
      code: 'DATABASE_UNAVAILABLE' | 'DATABASE_TIMEOUT';
    };
    ReadinessResponse:
      components['schemas']['ReadyResponse'] | components['schemas']['NotReadyResponse'];
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  getHealth: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description The API process is alive. This does not establish database readiness. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "status": "ok",
           *       "service": "aeki-api"
           *     }
           */
          'application/json': components['schemas']['HealthResponse'];
        };
      };
    };
  };
  getReadiness: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description A real database connectivity query succeeded */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReadyResponse'];
        };
      };
      /** @description Database connectivity failed or exceeded its deadline */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NotReadyResponse'];
        };
      };
    };
  };
}
