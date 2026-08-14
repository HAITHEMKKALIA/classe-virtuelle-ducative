import { useEffect, useState } from "react";
import { signedUrl } from "@/lib/media";

export function SignedImage({
  path,
  alt,
  className,
}: {
  path?: string | null;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let ok = true;
    if (!path) {
      setUrl("");
      return;
    }
    void signedUrl(path).then((u) => ok && setUrl(u));
    return () => {
      ok = false;
    };
  }, [path]);
  if (!path || !url) return null;
  return <img src={url} alt={alt} loading="lazy" className={className} />;
}
