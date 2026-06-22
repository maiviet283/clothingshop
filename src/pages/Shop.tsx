import { useTranslation } from 'react-i18next';
import { Seo } from '../components/seo/Seo';
import { CollectionView } from '../components/collection/CollectionView';
import { products } from '../lib/catalog';

export default function Shop() {
  const { t } = useTranslation();
  const title = t('category.all');

  return (
    <>
      <Seo
        title={t('seo.collectionTitle', { name: title })}
        description={t('seo.collectionDesc', { name: title, count: products.length })}
        path="/shop"
        type="website"
      />
      <CollectionView
        title={title}
        description={t('home.featuredSubtitle')}
        products={products}
        crumbs={[
          { label: t('breadcrumb.home'), to: '/' },
          { label: title },
        ]}
      />
    </>
  );
}
