import { Link } from "../../components/Link";
import type { SeoLinkItem } from "../../content/seo/internalLinks";

type SeoInternalLinksProps = {
  title?: string;
  links: SeoLinkItem[];
};

export function SeoInternalLinks({ title = "Helpful links", links }: SeoInternalLinksProps) {
  if (links.length === 0) return null;
  return (
    <section className="seo-article__section seo-resource-links">
      <h2>{title}</h2>
      <ul className="seo-resource-list">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
