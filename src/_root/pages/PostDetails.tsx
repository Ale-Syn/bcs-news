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
        <div key={postKey} className="bg-white w-[calc(100%-16px)] sm:w-[calc(100%-32px)] md:w-full max-w-5xl mx-auto rounded-lg md:rounded-xl lg:rounded-3xl flex flex-col lg:flex-row border border-[#E5E5E5] overflow-hidden">
          {/* Imagen - Responsiva y optimizada */}
          <div className="lg:w-[48%] xl:w-[50%] bg-[#F8F8F8] p-2 md:p-3 lg:p-4 xl:p-5 flex items-center justify-center">
            <div className="w-full relative">
              <img
                src={post?.imageUrl}
                alt="post image"
                className="h-48 sm:h-64 md:h-80 lg:h-[350px] xl:h-[400px] max-h-[50vh] sm:max-h-[60vh] lg:max-h-none w-[90%] sm:w-[95%] md:w-full max-w-md lg:max-w-none rounded-lg md:rounded-xl object-cover object-center shadow-sm mx-auto"
              />
            </div>
          </div>

          {/* Contenido - Flexible */}
          <div className="flex-1 flex flex-col p-3 md:p-4 lg:p-6 xl:p-8 min-h-[400px] sm:min-h-[500px] lg:min-h-[520px]">
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
