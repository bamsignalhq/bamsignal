import { useState } from "react";
import { BRAND_ASSETS } from "../constants/brand";

type ShowcaseImageProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
};

export function ShowcaseImage({ src, alt, className, loading = "lazy" }: ShowcaseImageProps) {
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  if (failed) {
    return (
      <div className={`showcase-fallback ${className ?? ""}`} role="img" aria-label={alt}>
        <img src={BRAND_ASSETS.logo} alt="" className="showcase-fallback__logo" />
        <button
          type="button"
          className="link-btn showcase-fallback__retry"
          onClick={() => {
            setFailed(false);
            setRetryKey((k) => k + 1);
          }}
        >
          Retry image
        </button>
      </div>
    );
  }

  return (
    <img
      key={retryKey}
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
