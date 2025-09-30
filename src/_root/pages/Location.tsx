import { useParams } from "react-router-dom";
import { useGetAllPosts } from "@/lib/react-query/queries";
import { DraggablePostGrid, Loader, AdBanner } from "@/components/shared";

const Location = () => {
  const { location, category } = useParams();
  const { data: postsData, isLoading } = useGetAllPosts();

  // Get the filter parameter (could be location or category)
  const filterParam = category || location || "";
  const displayName = decodeURIComponent(filterParam);

  // Filtrar posts por ubicación o categoría sobre el total de posts
  const filteredPosts = postsData?.documents.filter(
    (post: any) => post.location === displayName
  ) || [];

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
          <AdBanner heightClass="h-16 md:h-20 lg:h-20" className="rounded-lg" />
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
                posts={filteredPosts}
                showMeta={false}
                showTags={false}
                showStats={false}
                showCaption={true}
                className="grid grid-cols-1 gap-4"
                layout="horizontal"
                showCreatedAt={true}
                titleClampLines={3}
              />
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
                  <AdBanner heightClass="aspect-square" className="rounded-lg" />
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