import { useCallback, useState, useRef, useEffect } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/ui";
import { convertFileToUrl } from "@/lib/utils";

type FileUploaderWithEditorProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
  aspect?: number; // relación de aspecto opcional (ej. 16/9)
};

const FileUploaderWithEditor = ({ fieldChange, mediaUrl, aspect }: FileUploaderWithEditorProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: aspect ? Math.min(90 / aspect, 90) : 50,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [showPasteHint, setShowPasteHint] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      setFile(acceptedFiles as unknown as File[]);
      const first = acceptedFiles[0] as File;
      setIsVideo(first.type?.startsWith('video') || false);
      setFileUrl(convertFileToUrl(first));
      // No abrir el editor automáticamente; usar el archivo original por defecto
      setShowEditor(false);
      // Notificar al formulario inmediatamente (se usará el primer archivo)
      fieldChange(acceptedFiles as unknown as File[]);
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".webp", ".gif"],
      "video/*": [".mp4", ".webm", ".ogg"],
    },
    multiple: true,
    maxFiles: 10,
    useFsAccessApi: false,
  });

  // Handle paste from clipboard
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData?.items;
    
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          // Convert blob to File
          const pastedFile = new File([blob], `pasted-image-${Date.now()}.png`, {
            type: blob.type
          });
          
          setFile([pastedFile]);
          setFileUrl(convertFileToUrl(pastedFile));
          // No abrir editor automáticamente cuando se pega
          setShowEditor(false);
          // Notificar al formulario con la imagen original
          fieldChange([pastedFile]);
          setShowPasteHint(false);
        }
        break;
      }
    }
  }, [fieldChange]);

  // Handle focus and blur for paste hint
  const handleFocus = useCallback(() => {
    setShowPasteHint(true);
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => setShowPasteHint(false), 200);
  }, []);

  // Add event listeners for paste functionality
  useEffect(() => {
    const pasteArea = pasteAreaRef.current;
    if (pasteArea) {
      pasteArea.addEventListener('paste', handlePaste);
      pasteArea.addEventListener('focus', handleFocus);
      pasteArea.addEventListener('blur', handleBlur);
      
      return () => {
        pasteArea.removeEventListener('paste', handlePaste);
        pasteArea.removeEventListener('focus', handleFocus);
        pasteArea.removeEventListener('blur', handleBlur);
      };
    }
  }, [handlePaste, handleFocus, handleBlur]);

  // Global paste listener when component is mounted
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Only handle if no input is focused and we don't have an image yet
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      );

      if (!isInputFocused && !fileUrl && !showEditor) {
        handlePaste(e);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [handlePaste, fileUrl, showEditor]);

  const getCroppedImage = async (
    image: HTMLImageElement,
    crop: PixelCrop,
    rotation: number = 0,
    brightness: number = 100,
    contrast: number = 100
  ): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas || !crop.width || !crop.height) {
      return null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Apply rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
  };

  const handleSaveEdit = async () => {
    if (!imgRef.current || !completedCrop) {
      return;
    }

    const croppedImageBlob = await getCroppedImage(
      imgRef.current,
      completedCrop,
      rotation,
      brightness,
      contrast
    );

    if (croppedImageBlob) {
      const croppedImageFile = new File([croppedImageBlob], `edited-${file[0]?.name || 'image.jpg'}`, {
        type: 'image/jpeg'
      });
      
      setFile([croppedImageFile]);
      fieldChange([croppedImageFile]);
      setFileUrl(URL.createObjectURL(croppedImageFile));
    }

    setShowEditor(false);
  };

  const handleCancelEdit = () => {
    setShowEditor(false);
    setFileUrl(mediaUrl);
    setFile([]);
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    });
    setRotation(0);
    setBrightness(100);
    setContrast(100);
  };

  const resetFilters = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
  };

  if (showEditor) {
    return (
      <div className="space-y-4">
        <div className="bg-[#F8F8F8] rounded-xl p-4 border border-[#E5E5E5]">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Editor de Imagen</h3>
          
          <div className="mb-4">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={fileUrl}
                alt="Crop me"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  maxHeight: '400px',
                  width: 'auto'
                }}
                onLoad={() => {
                  if (imgRef.current) {
                    const newCrop: Crop = {
                      unit: '%',
                      width: 90,
                      height: aspect ? Math.min(90 / aspect, 90) : 50,
                      x: 5,
                      y: 5
                    };
                    setCrop(newCrop);
                  }
                }}
              />
            </ReactCrop>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Rotación: {rotation}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Brillo: {brightness}%
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Contraste: {contrast}%
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-between items-center">
            <Button
              type="button"
              onClick={resetFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Resetear Filtros
            </Button>
            
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleCancelEdit}
                className="shad-button_dark"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                className="shad-button_primary"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    );
  }

  return (
    <div>
      <div
        ref={pasteAreaRef}
        tabIndex={0}
        className="relative outline-none"
        onKeyDown={(e) => {
          // Allow paste with Ctrl+V
          if (e.ctrlKey && e.key === 'v') {
            // The paste event will be handled by the event listener
          }
        }}
      >
        <div
          {...getRootProps()}
          className={`flex flex-center flex-col bg-[#F8F8F8] rounded-xl cursor-pointer border-2 border-dashed transition-colors duration-200 ${
            showPasteHint 
              ? 'border-[#BB1919] bg-[#BB1919]/5' 
              : 'border-[#E5E5E5] hover:border-[#BB1919]'
          }`}>
          <input {...getInputProps({ accept: "image/*,video/*", capture: "environment" })} className="cursor-pointer" />

          {fileUrl ? (
            <>
              <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
                {isVideo ? (
                  <video src={fileUrl} className="w-full h-full object-contain max-h-[400px]" controls playsInline preload="metadata" />
                ) : (
                  <img src={fileUrl} alt="preview" className="file_uploader-img" />
                )}
              </div>
              <div className="flex gap-2 items-center justify-center pb-4">
                <p className="file_uploader-label">
                  Hacer click, arrastrar o pegar archivo para reemplazar
                </p>
                {file.length > 0 && !isVideo && (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditor(true);
                    }}
                    className="bg-[#BB1919] hover:bg-[#A31616] text-white text-xs px-3 py-1"
                  >
                    Editar
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="file_uploader-box">
              <img
                src="/assets/icons/file-upload.svg"
                width={96}
                height={77}
                alt="file upload"
                className="invert-[0.2]"
              />

              <h3 className="base-medium text-[#1A1A1A] mb-2 mt-6">
                Arrastrar, seleccionar o pegar imagen o video
              </h3>
              <p className="text-[#666666] small-regular mb-4">Imágenes: SVG, PNG, JPG, WEBP • Videos: MP4, WEBM</p>
              
              <div className="flex flex-col items-center gap-2">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                  className="shad-button_dark"
                >
                  Seleccionar Archivos
                </Button>
                <p className="text-[#999999] text-xs">
                  O presiona Ctrl+V para pegar desde el portapapeles (se usa el primero)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Paste Hint Overlay */}
        {showPasteHint && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#BB1919]/10 rounded-xl pointer-events-none">
            <div className="bg-[#BB1919] text-white px-4 py-2 rounded-lg font-medium shadow-lg">
              📋 Pega tu imagen aquí (Ctrl+V)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploaderWithEditor;
