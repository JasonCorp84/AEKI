import type {ReadinessMessages} from './readiness.messages';
import styles from './HealthView.module.css';

export type ReadinessState =
  | {kind: 'checking'}
  | {kind: 'ready'}
  | {kind: 'notReady'; hasTimedOut: boolean}
  | {kind: 'invalid'}
  | {kind: 'requestFailed'};

type ReadinessViewProps = {
  state: ReadinessState;
  messages: ReadinessMessages;
  onRetry: () => void;
};

export function ReadinessView({state, messages, onRetry}: ReadinessViewProps) {
  const isCheckingDatabase = state.kind === 'checking';
  const isDatabaseReady = state.kind === 'ready';
  const detailsByState = {
    checking: messages.checkingDetail,
    ready: messages.readyDetail,
    notReady:
      state.kind === 'notReady' && state.hasTimedOut
        ? messages.timedOutDetail
        : messages.notReadyDetail,
    invalid: messages.invalidDetail,
    requestFailed: messages.requestFailedDetail,
  };
  const statusAppearanceByState = {
    checking: {className: styles.checking, symbol: '·'},
    ready: {className: styles.healthy, symbol: '✓'},
    notReady: {className: styles.failure, symbol: '!'},
    invalid: {className: styles.failure, symbol: '!'},
    requestFailed: {className: styles.failure, symbol: '?'},
  };
  const statusAppearance = statusAppearanceByState[state.kind];

  return (
    <section
      className={styles.report}
      aria-label={messages.title}
      aria-busy={isCheckingDatabase}
    >
      <p className={styles.eyebrow}>{messages.title}</p>
      <div role="status" aria-live="polite">
        <span
          className={`${styles.indicator} ${statusAppearance.className}`}
          aria-hidden="true"
        >
          {statusAppearance.symbol}
        </span>
        <h3>{messages[state.kind]}</h3>
        <p>{detailsByState[state.kind]}</p>
      </div>
      <button
        type="button"
        className={`${styles.action} ${styles.databaseAction}`}
        onClick={onRetry}
        disabled={isCheckingDatabase}
      >
        {isDatabaseReady ? messages.checkAgain : messages.retry}
      </button>
    </section>
  );
}
