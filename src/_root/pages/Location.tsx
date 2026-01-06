import { useParams, useSearchParams } from "react-router-dom";
import { useGetAllPosts } from "@/lib/react-query/queries";
import { DraggablePostGrid, Loader } from "@/components/shared";
import GoogleAd from "@/components/shared/GoogleAd";
import { Button } from "@/components/ui";

const Location = () => {
  const { location, category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: postsData, isLoading } = useGetAllPosts();

  // Get the filter parameter (could be location or category)
  const filterParam = category || location || "";
  const displayName = decodeURIComponent(filterParam);
  const normalize = (s: string) => String(s || "").toLowerCase();
  const filterKey = normalize(displayName);

  // Filtrar posts por ubicación o categoría sobre el total de posts
  const filteredPosts =
    (postsData?.documents || []).filter(
      (post: any) => normalize(post.location) === filterKey
    ) || [];

  // Paginación
  const perPage = 6;
  const rawPage = Number(searchParams.get("page") || "1");
  const totalPosts = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / perPage));
  const currentPage = Number.isFinite(rawPage) && rawPage >= 1 ? Math.min(rawPage, totalPages) : 1;
  const startIndex = (currentPage - 1) * perPage;
  const pagedPosts = filteredPosts.slice(startIndex, startIndex + perPage);

  const goToPage = (page: number) => {
    const next = Math.min(Math.max(1, page), totalPages);
    const params = new URLSearchParams(searchParams);
    params.set("page", String(next));
    setSearchParams(params);
  };

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (!filteredPosts?.length) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4">
          No se encontraron noticias para esta categoría.
        </p>
      </div>
    );
  }

  // Recomendados: tomar posts recientes que NO pertenezcan a la categoría/ubicación actual
  const recommended = (postsData?.documents || [])
    .filter((post: any) => post.location !== displayName)
    .slice(0, 5);

  return (
    <div className="flex flex-1 flex-col w-full">
      <div className="w-full mt-3 md:mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GoogleAd slot="REEMPLAZA_CON_SLOT_TOP" className="rounded-lg" style={{ display: "block", minHeight: 90 }} />
        </div>
      </div>
      <div className="common-container">
        <div className="user-container">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h2 className="h3-bold md:h2-bold text-[#1A1A1A]">
                {displayName}
                <div className="h-1 w-20 bg-[#BB1919] rounded-full"></div>
              </h2>
            </div>
          </div>

          {/* Layout 2 columnas: contenido principal + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contenido principal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-2 md:p-3">
              <DraggablePostGrid 
                posts={pagedPosts}
                showMeta={false}
                showTags={false}
                showStats={false}
                showCaption={true}
                className="grid grid-cols-1 gap-4"
                layout="horizontal"
                showCreatedAt={true}
                titleClampLines={3}
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Mostrando {totalPosts === 0 ? 0 : startIndex + 1}–{startIndex + pagedPosts.length} de {totalPosts}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border-[#BB1919] text-[#BB1919] hover:bg-[#BB1919]/10"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#BB1919] text-[#BB1919] hover:bg-[#BB1919]/10"
                    disabled={currentPage >= totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
              </div>
            </div>

            {/* Sidebar: Te recomendamos */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-lg md:text-xl font-extrabold text-[#1A1A1A] tracking-tight mb-3">
                  Recomendaciones
                </h3>
                <div className="h-0.5 w-24 bg-[#BB1919] mb-4" />

                <ul className="space-y-6">
                  {recommended.map((post: any) => (
                    <li key={post.$id} className="flex gap-3">
                      {post.imageUrl && (
                        <a href={`/posts/${post.$id}`} className="flex-shrink-0 block w-24 h-16 overflow-hidden rounded-md bg-gray-100">
                          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                        </a>
                      )}
                      <div className="min-w-0">
                        <a href={`/posts/${post.$id}`} className="block text-[#1A1A1A] font-semibold leading-snug hover:underline clamp-3">
                          {post.title}
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(post.$createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </li>
                  ))}
                  {recommended.length === 0 && (
                    <li className="text-sm text-gray-500">No hay recomendaciones por ahora.</li>
                  )}
                </ul>

                {/* Espacio publicitario debajo del listado */}
                <div className="mt-6">
                  <GoogleAd slot="REEMPLAZA_CON_SLOT_SIDEBAR" className="rounded-lg" style={{ display: "block", minHeight: 250 }} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location; 