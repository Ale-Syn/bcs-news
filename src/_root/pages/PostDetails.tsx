import { useParams, Link, useNavigate } from "react-router-dom";

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
  const { data: allPosts, isLoading: isAllPostsLoading } = useGetRecentPosts();
  const { mutate: deletePost } = useDeletePost();

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
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // Small delay to ensure smooth scroll starts before navigation
    setTimeout(() => {
      navigate(`/posts/${postId}`);
    }, 500);
  };

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium text-[#1A1A1A]">Volver</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img
            src={post?.imageUrl}
            alt="creator"
            className="post_details-img"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <div className="flex flex-col gap-2 flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-[#1A1A1A] line-clamp-3">
                  {post?.caption}
                </h1>
                <div className="flex-center gap-2 text-[#666666]">
                  <p className="subtle-semibold lg:small-regular">
                    {multiFormatDateString(post?.$createdAt)}
                  </p>
                  •
                  <p className="subtle-semibold lg:small-regular">
                    {post?.location}
                  </p>
                </div>
              </div>

              <div className="flex-center gap-4">
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && "hidden"}`}>
                  <img
                    src={"/assets/icons/edit.svg"}
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ost_details-delete_btn ${
                    user.id !== post?.creator.$id && "hidden"
                  }`}>
                  <img
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-[#E5E5E5]" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular text-[#1A1A1A]">
              <ul className="flex gap-1 flex-wrap">
                {post?.tags.map((tag: string, index: string) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-[#BB1919] small-regular bg-[#BB1919]/10 px-3 py-1 rounded-full">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>
          </div>
        </div>
      )}

      {/* Related News Section */}
      <div className="w-full max-w-5xl mt-12">
        <div className="bg-[#F8F8F8] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-[#BB1919] rounded-full"></div>
            <h3 className="body-bold md:h3-bold text-[#1A1A1A]">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedPosts.map((relatedPost) => (
                <div key={relatedPost.$id} className="relative h-80">
                  <Link 
                    to={`/posts/${relatedPost.$id}`} 
                    className="grid-post_link"
                    onClick={(e) => handleRelatedPostClick(e, relatedPost.$id)}
                  >
                    <img
                      src={relatedPost.imageUrl}
                      alt="post"
                      className="h-full w-full object-cover rounded-xl"
                    />
                    <div className="absolute top-0 left-0 right-0 p-4">
                      <div className="flex flex-wrap gap-2">
                        {relatedPost.tags.map((tag: string, index: string) => (
                          <span
                            key={`${tag}${index}`}
                            className="text-xs text-white bg-[#BB1919]/90 px-2 py-1 rounded-full backdrop-blur-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/95 via-[#1A1A1A]/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-lg font-semibold line-clamp-2 mb-2">
                          {relatedPost.caption}
                        </h3>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <span>{relatedPost.location}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1A1A1A]/95 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Avatar removido */}
                      </div>
                      <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
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
