import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createApplicationStore } from './app/store';
import { HealthPage } from './features/health/HealthPage';
import './shared/theme/tokens.css';
const applicationRootElement = document.getElementById('root');
if (!applicationRootElement)
    throw new Error('Missing application root.');
createRoot(applicationRootElement).render(<StrictMode><Provider store={createApplicationStore()}><HealthPage /></Provider></StrictMode>);
