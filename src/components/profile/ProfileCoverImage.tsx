import { useEffect, useState } from "react";
import { DEFAULT_PROFILE_BACKDROP } from "../../constants/photos";

type ProfileCoverImageProps = {
  src: string;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
};

export function ProfileCoverImage({
  src,
  className,
  priority = false,
  objectPosition = "center"
}: ProfileCoverImageProps) {
  const [activeSrc, setActiveSrc] = useState(src);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (src === activeSrc) return;
    setVisible(false);
    const img = new Image();
    img.onload = () => {
      setActiveSrc(src);
      requestAnimationFrame(() => setVisible(true));
    };
    img.onerror = () => {
      setActiveSrc(src);
      setVisible(true);
    };
    img.src = src;
  }, [activeSrc, src]);

  const isDefault = activeSrc === DEFAULT_PROFILE_BACKDROP;

  return (
    <img
      src={activeSrc}
      alt="Profile cover"
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      sizes="100vw"
      srcSet={isDefault ? `${DEFAULT_PROFILE_BACKDROP} 1942w` : undefined}
      style={{
        objectFit: "cover",
        objectPosition,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s ease"
      }}
    />
  );
}
