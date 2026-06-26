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
  /** Fade-in with blur placeholder (member surfaces). */
  progressive?: boolean;
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
  fallbackSrc,
  progressive = true
}: ShowcaseImageProps) {
  const [activeSrc, setActiveSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setActiveSrc(src);
    setFailed(false);
    setLoaded(false);
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
            setLoaded(false);
            setRetryKey((k) => k + 1);
          }}
        >
          Retry image
        </button>
      </div>
    );
  }

  if (!progressive) {
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

  return (
    <span className="member-image-frame">
      {!loaded ? <span className="member-image-placeholder" aria-hidden /> : null}
      <img
        key={retryKey}
        src={activeSrc}
        alt={alt}
        className={`member-image${loaded ? " member-image--loaded" : ""}${className ? ` ${className}` : ""}`}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        width={width}
        height={height}
        style={{ objectPosition: objectPosition ?? "center" }}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (fallbackSrc && activeSrc !== fallbackSrc) {
            setActiveSrc(fallbackSrc);
            setLoaded(false);
            return;
          }
          setFailed(true);
        }}
      />
    </span>
  );
}
