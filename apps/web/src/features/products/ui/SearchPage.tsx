import {useProductSearch} from '../model/useProductSearch';
import {
  englishSearchMessages,
  type SearchMessages,
} from '../model/search.messages';
import {ProductCard} from './ProductCard';
import styles from './SearchPage.module.css';

type SearchPageProps = {messages?: SearchMessages};

export function SearchPage({
  messages = englishSearchMessages,
}: SearchPageProps) {
  const search = useProductSearch();
  const state = search.state;
  const hasError = state.kind === 'failed' || state.kind === 'invalid';
  return (
    <main className={styles['page']}>
      <section
        className={styles['introduction']}
        aria-labelledby="search-title"
      >
        <div>
          <p className={styles['eyebrow']}>{messages.eyebrow}</p>
          <h1 id="search-title">{messages.title}</h1>
          <p>{messages.introduction}</p>
        </div>
        <div className={styles['searchControls']}>
          <label htmlFor="product-search">{messages.searchLabel}</label>
          <input
            id="product-search"
            type="search"
            role="textbox"
            value={search.input}
            onChange={event => search.changeInput(event.target.value)}
            placeholder={messages.searchPlaceholder}
            autoComplete="off"
            aria-describedby="search-status"
          />
        </div>
      </section>
      <section className={styles['results']} aria-label={messages.searchLabel}>
        {hasError ? (
          <div className={styles['error']}>
            <p role="alert" id="search-status">
              {state.kind === 'invalid' ? messages.invalid : messages.failed}
            </p>
            <button type="button" onClick={search.retrySearch}>
              {messages.retry}
            </button>
          </div>
        ) : (
          <p role="status" id="search-status">
            {state.kind === 'results'
              ? messages.resultCount(state.products.length)
              : messages[state.kind]}
          </p>
        )}
        {state.kind === 'results' && (
          <div className={styles['grid']}>
            {state.products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                messages={messages}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
