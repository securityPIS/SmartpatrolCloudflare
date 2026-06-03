import { useEffect, useState } from "react";
import { getImageBlob, isIdbUrl } from "../lib/imageStore";

/** Renders an image whose src may be an `idb://` reference resolved from IndexedDB. */
export function AsyncImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [resolved, setResolved] = useState<string | null>(isIdbUrl(src) ? null : src);

  useEffect(() => {
    if (!isIdbUrl(src)) {
      setResolved(src);
      return;
    }
    let objectUrl: string | null = null;
    let cancelled = false;
    void getImageBlob(src).then((blob) => {
      if (cancelled || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setResolved(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!resolved) return <div className={`animate-pulse bg-slate-200 ${className ?? ""}`} />;
  return <img src={resolved} alt={alt} className={className} />;
}
