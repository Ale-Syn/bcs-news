import React from "react";

type AdBannerProps = {
  imageUrl?: string;
  linkUrl?: string;
  alt?: string;
  className?: string;
};

const AdBanner: React.FC<AdBannerProps> = ({ imageUrl, linkUrl, alt, className }) => {
  return (
    <div className={`w-full bg-[#F8F8F8] border border-[#E5E5E5] rounded-lg md:rounded-xl p-2 md:p-3 ${className || ""}`}>
      <a
        href={linkUrl || "#"}
        target={linkUrl ? "_blank" : undefined}
        rel={linkUrl ? "noopener noreferrer" : undefined}
        className="block"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={alt || "Publicidad"}
            className="w-full h-24 sm:h-28 md:h-32 lg:h-36 xl:h-40 object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-24 sm:h-28 md:h-32 lg:h-36 xl:h-40 bg-white rounded-md flex items-center justify-center text-[#666666] text-sm md:text-base">
            Espacio publicitario
          </div>
        )}
      </a>
    </div>
  );
};

export default AdBanner;



