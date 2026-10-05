import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {createApplicationStore} from './app/store';
import {Application} from './app/Application';
import './shared/theme/tokens.css';
const applicationRootElement = document.getElementById('root');
if (!applicationRootElement) throw new Error('Missing application root.');
const fixtureMode =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true';
if (fixtureMode) {
  const {worker} = await import('./mocks/browser');
  await worker.start({onUnhandledRequest: 'bypass'});
}
createRoot(applicationRootElement).render(
  <StrictMode>
    <Provider store={createApplicationStore()}>
      <Application fixtureMode={fixtureMode} />
    </Provider>
  </StrictMode>,
);
