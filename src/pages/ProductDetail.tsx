import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ProductGrid } from '../components/product/ProductGrid';
import { NotFoundView } from './NotFound';
import { useLanguage } from '../components/providers/LanguageProvider';
import { useCart } from '../components/providers/CartProvider';
import { getProduct, getCategory, relatedProducts } from '../lib/catalog';
import { cdnImage, discountPercent, formatPrice } from '../lib/format';
import { absoluteUrl } from '../lib/site';
import { BagIcon, CheckIcon, RefreshIcon, ShieldIcon, TruckIcon } from '../components/ui/Icon';
import type { Variant } from '../types';
import styles from './ProductDetail.module.css';

const DEFAULT_TITLE = 'Default Title';

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const product = handle ? getProduct(handle) : undefined;

  // Hooks must run unconditionally — guard the value, not the hooks.
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { add } = useCart();

  const realOptions = useMemo(
    () => (product?.options ?? []).filter((o) => o.values.length > 0 && o.values[0] !== DEFAULT_TITLE),
    [product],
  );

  const [activeImage, setActiveImage] = useState(0);
  const [selection, setSelection] = useState<Record<number, string>>({});
  const [added, setAdded] = useState(false);

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (!product) return undefined;
    if (realOptions.length === 0) return product.variants[0];
    return product.variants.find((v) =>
      realOptions.every((opt, i) => {
        const chosen = selection[i];
        if (!chosen) return false;
        const value = [v.option1, v.option2, v.option3][optionIndex(product, opt.name)];
        return value === chosen;
      }),
    );
  }, [product, realOptions, selection]);

  if (!product) return <NotFoundView />;

  const discount = discountPercent(product.minPrice, product.compareAtPrice);
  const onSale = discount > 0;
  const displayPrice = selectedVariant?.price ?? product.minPrice;
  const cat = getCategory(product.category);
  const related = relatedProducts(product, 4);
  const allSelected = realOptions.length === 0 || realOptions.every((_, i) => selection[i]);
  const variantAvailable = selectedVariant ? selectedVariant.available : product.available;

  const handleAdd = () => {
    if (!allSelected || !variantAvailable) return;
    const variant = selectedVariant ?? product.variants[0];
    add({
      handle: product.handle,
      variantId: variant?.id ?? product.id,
      title: product.title,
      variantTitle: variant && variant.title !== DEFAULT_TITLE ? variant.title : '',
      price: variant?.price ?? product.minPrice,
      image: product.image,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images.slice(0, 4).map((i) => cdnImage(i, 1200)),
    description: product.excerpt,
    brand: { '@type': 'Brand', name: product.vendor },
    sku: selectedVariant?.sku || product.variants[0]?.sku || product.id,
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/product/${product.handle}`),
      priceCurrency: 'VND',
      price: product.minPrice,
      availability: product.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  const perks = [
    { Icon: TruckIcon, text: t('values.shippingTitle') },
    { Icon: RefreshIcon, text: t('values.returnsTitle') },
    { Icon: ShieldIcon, text: t('values.authenticTitle') },
  ];

  return (
    <>
      <Seo
        title={`${product.title} — ${t('brand.name')}`}
        description={t('seo.productDesc', {
          title: product.title,
          price: formatPrice(product.minPrice, language),
        })}
        path={`/product/${product.handle}`}
        image={cdnImage(product.image, 1200)}
        type="product"
        jsonLd={jsonLd}
      />

      <div className="container">
        <Breadcrumb
          items={[
            { label: t('breadcrumb.home'), to: '/' },
            ...(cat ? [{ label: t(`category.${cat.key}`), to: `/category/${cat.key}` }] : []),
            { label: product.title },
          ]}
        />

        <div className={styles.layout}>
          {/* ----------------------------------------------------- GALLERY */}
          <div className={styles.gallery}>
            <div className={styles.thumbs} role="tablist" aria-label={t('product.gallery')}>
              {product.images.slice(0, 8).map((img, i) => (
                <button
                  key={img}
                  type="button"
                  role="tab"
                  aria-selected={i === activeImage}
                  aria-label={t('product.thumbnail', { index: i + 1 })}
                  className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(i)}
                  onMouseEnter={() => setActiveImage(i)}
                >
                  <img src={cdnImage(img, 160)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            <div className={styles.mainImage}>
              {onSale && <span className={styles.mainBadge}>-{discount}%</span>}
              <img
                key={activeImage}
                src={cdnImage(product.images[activeImage] ?? product.image, 1000)}
                alt={product.title}
                width={800}
                height={1066}
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>

          {/* -------------------------------------------------------- INFO */}
          <div className={styles.info}>
            <span className={styles.vendor}>{product.vendor}</span>
            <h1 className={styles.title}>{product.title}</h1>

            <div className={styles.priceRow}>
              <span className={`${styles.price} ${onSale ? styles.priceSale : ''}`}>
                {formatPrice(displayPrice, language)}
              </span>
              {onSale && (
                <>
                  <span className={styles.compare}>
                    {formatPrice(product.compareAtPrice, language)}
                  </span>
                  <span className={styles.saveTag}>
                    {t('product.save', { percent: discount })}
                  </span>
                </>
              )}
            </div>

            {/* Variant selectors */}
            {realOptions.map((opt, i) => {
              const idx = optionIndex(product, opt.name);
              return (
                <div className={styles.optionGroup} key={opt.name}>
                  <div className={styles.optionHead}>
                    <span className={styles.optionName}>{opt.name}</span>
                    {selection[i] && <span className={styles.optionValue}>{selection[i]}</span>}
                  </div>
                  <div className={styles.swatches}>
                    {opt.values.map((value) => {
                      const available = product.variants.some(
                        (v) => [v.option1, v.option2, v.option3][idx] === value && v.available,
                      );
                      const isActive = selection[i] === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          className={`${styles.swatch} ${isActive ? styles.swatchActive : ''} ${
                            available ? '' : styles.swatchDisabled
                          }`}
                          disabled={!available}
                          aria-pressed={isActive}
                          onClick={() => setSelection((s) => ({ ...s, [i]: value }))}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div style={{ paddingTop: 'var(--space-5)' }}>
              <p className={`${styles.stock} ${variantAvailable ? '' : styles.stockOut}`}>
                <span className={styles.dot} />
                {variantAvailable ? t('product.inStock') : t('product.outOfStock')}
              </p>

              <div className={styles.actions}>
                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  onClick={handleAdd}
                  disabled={!variantAvailable || !allSelected}
                >
                  {added ? (
                    <>
                      <CheckIcon size={18} /> {t('product.added')}
                    </>
                  ) : (
                    <>
                      <BagIcon size={18} />
                      {!allSelected ? t('product.selectSize') : t('product.addToCart')}
                    </>
                  )}
                </button>
              </div>
            </div>

            {product.excerpt && (
              <div className={styles.desc}>
                <p className={styles.descTitle}>{t('product.description')}</p>
                <p>{product.excerpt}</p>
              </div>
            )}

            <div className={styles.meta}>
              {(selectedVariant?.sku || product.variants[0]?.sku) && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>{t('product.sku')}</span>
                  <span className={styles.metaVal}>
                    {selectedVariant?.sku || product.variants[0]?.sku}
                  </span>
                </div>
              )}
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>{t('product.vendor')}</span>
                <span className={styles.metaVal}>{product.vendor}</span>
              </div>
              {cat && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>{t('nav.menu')}</span>
                  <span className={styles.metaVal}>
                    {t(`category.${cat.key}`)} ·{' '}
                    {t(`subcategory.${product.subcategory}`, { defaultValue: product.type })}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.perks}>
              {perks.map(({ Icon, text }) => (
                <p className={styles.perk} key={text}>
                  <Icon size={18} /> {text}
                </p>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>{t('product.related')}</h2>
            <ProductGrid products={related} priorityCount={0} />
          </section>
        )}
      </div>
    </>
  );
}

/** Index (0-based) of an option within the product's option list. */
function optionIndex(product: { options: { name: string }[] }, name: string): number {
  const i = product.options.findIndex((o) => o.name === name);
  return i < 0 ? 0 : i;
}
