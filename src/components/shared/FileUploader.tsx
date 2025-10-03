import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

import { Button } from "@/components/ui";
import { convertFileToUrl } from "@/lib/utils";

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);
  const [isVideo, setIsVideo] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    setFile(acceptedFiles as unknown as File[]);
    fieldChange(acceptedFiles as unknown as File[]);
    const first = acceptedFiles[0] as File;
    setIsVideo(first.type?.startsWith('video') || false);
    setFileUrl(convertFileToUrl(first));
  }, [fieldChange]);

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

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-[#F8F8F8] rounded-xl cursor-pointer border-2 border-dashed border-[#E5E5E5] hover:border-[#BB1919] transition-colors duration-200">
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
          <p className="file_uploader-label">
            Hacer click o arrastrar archivo para reemplazar
          </p>
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
            Arrastrar y soltar imagen o video aquí
          </h3>
          <p className="text-[#666666] small-regular mb-6">Imágenes: SVG, PNG, JPG, WEBP • Videos: MP4, WEBM</p>

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
        </div>
      )}
    </div>
  );
};

export default FileUploader;
