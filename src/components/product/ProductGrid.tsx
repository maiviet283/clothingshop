import type { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Reveal } from '../ui/Reveal';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: Product[];
  /** Eager-load the first N images (above the fold). */
  priorityCount?: number;
}

export function ProductGrid({ products, priorityCount = 4 }: ProductGridProps) {
  return (
    <div className={styles.grid}>
      {products.map((product, i) => (
        <Reveal
          key={product.handle}
          className={styles.item}
          style={{ ['--reveal-delay' as string]: `${Math.min(i, 7) * 60}ms` }}
        >
          <ProductCard product={product} priority={i < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}
