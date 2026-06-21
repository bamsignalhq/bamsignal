import type { ReactNode } from "react";

type DiscoverSectionProps = {
  title: string;
  subtext?: string;
  children: ReactNode;
  className?: string;
};

export function DiscoverSection({ title, subtext, children, className = "" }: DiscoverSectionProps) {
  return (
    <section className={`discover-section ${className}`.trim()} aria-label={title}>
      <header className="discover-section__head">
        <h3>{title}</h3>
        {subtext ? <p>{subtext}</p> : null}
      </header>
      {children}
    </section>
  );
}
