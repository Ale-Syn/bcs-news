import { PropsWithChildren, useEffect } from "react";

const ADSENSE_SCRIPT_ID = "adsbygoogle-js";

const AdSenseProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    const clientId = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
    if (!clientId) return;

    const existing = document.getElementById(ADSENSE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) return;

    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
    document.head.appendChild(script);
  }, []);

  return children as any;
};

export default AdSenseProvider;


