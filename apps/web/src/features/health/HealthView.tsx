import type {HealthMessages} from './health.messages';
import styles from './HealthView.module.css';
import type {ReactNode} from 'react';

export type HealthState =
  | {kind: 'checking'}
  | {kind: 'reachable'}
  | {kind: 'unreachable'}
  | {kind: 'invalid'};

type HealthViewProps = {
  healthState: HealthState;
  messages: HealthMessages;
  onRetry: () => void;
  children?: ReactNode;
};

export function HealthView({
  healthState,
  messages,
  onRetry,
  children,
}: HealthViewProps) {
  const isCheckingConnection = healthState.kind === 'checking';
  const isApiReachable = healthState.kind === 'reachable';
  const detailMessagesByState = {
    checking: messages.checkingDetail,
    reachable: messages.reachableDetail,
    unreachable: messages.unreachableDetail,
    invalid: messages.invalidDetail,
  };
  const indicatorStylesByState = {
    checking: styles.checking,
    reachable: styles.healthy,
    unreachable: styles.failure,
    invalid: styles.failure,
  };
  const indicatorSymbolsByState = {
    checking: '·',
    reachable: '✓',
    unreachable: '!',
    invalid: '!',
  };
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.brand} aria-label={messages.brand}>
          {messages.brand}
          <span aria-hidden="true">.</span>
        </a>
        <span className={styles.tagline}>{messages.tagline}</span>
        <span className={styles.navigation}>{messages.navigation}</span>
      </header>
      <main className={styles.main}>
        <section className={styles.introduction} aria-labelledby="health-title">
          <p className={styles.eyebrow}>{messages.eyebrow}</p>
          <h1 id="health-title">{messages.title}</h1>
          <p className={styles.description}>{messages.introduction}</p>
          <div className={styles.illustration} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>
        <section
          className={styles.card}
          aria-labelledby="connection-title"
          aria-busy={isCheckingConnection}
        >
          <p className={styles.eyebrow}>{messages.cardEyebrow}</p>
          <h2 id="connection-title">{messages.cardTitle}</h2>
          <div className={styles.report} role="status" aria-live="polite">
            <span
              className={`${styles.indicator} ${indicatorStylesByState[healthState.kind]}`}
              aria-hidden="true"
            >
              {indicatorSymbolsByState[healthState.kind]}
            </span>
            <h3>{messages[healthState.kind]}</h3>
            <p>{detailMessagesByState[healthState.kind]}</p>
          </div>
          <button
            type="button"
            className={styles.action}
            onClick={onRetry}
            disabled={isCheckingConnection}
          >
            {isApiReachable ? messages.checkAgain : messages.retry}
          </button>
          {children}
          <p className={styles.scope}>{messages.scope}</p>
        </section>
      </main>
      <footer className={styles.footer}>
        <span>{messages.tagline}</span>
        <span>{messages.footer}</span>
      </footer>
    </div>
  );
}
