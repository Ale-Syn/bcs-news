import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { Button } from "@/components/ui";
import { Loader, NoDataMessage } from "@/components/shared";
import { PostStats } from "@/components/shared";

import {
  useGetPostById,
  useGetRecentPosts,
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
  const { data: allPosts, isLoading: isAllPostsLoading } = useGetRecentPosts();
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

  // Filter posts by shared tags and exclude current post
  const relatedPosts = allPosts?.documents.filter((relatedPost: any) => {
    // Exclude current post
    if (relatedPost.$id === id) return false;
    
    // Check if posts share at least one tag
    if (!post?.tags || !relatedPost.tags) return false;
    
    return post.tags.some((tag: string) => 
      relatedPost.tags.includes(tag)
    );
  }).slice(0, 8); // Limit to 8 related posts

  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

  const handleRelatedPostClick = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    navigate(`/posts/${postId}`);
  };

  // Selección para sidebar: priorizar relacionadas, excluir la actual y completar con recientes sin duplicados
  const buildSidebarPosts = () => {
    const chosen: any[] = [];
    const currentId = id;

    const pushUnique = (list: any[] | undefined) => {
      if (!list) return;
      for (const p of list) {
        if (!p) continue;
        if (p.$id === currentId) continue;
        if (chosen.find((c) => c.$id === p.$id)) continue;
        chosen.push(p);
        if (chosen.length === 4) break;
      }
    };

    // Primero, relacionadas
    pushUnique(relatedPosts);
    // Completar con recientes si faltan
    if (chosen.length < 4) pushUnique(allPosts?.documents);

    return chosen.slice(0, 4);
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

              {/* Contenido Scrolleable */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4 lg:mb-6">
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
              <div className="bg-white rounded-lg border border-[#E5E5E5] p-4">
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
                          {sp.location && (
                            <p className="text-xs text-[#666666] mt-1">{sp.location}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Publicidad / Ads */}
              <div className="mt-4 bg-white rounded-lg border border-[#E5E5E5] p-4">
                <h3 className="text-base font-semibold text-[#1A1A1A] mb-3">Publicidad</h3>
                <div className="space-y-4">
                  {/* Slot 300x250 */}
                  <div className="w-full h-[250px] max-w-[300px] mx-auto border-2 border-dashed border-[#E5E5E5] rounded-md flex items-center justify-center text-[#666666]">
                    <span className="text-xs">Anuncio 300×250</span>
                  </div>
                  {/* Slot 300x600 (opcional largo) */}
                  <div className="w-full h-[300px] lg:h-[600px] max-w-[300px] mx-auto border-2 border-dashed border-[#E5E5E5] rounded-md flex items-center justify-center text-[#666666]">
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
        <div className="bg-[#F8F8F8] rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {relatedPosts.map((relatedPost) => (
                <div key={relatedPost.$id} className="relative h-64 md:h-80">
                  <Link 
                    to={`/posts/${relatedPost.$id}`} 
                    className="grid-post_link"
                    onClick={(e) => handleRelatedPostClick(e, relatedPost.$id)}
                  >
                    <img
                      src={relatedPost.imageUrl}
                      alt="post"
                      className="h-full w-full object-cover rounded-lg md:rounded-xl"
                    />
                    <div className="absolute top-0 left-0 right-0 p-3 md:p-4">
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {relatedPost.tags.slice(0, 2).map((tag: string, index: string) => (
                          <span
                            key={`${tag}${index}`}
                            className="text-xs text-white bg-[#BB1919]/90 px-2 py-1 rounded-full backdrop-blur-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                        {relatedPost.tags.length > 2 && (
                          <span className="text-xs text-white bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                            +{relatedPost.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/95 via-[#1A1A1A]/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                        <h3 className="text-white text-sm md:text-base lg:text-lg font-semibold line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h3>
                        <div className="flex items-center gap-2 text-white/80 text-xs md:text-sm">
                          <span>{relatedPost.location}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-[#1A1A1A]/95 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Avatar removido */}
                      </div>
                      <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                        <PostStats post={relatedPost} userId={user.id} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
