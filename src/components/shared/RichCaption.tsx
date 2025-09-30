import React from "react";

type RichCaptionProps = {
  text: string;
};

// Renderiza un caption con soporte básico de Markdown para imágenes: ![alt](url)
// Inserta imágenes intercaladas entre párrafos del texto
const RichCaption: React.FC<RichCaptionProps> = ({ text }) => {
  if (!text) return null;

  const imageRegex = /!\[(.*?)\]\((.*?)\)/g; // ![alt](url)
  const elements: React.ReactNode[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  const pushText = (chunk: string) => {
    if (!chunk) return;
    // Separar párrafos por doble salto de línea
    const paragraphs = chunk.split(/\n{2,}/);
    paragraphs.forEach((para, idx) => {
      // Mantener saltos de línea simples dentro del párrafo
      const withBreaks = para.split(/\n/).map((line, i) => (
        <React.Fragment key={`br-${key++}-${i}`}>
          {line}
          {i < para.split(/\n/).length - 1 && <br />}
        </React.Fragment>
      ));
      elements.push(
        <p key={`p-${key++}-${idx}`} className="text-[#1A1A1A] text-sm md:text-base lg:text-lg leading-relaxed">
          {withBreaks}
        </p>
      );
    });
  };

  while ((match = imageRegex.exec(text)) !== null) {
    const [full, alt, url] = match;
    const start = match.index;
    // Texto antes de la imagen
    pushText(text.slice(lastIndex, start));

    // Imagen
    elements.push(
      <div key={`img-${key++}`} className="my-3 md:my-4">
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={url} alt={alt || "imagen"} className="w-full rounded-md object-contain" />
        {alt && (
          <div className="text-xs text-[#666666] mt-1">{alt}</div>
        )}
      </div>
    );

    lastIndex = start + full.length;
  }

  // Resto del texto
  pushText(text.slice(lastIndex));

  return <div className="space-y-3 md:space-y-4">{elements}</div>;
};

export default RichCaption;


