import { useEffect, useRef } from "react";

type GoogleAdProps = {
  slot: string; // data-ad-slot
  format?: string; // e.g., "auto"
  responsive?: boolean; // data-full-width-responsive
  className?: string;
  style?: React.CSSProperties;
};

const GoogleAd = ({ slot, format = "auto", responsive = true, className, style }: GoogleAdProps) => {
  const insRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    // Evitar ejecución en SSR y si no hay cliente configurado
    const clientId = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
    if (typeof window === "undefined" || !clientId) return;

    try {
      // @ts-ignore - adsbygoogle no está tipado
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [slot]);

  const clientId = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
  if (!clientId) return null;

  return (
    <ins
      className={`adsbygoogle block ${className || ""}`}
      style={style || { display: "block" }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
      ref={insRef as any}
    />
  );
};

export default GoogleAd;


