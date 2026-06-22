import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';
import { CollectionView } from '../components/collection/CollectionView';
import { NotFoundView } from './NotFound';
import { CURATED } from '../lib/curated';
import { SITE } from '../lib/site';

export default function Collection() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  const def = slug ? CURATED[slug] : undefined;
  if (!def) return <NotFoundView />;

  const list = def.get();
  const title = t(def.titleKey);
  const path = `/collection/${slug}`;

  return (
    <>
      <Seo
        title={t('seo.collectionTitle', { name: title })}
        description={t('seo.collectionDesc', { name: title, count: list.length })}
        path={path}
        type="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          url: `${SITE.url}${path}`,
          numberOfItems: list.length,
        }}
      />
      <CollectionView
        title={title}
        description={t(def.descKey)}
        products={list}
        crumbs={[
          { label: t('breadcrumb.home'), to: '/' },
          { label: title },
        ]}
      />
    </>
  );
}
