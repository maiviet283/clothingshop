import type { CSSProperties, ReactNode } from 'react';
import { useReveal } from '../../hooks/useReveal';

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'section' | 'article' | 'li';
}

/** Wraps children with a fade-up-on-scroll effect (see .reveal in index.css). */
export function Reveal({ children, className, style, as = 'div' }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const Tag = as;
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? 'is-visible' : ''} ${className ?? ''}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
