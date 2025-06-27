import { useCallback, useState, useRef } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/ui";
import { convertFileToUrl } from "@/lib/utils";

type FileUploaderWithEditorProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

const FileUploaderWithEditor = ({ fieldChange, mediaUrl }: FileUploaderWithEditorProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFile(acceptedFiles);
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
      setShowEditor(true);
    },
    [file]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
  });

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
              aspect={undefined}
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
                    const newCrop = {
                      unit: '%' as const,
                      width: 90,
                      height: 90,
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
        {...getRootProps()}
        className="flex flex-center flex-col bg-[#F8F8F8] rounded-xl cursor-pointer border-2 border-dashed border-[#E5E5E5] hover:border-[#BB1919] transition-colors duration-200">
        <input {...getInputProps()} className="cursor-pointer" />

        {fileUrl ? (
          <>
            <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
              <img src={fileUrl} alt="image" className="file_uploader-img" />
            </div>
            <div className="flex gap-2 items-center justify-center pb-4">
              <p className="file_uploader-label">
                Hacer click o arrastrar imagen para reemplazar
              </p>
              {file.length > 0 && (
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
              Arrastrar y soltar imagen aqui
            </h3>
            <p className="text-[#666666] small-regular mb-6">SVG, PNG, JPG</p>

            <Button type="button" className="shad-button_dark">
              Seleccionar Archivo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploaderWithEditor;
