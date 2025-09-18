import { useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";
import { FileUploaderWithEditor } from "@/components/shared";
import { useGetAdBanner, useSaveAdBanner } from "@/lib/react-query/queries";
import { useToast } from "@/components/ui/use-toast";
import { convertFileToUrl } from "@/lib/utils";

const AdminAds = () => {
  const { data: topAd } = useGetAdBanner("top");
  const { mutate: saveBanner, isLoading } = useSaveAdBanner();
  const { toast } = useToast();

  const [previewUrl, setPreviewUrl] = useState<string>(topAd?.imageUrl || "");
  const [file, setFile] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState<string>(topAd?.linkUrl || "");
  const [alt, setAlt] = useState<string>(topAd?.alt || "Publicidad");

  useEffect(() => {
    // Sincronizar preview cuando cargan datos
    if (topAd?.imageUrl) {
      setPreviewUrl(topAd.imageUrl);
    }
    if (topAd?.linkUrl) {
      setLinkUrl(topAd.linkUrl);
    }
    if (topAd?.alt) {
      setAlt(topAd.alt);
    }
  }, [topAd]);

  const handleSave = () => {
    if (!file[0] && !previewUrl && !topAd?.imageUrl) {
      toast({
        variant: "destructive",
        title: "Falta imagen",
        description: "Sube o selecciona una imagen para el banner.",
      });
      return;
    }
    const payload = {
      position: "top" as const,
      imageUrl: previewUrl || topAd?.imageUrl || "",
      imageId: topAd?.imageId,
      linkUrl,
      alt,
    };
    saveBanner(
      { payload, file: file[0] },
      {
        onSuccess: () => {
          toast({ title: "Guardado", description: "Banner actualizado correctamente." });
          // Resetear archivo tras guardar
          setFile([]);
        },
        onError: (err) => {
          console.error(err);
          toast({
            variant: "destructive",
            title: "Error al guardar",
            description: "Revisa la colección y permisos en Appwrite.",
          });
        },
      }
    );
  };

  return (
    <div className="flex-1 pt-20 p-6 bg-gray-50">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Publicidad - Banner Superior</h1>
      <p className="text-gray-600 mb-6">Sube una imagen y define un enlace para el banner superior en Home.</p>

      <div className="max-w-3xl bg-white rounded-xl border border-[#E5E5E5] p-4 md:p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Imagen del banner</label>
          <FileUploaderWithEditor
            mediaUrl={previewUrl || topAd?.imageUrl || ""}
            fieldChange={(files) => {
              setFile(files);
              if (files && files[0]) {
                setPreviewUrl(convertFileToUrl(files[0]));
              }
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Enlace (opcional)</label>
          <Input
            type="url"
            value={linkUrl}
            placeholder="https://anunciante.com"
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Texto alternativo</label>
          <Input
            type="text"
            value={alt}
            placeholder="Publicidad"
            onChange={(e) => setAlt(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button disabled={isLoading} onClick={handleSave} className="shad-button_primary">
            {isLoading ? "Guardando..." : "Guardar banner"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAds;


