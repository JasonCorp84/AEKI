import {parseReadinessResponse, type ReadinessResponse} from '@aeki/contracts';
import {baseApi} from '../../app/api';

export const readinessApi = baseApi.injectEndpoints({
  endpoints: endpointBuilder => ({
    getReadiness: endpointBuilder.query<ReadinessResponse, void>({
      async queryFn(
        _queryArgument,
        _queryContext,
        _queryOptions,
        fetchReadinessResponse,
      ) {
        const readinessResponseResult = await fetchReadinessResponse({
          url: 'readiness',
          validateStatus: response =>
            response.status === 200 || response.status === 503,
        });
        if (readinessResponseResult.error)
          return {error: readinessResponseResult.error};
        try {
          const readinessResult = parseReadinessResponse(
            readinessResponseResult.data,
          );
          const expectedHttpStatus =
            readinessResult.status === 'ready' ? 200 : 503;
          if (
            readinessResponseResult.meta?.response?.status !==
            expectedHttpStatus
          ) {
            throw new Error(
              'Readiness status does not match its HTTP response.',
            );
          }
          return {data: readinessResult};
        } catch {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Invalid readiness response.',
            },
          };
        }
      },
    }),
  }),
});

export const {useGetReadinessQuery} = readinessApi;
