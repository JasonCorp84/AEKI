import {HealthPage} from '../features/health/HealthPage';
import {SearchPage} from '../features/products/ui/SearchPage';
import styles from './Application.module.css';

export const englishApplicationMessages = {
  connectionLink: 'Connection status',
  fixtureMode: 'Development fixtures',
};
type ApplicationMessages = {connectionLink: string; fixtureMode: string};

export function Application({
  fixtureMode,
  messages = englishApplicationMessages,
}: {
  fixtureMode: boolean;
  messages?: ApplicationMessages;
}) {
  return (
    <>
      <header className={styles['header']}>
        <a className={styles['brand']} href="/search">
          AEKI
        </a>
        <a href="/">{messages.connectionLink}</a>
        {fixtureMode && (
          <span className={styles['fixtureMode']}>{messages.fixtureMode}</span>
        )}
      </header>
      {window.location.pathname === '/search' ? <SearchPage /> : <HealthPage />}
    </>
  );
}
