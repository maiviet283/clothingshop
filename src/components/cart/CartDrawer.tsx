import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../providers/CartProvider';
import { useLanguage } from '../providers/LanguageProvider';
import { formatPrice, cdnImage } from '../../lib/format';
import { BagIcon, CloseIcon, MinusIcon, PlusIcon } from '../ui/Icon';
import styles from './CartDrawer.module.css';

export function CartDrawer() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { items, subtotal, isOpen, close, remove, setQuantity } = useCart();

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={close} aria-hidden="true" />
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={t('cart.title')}
      >
        <div className={styles.head}>
          <h2 className={styles.title}>
            {t('cart.title')}
            {items.length > 0 && ` (${items.reduce((n, i) => n + i.quantity, 0)})`}
          </h2>
          <button type="button" className={styles.close} aria-label={t('search.close')} onClick={close}>
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <BagIcon size={40} />
            <p className={styles.emptyTitle}>{t('cart.empty')}</p>
            <p className={styles.emptyHint}>{t('cart.emptyHint')}</p>
            <button type="button" className="btn btn--outline" onClick={close}>
              {t('cart.continue')}
            </button>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item) => (
                <div key={item.key} className={styles.item}>
                  <Link to={`/product/${item.handle}`} onClick={close}>
                    <img
                      src={cdnImage(item.image, 200)}
                      alt={item.title}
                      className={styles.thumb}
                      loading="lazy"
                    />
                  </Link>
                  <div>
                    <Link to={`/product/${item.handle}`} onClick={close}>
                      <p className={styles.itemName}>{item.title}</p>
                    </Link>
                    {item.variantTitle && item.variantTitle !== 'Default Title' && (
                      <p className={styles.itemVariant}>{item.variantTitle}</p>
                    )}
                    <p className={styles.itemPrice}>{formatPrice(item.price, language)}</p>
                    <div className={styles.qtyRow}>
                      <div className={styles.qty}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          aria-label={t('cart.quantity')}
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                        >
                          <MinusIcon size={14} />
                        </button>
                        <span className={styles.qtyVal}>{item.quantity}</span>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          aria-label={t('cart.quantity')}
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                        >
                          <PlusIcon size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => remove(item.key)}
                      >
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>
                  <span className={styles.itemPrice}>
                    {formatPrice(item.price * item.quantity, language)}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.foot}>
              <div className={styles.subtotal}>
                <span className={styles.subtotalLabel}>{t('cart.subtotal')}</span>
                <span className={styles.subtotalVal}>{formatPrice(subtotal, language)}</span>
              </div>
              <button type="button" className="btn btn--accent btn--block" disabled>
                {t('cart.checkout')}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
