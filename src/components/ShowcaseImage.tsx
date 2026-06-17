import { useEffect, useState } from "react";
import { BRAND_ASSETS } from "../constants/brand";

type ShowcaseImageProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  width?: number;
  height?: number;
  objectPosition?: string;
  fallbackSrc?: string;
};

export function ShowcaseImage({
  src,
  alt,
  className,
  loading = "lazy",
  fetchPriority,
  width,
  height,
  objectPosition,
  fallbackSrc
}: ShowcaseImageProps) {
  const [activeSrc, setActiveSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setActiveSrc(src);
    setFailed(false);
  }, [src]);

  if (failed) {
    return (
      <div className={`showcase-fallback ${className ?? ""}`} role="img" aria-label={alt}>
        <img src={BRAND_ASSETS.logo} alt="" className="showcase-fallback__logo" />
        <button
          type="button"
          className="link-btn showcase-fallback__retry"
          onClick={() => {
            setFailed(false);
            setActiveSrc(src);
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
      src={activeSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      width={width}
      height={height}
      style={objectPosition ? { objectPosition } : undefined}
      onError={() => {
        if (fallbackSrc && activeSrc !== fallbackSrc) {
          setActiveSrc(fallbackSrc);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
