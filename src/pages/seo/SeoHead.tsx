import { useEffect } from "react";
import type { SeoHeadInput } from "../../utils/seoHead";
import { applySeoHead } from "../../utils/seoHead";

type SeoHeadProps = SeoHeadInput;

export function SeoHead({
  title,
  description,
  canonicalPath,
  keywords,
  ogTitle,
  ogDescription,
  ogType,
  ogImage,
  jsonLd,
  noindex
}: SeoHeadProps) {
  useEffect(() => {
    applySeoHead({
      title,
      description,
      canonicalPath,
      keywords,
      ogTitle,
      ogDescription,
      ogType,
      ogImage,
      jsonLd,
      noindex
    });
  }, [
    title,
    description,
    canonicalPath,
    keywords,
    ogTitle,
    ogDescription,
    ogType,
    ogImage,
    jsonLd,
    noindex
  ]);

  return null;
}
