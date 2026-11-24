import { useEffect, useRef, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { FALLBACK_IMAGE } from "../utils/format";

type ProductImageProps = ImgHTMLAttributes<HTMLImageElement>;

export default function ProductImage({
  className = "",
  alt,
  loading = "lazy",
  fetchPriority,
  referrerPolicy = "no-referrer",
  src,
  width,
  height,
  ...props
}: ProductImageProps & { fetchPriority?: "high" | "low" | "auto" }) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const previousSrc = useRef(src);

  useEffect(() => {
    // No resetear en el montaje: si la imagen viene de caché, `onLoad` puede
    // ejecutarse antes que este efecto y la dejaría invisible con opacity-0.
    if (previousSrc.current === src) return;

    previousSrc.current = src;
    setHasError(false);
    setLoaded(false);
    setCurrentSrc(src);
  }, [src]);

  if (hasError || !currentSrc) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-(--accent-soft) text-sm font-medium text-(--accent) ${className}`}
        aria-label={alt}
      >
        Sin imagen
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {!loaded && <div className="shimmer absolute inset-0" aria-hidden="true" />}
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        referrerPolicy={referrerPolicy}
        width={width}
        height={height}
        className={`h-full w-full object-cover transition-all duration-700 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
        } motion-reduce:transition-none motion-reduce:transform-none`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (currentSrc === FALLBACK_IMAGE) {
            setHasError(true);
            return;
          }
          setLoaded(false);
          setCurrentSrc(FALLBACK_IMAGE);
        }}
      />
    </div>
  );
}
