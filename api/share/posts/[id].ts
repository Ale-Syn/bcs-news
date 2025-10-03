import type { VercelRequest, VercelResponse } from "@vercel/node";

// Resuelve URLs absolutas para OG (dominio de producción o entorno actual)
function getBaseUrl(req: VercelRequest): string {
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "";
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  return `${proto}://${host}`;
}

// Obtiene un post desde Appwrite REST (sin SDK) para evitar dependencias pesadas en lambda
async function fetchPost(postId: string) {
  const endpoint = process.env.VITE_APPWRITE_URL?.replace(/\/$/, "");
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;
  const collectionId = process.env.VITE_APPWRITE_POST_COLLECTION_ID;
  const apiKey = process.env.APPWRITE_API_KEY; // crear en Appwrite (scope: databases.read)

  if (!endpoint || !projectId || !databaseId || !collectionId || !apiKey) {
    throw new Error("Faltan variables de entorno para Appwrite");
  }

  const url = `${endpoint}/databases/${databaseId}/collections/${collectionId}/documents/${postId}`;
  const res = await fetch(url, {
    headers: {
      "X-Appwrite-Project": projectId,
      "X-Appwrite-Key": apiKey,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Error obteniendo post: ${res.status}`);
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query as { id: string };
    if (!id) {
      res.status(400).send("Missing post id");
      return;
    }

    const post = await fetchPost(id);
    const title: string = post?.title || "BCS News";
    const description: string = (post?.caption || "").toString().replace(/<[^>]*>/g, "").slice(0, 160);
    const imageUrl: string = post?.imageUrl || "";

    const base = getBaseUrl(req);
    const canonical = `${base}/posts/${id}`;

    // HTML mínimo con Open Graph
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  ${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" />` : ""}
  ${imageUrl ? `<meta property=\"og:image:secure_url\" content=\"${escapeHtml(imageUrl)}\" />` : ""}
  <meta property="og:site_name" content="BCS News" />
  <meta property="article:published_time" content="${post?.$createdAt || ""}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />` : ""}

  <link rel="canonical" href="${canonical}" />
  <meta http-equiv="refresh" content="0; url=${canonical}" />
</head>
<body>
  <p>Redirigiendo a <a href="${canonical}">${canonical}</a> …</p>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    // Permitir a Facebook descargar la imagen
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");
    res.status(200).send(html);
  } catch (err: any) {
    res.status(500).send(`Error: ${err?.message || "unknown"}`);
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}



