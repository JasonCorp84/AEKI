import { useGetReadinessQuery } from './readiness.api';
import { englishReadinessMessages, type ReadinessMessages } from './readiness.messages';
import { ReadinessView, type ReadinessState } from './ReadinessView';

export function ReadinessStatus({
  messages = englishReadinessMessages,
}: {
  messages?: ReadinessMessages;
}) {
  const readinessQuery = useGetReadinessQuery();
  let readinessState: ReadinessState = { kind: 'requestFailed' };
  if (readinessQuery.data?.status === 'ready') {
    readinessState = { kind: 'ready' };
  } else if (readinessQuery.data?.status === 'not_ready') {
    readinessState = {
      kind: 'notReady',
      hasTimedOut: readinessQuery.data.code === 'DATABASE_TIMEOUT',
    };
  }
  if (readinessQuery.isFetching) {
    readinessState = { kind: 'checking' };
  } else if (readinessQuery.isError) {
    const queryError = readinessQuery.error;
    const hasInvalidResponse =
      queryError &&
      'status' in queryError &&
      (queryError.status === 'CUSTOM_ERROR' || queryError.status === 'PARSING_ERROR');
    readinessState = { kind: hasInvalidResponse ? 'invalid' : 'requestFailed' };
  }

  function retryReadinessRequest() {
    void readinessQuery.refetch();
  }

  return (
    <ReadinessView state={readinessState} messages={messages} onRetry={retryReadinessRequest} />
  );
}
