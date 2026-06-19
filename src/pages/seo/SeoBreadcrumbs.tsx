import { ChevronRight } from "lucide-react";
import { Link } from "../../components/Link";

export type BreadcrumbItem = {
  label: string;
  path?: string;
};

type SeoBreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function SeoBreadcrumbs({ items }: SeoBreadcrumbsProps) {
  return (
    <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
      <ol className="seo-breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="seo-breadcrumbs__item">
              {item.path && !isLast ? (
                <Link href={item.path} className="seo-breadcrumbs__link">
                  {item.label}
                </Link>
              ) : (
                <span className="seo-breadcrumbs__current" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRight size={14} className="seo-breadcrumbs__sep" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
