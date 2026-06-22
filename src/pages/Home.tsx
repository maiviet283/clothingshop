import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';
import { Reveal } from '../components/ui/Reveal';
import { ProductGrid } from '../components/product/ProductGrid';
import { useLanguage } from '../components/providers/LanguageProvider';
import {
  categories,
  featuredProducts,
  newProducts,
  productsInCategory,
  saleProducts,
} from '../lib/catalog';
import { cdnImage, formatPrice } from '../lib/format';
import { SITE } from '../lib/site';
import {
  ArrowRightIcon,
  HeadsetIcon,
  RefreshIcon,
  ShieldIcon,
  TruckIcon,
} from '../components/ui/Icon';
import styles from './Home.module.css';

export default function Home() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const featured = featuredProducts(8);
  const fresh = newProducts(8);
  const hero = featured[0];

  const values = [
    { Icon: TruckIcon, title: 'values.shippingTitle', desc: 'values.shippingDesc' },
    { Icon: RefreshIcon, title: 'values.returnsTitle', desc: 'values.returnsDesc' },
    { Icon: ShieldIcon, title: 'values.authenticTitle', desc: 'values.authenticDesc' },
    { Icon: HeadsetIcon, title: 'values.supportTitle', desc: 'values.supportDesc' },
  ];

  // Representative image per category for the showcase tiles.
  const catTiles = categories.map((cat) => {
    const sample = productsInCategory(cat.key).find((p) => p.images.length > 1) ??
      productsInCategory(cat.key)[0];
    return { cat, image: sample?.images[1] ?? sample?.image ?? '' };
  });

  const storyImage = featured[2]?.image ?? hero?.image ?? '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: SITE.name,
    url: SITE.url,
    description: t('seo.homeDesc'),
    image: hero ? cdnImage(hero.image, 1200) : undefined,
  };

  const heroTitle = t('home.heroTitle');

  return (
    <>
      <Seo
        title={t('seo.homeTitle')}
        description={t('seo.homeDesc')}
        path="/"
        image={hero ? cdnImage(hero.image, 1200) : undefined}
        jsonLd={jsonLd}
      />

      {/* ---------------------------------------------------------------- HERO */}
      <section className={styles.hero}>
        <span className={styles.heroWord} aria-hidden="true">{t('brand.name')}</span>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroContent}>
            <span className="eyebrow">{t('home.heroEyebrow')}</span>
            <h1 className={styles.heroTitle}>{heroTitle}</h1>
            <p className={styles.heroSub}>{t('home.heroSubtitle')}</p>
            <div className={styles.heroActions}>
              <Link to="/shop" className="btn btn--primary">
                {t('home.heroCta')}
              </Link>
              <Link to="/collection/new" className="btn btn--outline">
                {t('home.heroCtaAlt')}
              </Link>
            </div>
          </div>

          {hero && (
            <div className={styles.heroMediaWrap}>
              <Link to={`/product/${hero.handle}`} className={styles.heroMedia}>
                <img
                  src={cdnImage(hero.image, 900)}
                  alt={hero.title}
                  width={720}
                  height={900}
                  loading="eager"
                  fetchPriority="high"
                />
                <span className={styles.heroTag}>
                  <span className={styles.heroTagName}>{hero.title}</span>
                  <span className={styles.heroTagPrice}>
                    {t('common.from')} {formatPrice(hero.minPrice, language)}
                  </span>
                </span>
              </Link>
              <span className={styles.heroFrame} aria-hidden="true" />
            </div>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- VALUE BAR */}
      <section className={styles.values} aria-label={t('home.featuredTitle')}>
        <div className="container" style={{ paddingInline: 0 }}>
          <div className={styles.valuesGrid}>
            {values.map(({ Icon, title, desc }) => (
              <div className={styles.value} key={title}>
                <Icon className={styles.valueIcon} size={26} />
                <div>
                  <p className={styles.valueTitle}>{t(title)}</p>
                  <p className={styles.valueDesc}>{t(desc)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- FEATURED */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <span className="eyebrow">{t('home.featuredEyebrow')}</span>
            <h2 className={styles.sectionTitle}>{t('home.featuredTitle')}</h2>
            <p className={styles.sectionSub}>{t('home.featuredSubtitle')}</p>
          </div>
          <Link to="/shop" className={`${styles.sectionLink} link-underline`}>
            {t('common.viewAll')} <ArrowRightIcon size={16} />
          </Link>
        </div>
        <ProductGrid products={featured} priorityCount={4} />
      </section>

      {/* -------------------------------------------------------- CATEGORIES */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <span className="eyebrow">{t('home.categoriesEyebrow')}</span>
            <h2 className={styles.sectionTitle}>{t('home.categoriesTitle')}</h2>
          </div>
        </div>
        <div className={styles.catGrid}>
          {catTiles.map(({ cat, image }, i) => (
            <Link
              key={cat.key}
              to={`/category/${cat.key}`}
              className={`${styles.cat} ${i === 0 ? styles.catFeatured : ''}`}
            >
              {image && (
                <img src={cdnImage(image, 800)} alt="" loading="lazy" aria-hidden="true" />
              )}
              <span className={styles.catOverlay}>
                <span className={styles.catName}>{t(`category.${cat.key}`)}</span>
                <span className={styles.catCount}>
                  {cat.count} {t('common.products')}
                </span>
                <span className={styles.catCta}>
                  {t('common.explore')} <ArrowRightIcon size={15} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- SALE BANNER */}
      {saleProducts().length > 0 && (
        <section className={styles.sale}>
          <div className={`container ${styles.saleInner}`}>
            <span className={styles.saleEyebrow}>{t('home.saleEyebrow')}</span>
            <h2 className={styles.saleTitle}>{t('home.saleTitle')}</h2>
            <p className={styles.saleSub}>{t('home.saleSubtitle')}</p>
            <div className={styles.saleActions}>
              <Link to="/collection/sale" className="btn btn--accent">
                {t('home.saleCta')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------- NEW ARRIVALS */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <span className="eyebrow">{t('home.newEyebrow')}</span>
            <h2 className={styles.sectionTitle}>{t('home.newTitle')}</h2>
          </div>
          <Link to="/collection/new" className={`${styles.sectionLink} link-underline`}>
            {t('common.viewAll')} <ArrowRightIcon size={16} />
          </Link>
        </div>
        <ProductGrid products={fresh} priorityCount={0} />
      </section>

      {/* -------------------------------------------------------------- STORY */}
      <section className="container">
        <div className={styles.story}>
          <Reveal className={styles.storyMedia}>
            {storyImage && <img src={cdnImage(storyImage, 900)} alt="" loading="lazy" />}
          </Reveal>
          <Reveal>
            <span className="eyebrow">{t('home.storyEyebrow')}</span>
            <h2 className={styles.storyTitle}>{t('home.storyTitle')}</h2>
            <p className={styles.storyBody}>{t('home.storyBody')}</p>
            <Link to="/shop" className="btn btn--outline">
              {t('common.shopNow')}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
