import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { Product } from '../../types';
import { useLanguage } from '../providers/LanguageProvider';
import { useCart } from '../providers/CartProvider';
import { cdnImage, cdnSrcSet, discountPercent, formatPrice } from '../../lib/format';

const CARD_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw';
const CARD_WIDTHS = [300, 450, 600, 800];
import { BagIcon } from '../ui/Icon';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  /** Index for staggered reveal animation. */
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const discount = discountPercent(product.minPrice, product.compareAtPrice);
  const onSale = discount > 0;
  const secondary = product.images[1];

  const handleQuickAdd = () => {
    const variant = product.variants.find((v) => v.available) ?? product.variants[0];
    add({
      handle: product.handle,
      variantId: variant?.id ?? product.id,
      title: product.title,
      variantTitle: variant?.title ?? '',
      price: product.minPrice,
      image: product.image,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className={styles.card}>
      <Link
        to={`/product/${product.handle}`}
        className={styles.media}
        aria-label={product.title}
      >
        <div className={styles.badges}>
          {onSale && (
            <span className={`${styles.badge} ${styles.badgeSale}`}>-{discount}%</span>
          )}
          {!product.available && (
            <span className={`${styles.badge} ${styles.badgeSoldOut}`}>
              {t('common.soldOut')}
            </span>
          )}
        </div>

        <img
          src={cdnImage(product.image, 600)}
          srcSet={cdnSrcSet(product.image, CARD_WIDTHS)}
          sizes={CARD_SIZES}
          alt={product.title}
          className={`${styles.img} ${styles.imgPrimary}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          width={600}
          height={800}
        />
        {secondary && (
          <img
            src={cdnImage(secondary, 600)}
            srcSet={cdnSrcSet(secondary, CARD_WIDTHS)}
            sizes={CARD_SIZES}
            alt=""
            aria-hidden="true"
            className={`${styles.img} ${styles.imgSecondary}`}
            loading="lazy"
            decoding="async"
            width={600}
            height={800}
          />
        )}

        {product.available && (
          <div className={styles.quickAdd}>
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={(e) => {
                e.preventDefault();
                handleQuickAdd();
              }}
            >
              <BagIcon size={16} />
              {added ? t('product.added') : t('product.addToCart')}
            </button>
          </div>
        )}
      </Link>

      <div className={styles.body}>
        <span className={styles.type}>
          {t(`subcategory.${product.subcategory}`, { defaultValue: product.type })}
        </span>
        <Link to={`/product/${product.handle}`}>
          <h3 className={styles.title}>{product.title}</h3>
        </Link>
        <div className={styles.priceRow}>
          <span className={`${styles.price} ${onSale ? styles.priceSale : ''}`}>
            {formatPrice(product.minPrice, language)}
          </span>
          {onSale && (
            <span className={styles.compare}>
              {formatPrice(product.compareAtPrice, language)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
