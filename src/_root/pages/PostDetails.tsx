import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { Button } from "@/components/ui";
import { Loader, NoDataMessage, DraggablePostGrid } from "@/components/shared";
import { PostStats } from "@/components/shared";

import {
  useGetPostById,
  useGetAllPosts,
  useDeletePost,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();

  const { data: post, isLoading } = useGetPostById(id);
  
  // Force re-render when navigating between different posts
  const postKey = `post-details-${id}`;
  const { data: allPosts, isLoading: isAllPostsLoading } = useGetAllPosts();
  const { mutate: deletePost } = useDeletePost();

  // Scroll to top when navigating to a new post
  useEffect(() => {
    // Find the scrollable container (the one with overflow-y-auto in RootLayout)
    const scrollContainer = document.querySelector('.overflow-y-auto');
    
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Fallback to window scroll if container not found
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [id]);

  // Related posts by same category/location and exclude current post
  const relatedPosts = allPosts?.documents
    .filter((relatedPost: any) => {
      if (relatedPost.$id === id) return false;
      if (!post?.location) return false;
      return relatedPost.location === post.location;
    })
    .sort((a: any, b: any) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());

  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

  // Navegación directa en tarjetas relacionadas manejada por Link del grid

  // Selección para sidebar: aleatorias del total (excluye la actual)
  const buildSidebarPosts = () => {
    const pool = (allPosts?.documents || []).filter((p: any) => p && p.$id !== id);
    // Shuffle (Fisher–Yates)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 4);
  };

  const sidebarPosts = buildSidebarPosts();

  return (
    <div className="post_details-container">
      {/* Botón Volver - Ahora visible en todas las pantallas */}
      <div className="flex max-w-5xl w-full mb-4 md:mb-0">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={20}
            height={20}
            className="md:w-6 md:h-6"
          />
          <p className="text-sm md:text-base font-medium text-[#1A1A1A]">Volver</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div key={postKey} className="w-[calc(100%-16px)] sm:w-[calc(100%-32px)] md:w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal: artículo */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Imagen - Fondo blanco, tamaño uniforme, completa */}
            <div className="bg-white p-0">
              <div className="w-full max-w-2xl mx-auto">
                <div className="w-full h-64 md:h-80 lg:h-96 bg-white">
                  <img
                    src={post?.imageUrl}
                    alt="post image"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Contenido - Flexible */}
            <div className="flex-1 flex flex-col p-3 md:p-4 lg:p-6 xl:p-8 max-w-2xl mx-auto">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 lg:mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#1A1A1A] leading-tight mb-3">
                    {post?.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm md:text-base text-[#666666]">
                    <span className="font-medium">
                      {multiFormatDateString(post?.$createdAt)}
                    </span>
                    <span>•</span>
                    <span className="font-medium">
                      {post?.location}
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Link
                    to={`/update-post/${post?.$id}`}
                    className={`${user.id !== post?.creator.$id && "hidden"}`}>
                    <img
                      src={"/assets/icons/edit.svg"}
                      alt="edit"
                      width={20}
                      height={20}
                      className="md:w-6 md:h-6 opacity-70 hover:opacity-100 transition-opacity"
                    />
                  </Link>

                  <Button
                    onClick={handleDeletePost}
                    variant="ghost"
                    className={`p-2 hover:bg-red-50 rounded-lg ${
                      user.id !== post?.creator.$id && "hidden"
                    }`}>
                    <img
                      src={"/assets/icons/delete.svg"}
                      alt="delete"
                      width={20}
                      height={20}
                      className="md:w-6 md:h-6 opacity-70 hover:opacity-100 transition-opacity"
                    />
                  </Button>
                </div>
              </div>

              <hr className="border-[#E5E5E5] mb-4 lg:mb-6" />

              {/* Contenido Scrolleable (sin scroll interno en móvil) */}
              <div className="flex-1 overflow-visible lg:overflow-y-auto custom-scrollbar pr-0 md:pr-2 mb-4 lg:mb-6">
                <p className="text-[#1A1A1A] text-sm md:text-base lg:text-lg leading-relaxed break-words whitespace-pre-wrap">
                  {post?.caption}
                </p>
              </div>

              {/* Footer Section */}
              <div className="flex flex-col gap-4 mt-auto">
                {/* Tags */}
                {post?.tags && post.tags.length > 0 && (
                  <ul className="flex gap-2 flex-wrap">
                    {post.tags.map((tag: string, index: string) => (
                      <li
                        key={`${tag}${index}`}
                        className="text-[#BB1919] text-xs md:text-sm font-medium bg-[#BB1919]/10 px-3 py-1.5 rounded-full">
                        #{tag}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Post Stats */}
                <div className="w-full">
                  <PostStats post={post} userId={user.id} />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar derecha: destacadas / recomendadas */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-lg p-4 no-border">
                <h3 className="text-base font-semibold text-[#1A1A1A] mb-3">Noticias destacadas</h3>
                <ul className="space-y-4">
                  {sidebarPosts?.map((sp: any) => (
                    <li key={sp.$id}>
                      <Link to={`/posts/${sp.$id}`} className="flex items-start gap-3 group">
                        <div className="w-28 h-20 flex-shrink-0 overflow-hidden rounded-md bg-[#F2F2F2]">
                          <img src={sp.imageUrl} alt={sp.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-semibold text-[#1A1A1A] leading-snug group-hover:text-[#BB1919] flex items-center gap-1">
                            <span className="line-clamp-2 truncate">{sp.title}</span>
                            <button
                              type="button"
                              title="Abrir en nueva pestaña"
                              className="inline-flex items-center justify-center text-[#666666] hover:text-[#BB1919] focus:outline-none"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(`/posts/${sp.$id}`, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-3.5 h-3.5 flex-shrink-0"
                                aria-hidden="true"
                              >
                                <path d="M11 3a1 1 0 100 2h2.586L9.293 9.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 100-2H5z" />
                              </svg>
                            </button>
                          </p>
                          {sp.caption && (
                            <p className="text-xs text-[#666666] mt-1 line-clamp-2">{sp.caption}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Publicidad / Ads */}
              <div className="mt-4 bg-white rounded-lg p-4 no-border">
                <div className="space-y-4">
                  {/* Slot 300x250 */}
                  <div className="w-full h-[250px] max-w-[300px] mx-auto border-2 border-dashed border-transparent rounded-md flex items-center justify-center text-[#666666]">
                    <span className="text-xs">Anuncio 300×250</span>
                  </div>
                  {/* Slot 300x600 (opcional largo) */}
                  <div className="w-full h-[300px] lg:h-[600px] max-w-[300px] mx-auto border-2 border-dashed border-transparent rounded-md flex items-center justify-center text-[#666666]">
                    <span className="text-xs">Anuncio 300×600</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Related News Section - Mejorado para responsivo */}
      <div className="w-full max-w-5xl mt-8 md:mt-12">
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="h-6 md:h-8 w-1 bg-[#BB1919] rounded-full"></div>
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-[#1A1A1A]">
              Más Noticias Relacionadas
            </h3>
          </div>
          {isAllPostsLoading || !relatedPosts ? (
            <Loader />
          ) : relatedPosts.length === 0 ? (
            <NoDataMessage
              title="No hay noticias relacionadas"
              message="No hay más noticias con categorías similares en este momento"
            />
          ) : (
            <DraggablePostGrid
              posts={relatedPosts}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
              showMeta={false}
              showTags={false}
              showStats={false}
              showCaption={true}
              cardClassName="!bg-white hover:!bg-white no-border shadow-none hover:shadow-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
