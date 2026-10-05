import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
const apiBaseUrl = new URL(
  import.meta.env.VITE_API_BASE_URL ?? '/api/',
  window.location.origin,
).href;
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({baseUrl: apiBaseUrl, timeout: 3000}),
  endpoints: () => ({}),
});
