import {setupWorker} from 'msw/browser';
import {createProductSearchHandlers} from './products.handlers';

export const worker = setupWorker(...createProductSearchHandlers());
