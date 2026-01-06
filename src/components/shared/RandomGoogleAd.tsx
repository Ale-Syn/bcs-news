import { useMemo } from "react";
import GoogleAd from "./GoogleAd";

type RandomGoogleAdProps = {
  slots: string[];
  format?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const RandomGoogleAd = ({ slots, format = "auto", responsive = true, className, style }: RandomGoogleAdProps) => {
  const chosenSlot = useMemo(() => {
    if (!slots || slots.length === 0) return undefined;
    const idx = Math.floor(Math.random() * slots.length);
    return slots[idx]?.trim();
  }, [slots]);

  if (!chosenSlot) return null;

  return (
    <GoogleAd
      slot={chosenSlot}
      format={format}
      responsive={responsive}
      className={className}
      style={style}
    />
  );
};

export default RandomGoogleAd;


