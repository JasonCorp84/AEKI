import {
  parseProductSearchResponse,
  parseProductSearchErrorResponse,
  type ProductSearchResponse,
} from '@aeki/contracts';
import {baseApi} from '../../../app/api';

const productsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    searchProducts: builder.query<ProductSearchResponse, string>({
      async queryFn(query, _queryApi, _extraOptions, executeRequest) {
        const response = await executeRequest({
          url: 'products',
          params: {query},
        });
        try {
          if (response.error) {
            if (response.error.status === 503)
              parseProductSearchErrorResponse(response.error.data);
            return {error: response.error};
          }
          return {data: parseProductSearchResponse(response.data)};
        } catch {
          return {
            error: {status: 'CUSTOM_ERROR', error: 'Invalid product response'},
          };
        }
      },
    }),
  }),
});

export const {useSearchProductsQuery} = productsApi;
