import {useGetHealthQuery} from './health.api';
import {HealthView, type HealthState} from './HealthView';
import {englishHealthMessages, type HealthMessages} from './health.messages';
import {ReadinessStatus} from './ReadinessStatus';
import {
  englishReadinessMessages,
  type ReadinessMessages,
} from './readiness.messages';

type HealthPageProps = {
  messages?: HealthMessages;
  readinessMessages?: ReadinessMessages;
};

export function HealthPage({
  messages = englishHealthMessages,
  readinessMessages = englishReadinessMessages,
}: HealthPageProps) {
  const healthQuery = useGetHealthQuery();
  let healthState: HealthState = healthQuery.data
    ? {kind: 'reachable'}
    : {kind: 'checking'};

  if (healthQuery.isFetching) {
    healthState = {kind: 'checking'};
  } else if (healthQuery.isError) {
    const queryError = healthQuery.error;
    const hasInvalidResponse =
      queryError &&
      'status' in queryError &&
      (queryError.status === 'CUSTOM_ERROR' ||
        queryError.status === 'PARSING_ERROR');
    healthState = {kind: hasInvalidResponse ? 'invalid' : 'unreachable'};
  }

  function retryHealthRequest() {
    void healthQuery.refetch();
  }

  return (
    <HealthView
      healthState={healthState}
      messages={messages}
      onRetry={retryHealthRequest}
    >
      <ReadinessStatus messages={readinessMessages} />
    </HealthView>
  );
}
