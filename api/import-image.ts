import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const FETCH_TIMEOUT_MS = 15000;

function getRequiredEnv() {
  const endpoint = process.env.VITE_APPWRITE_URL?.replace(/\/$/, "");
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
  const storageId = process.env.VITE_APPWRITE_STORAGE_ID;
  const apiKey = process.env.APPWRITE_API_KEY; // requiere scope: storage.write

  if (!endpoint || !projectId || !storageId || !apiKey) {
    throw new Error("Faltan variables de entorno para Appwrite");
  }
  return { endpoint, projectId, storageId, apiKey };
}

function getExtensionFromType(contentType: string | null): string {
  const type = (contentType || "").split(";")[0].trim().toLowerCase();
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

function getExtensionFromUrl(rawUrl: string): string {
  try {
    const { pathname } = new URL(rawUrl);
    const last = pathname.split("/").pop() || "";
    const ext = last.includes(".") ? last.split(".").pop() : "";
    return (ext || "").toLowerCase();
  } catch {
    return "";
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { url } = (req.body || {}) as { url?: string };
    if (!url) {
      res.status(400).json({ error: "Missing url" });
      return;
    }

    let externalUrl: URL;
    try {
      externalUrl = new URL(url);
    } catch {
      res.status(400).json({ error: "Invalid url" });
      return;
    }

    if (!["http:", "https:"].includes(externalUrl.protocol)) {
      res.status(400).json({ error: "Unsupported protocol" });
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const imageRes = await fetch(externalUrl.toString(), {
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!imageRes.ok) {
      res.status(400).json({ error: `No se pudo descargar la imagen (${imageRes.status})` });
      return;
    }

    const contentType = imageRes.headers.get("content-type");
    if (!contentType || !contentType.toLowerCase().startsWith("image/")) {
      res.status(400).json({ error: "La URL no es una imagen válida" });
      return;
    }

    const contentLength = Number(imageRes.headers.get("content-length") || "0");
    if (contentLength && contentLength > MAX_BYTES) {
      res.status(413).json({ error: "La imagen excede el tamaño máximo" });
      return;
    }

    const buffer = await imageRes.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      res.status(413).json({ error: "La imagen excede el tamaño máximo" });
      return;
    }

    const { endpoint, projectId, storageId, apiKey } = getRequiredEnv();
    const ext = getExtensionFromType(contentType) || getExtensionFromUrl(externalUrl.toString()) || "jpg";
    const fileName = `imported-${Date.now()}.${ext}`;

    const formData = new FormData();
    formData.append("fileId", "unique()");
    formData.append("file", new Blob([buffer], { type: contentType }), fileName);

    const uploadUrl = `${endpoint}/storage/buckets/${storageId}/files`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "X-Appwrite-Project": projectId,
        "X-Appwrite-Key": apiKey,
      },
      body: formData,
    });

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      res.status(500).json({ error: `Error subiendo a Appwrite: ${text}` });
      return;
    }

    const uploaded = await uploadRes.json();
    const fileId = uploaded?.$id as string | undefined;
    if (!fileId) {
      res.status(500).json({ error: "Respuesta inválida de Appwrite" });
      return;
    }

    const fileUrl = `${endpoint}/storage/buckets/${storageId}/files/${fileId}/preview?project=${projectId}`;
    res.status(200).json({ url: fileUrl, fileId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Error inesperado" });
  }
}
