import type {Product} from '@aeki/contracts';
import type {SearchMessages} from '../model/search.messages';
import currencyMinorUnitExceptions from '../model/currency-minor-unit-exceptions.json';
import styles from './SearchPage.module.css';

type ProductCardProps = {product: Product; messages: SearchMessages};
const currencyPrecision: Readonly<Record<string, number>> =
  currencyMinorUnitExceptions;

export function ProductCard({product, messages}: ProductCardProps) {
  const priceFormatter = new Intl.NumberFormat(messages.locale, {
    style: 'currency',
    currency: product.price.currency,
    currencyDisplay: 'code',
  });
  // ISO transport precision is independent of Intl's display rounding.
  const minorUnitDigits = currencyPrecision[product.price.currency] ?? 2;
  const minorUnitsPerUnit = 10 ** minorUnitDigits;
  const formattedPrice = priceFormatter.format(
    product.price.amountMinor / minorUnitsPerUnit,
  );
  return (
    <article className={styles['card']} aria-label={product.name}>
      <div className={styles['imageSurface']}>
        <img
          src={product.image.url}
          alt={product.image.alt}
          width="320"
          height="240"
        />
      </div>
      <div className={styles['cardContent']}>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p className={styles['articleNumber']}>
          {messages.articleLabel}: {product.articleNumber}
        </p>
        <p className={styles['price']}>{formattedPrice}</p>
        <p className={styles['stock']}>
          {product.stock.storeName} ·{' '}
          {messages.availableStock(product.stock.quantity)}
        </p>
        <small>{messages.stockDisclaimer}</small>
      </div>
    </article>
  );
}
