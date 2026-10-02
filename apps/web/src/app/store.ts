import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api';
export function createApplicationStore() {
    return configureStore({ reducer: { [baseApi.reducerPath]: baseApi.reducer }, middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware) });
}
