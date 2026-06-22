import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';
import { CollectionView } from '../components/collection/CollectionView';
import { NotFoundView } from './NotFound';
import {
  getCategory,
  productsInCategory,
  productsInSubcategory,
} from '../lib/catalog';
import { SITE } from '../lib/site';

export default function Category() {
  const { t } = useTranslation();
  const { category, sub } = useParams<{ category: string; sub?: string }>();

  const cat = category ? getCategory(category) : undefined;
  if (!cat) return <NotFoundView />;

  const subDef = sub ? cat.subs.find((s) => s.key === sub) : undefined;
  // A sub was requested but doesn't exist within this category.
  if (sub && !subDef) return <NotFoundView />;

  const list = subDef
    ? productsInSubcategory(cat.key, subDef.key)
    : productsInCategory(cat.key);

  const title = subDef ? t(`subcategory.${subDef.key}`) : t(`category.${cat.key}`);
  const description = subDef ? undefined : t(`categoryDesc.${cat.key}`);
  const path = subDef ? `/category/${cat.key}/${subDef.key}` : `/category/${cat.key}`;

  const crumbs = [
    { label: t('breadcrumb.home'), to: '/' },
    { label: t(`category.${cat.key}`), to: `/category/${cat.key}` },
    ...(subDef ? [{ label: title }] : []),
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    url: `${SITE.url}${path}`,
    numberOfItems: list.length,
  };

  // Subcategory chips (only on the top-level category page).
  const subnav = !subDef && cat.subs.length > 0 ? (
    <>
      {cat.subs.map((s) => (
        <Link key={s.key} to={`/category/${cat.key}/${s.key}`} className="btn btn--outline" style={{ borderRadius: 'var(--radius-pill)' }}>
          {t(`subcategory.${s.key}`)}
        </Link>
      ))}
    </>
  ) : undefined;

  return (
    <>
      <Seo
        title={t('seo.collectionTitle', { name: title })}
        description={t('seo.collectionDesc', { name: title, count: list.length })}
        path={path}
        type="website"
        jsonLd={jsonLd}
      />
      <CollectionView
        title={title}
        description={description}
        products={list}
        crumbs={crumbs}
        subnav={subnav}
      />
    </>
  );
}
