import { parseHealthResponse, type HealthResponse } from '@aeki/contracts';
import { baseApi } from '../../app/api';
export const healthApi = baseApi.injectEndpoints({
  endpoints: (endpointBuilder) => ({
    getHealth: endpointBuilder.query<HealthResponse, void>({
      async queryFn(_queryArgument, _queryContext, _queryOptions, fetchHealthResponse) {
        const healthResponseResult = await fetchHealthResponse('health');
        if (healthResponseResult.error) return { error: healthResponseResult.error };
        try {
          return { data: parseHealthResponse(healthResponseResult.data) };
        } catch {
          return { error: { status: 'CUSTOM_ERROR', error: 'Invalid health response.' } };
        }
      },
    }),
  }),
});
export const { useGetHealthQuery } = healthApi;
