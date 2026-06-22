import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from './Icon';
import styles from './Breadcrumb.module.css';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className={styles.crumbs} aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={`${item.label}-${i}`}>
            {item.to && !isLast ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRightIcon className={styles.sep} size={12} />}
          </Fragment>
        );
      })}
    </nav>
  );
}
