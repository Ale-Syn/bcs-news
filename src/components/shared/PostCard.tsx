import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { useDeletePost } from "@/lib/react-query/queries";

type PostCardProps = {
  post: Models.Document;
  showMeta?: boolean; // fecha y ubicación
  showTags?: boolean;
  showStats?: boolean;
};

const PostCard = ({ post, showMeta = true, showTags = true, showStats = true }: PostCardProps) => {
  const { user } = useUserContext();
  const { mutate: deletePost } = useDeletePost();
  const isAdmin = user?.role === "ADMIN";

  if (!post.creator) return;

  return (
    <div className="post-card bbc-card-hover flex flex-col h-full group">
      <Link to={`/posts/${post.$id}`} className="block">
        <div className="relative aspect-[5/3] md:aspect-[5/2.8] lg:aspect-[5/3] w-full overflow-hidden">
          <img
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="post image"
            className="object-cover w-full h-full"
          />
        </div>
      </Link>

      <div className="p-3 sm:p-4 md:p-4 pb-4 sm:pb-5 md:pb-5 flex flex-col flex-grow">
        <Link to={`/posts/${post.$id}`} className="flex-grow flex flex-col">
          <div className="flex-between items-start mb-2 gap-2">
            <h3 className="text-sm sm:text-base md:text-base lg:text-lg font-semibold text-[#1A1A1A] line-clamp-2 hover:text-[#BB1919] transition-colors flex-1 min-w-0">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                to={`/update-post/${post.$id}`}
                className={`${user.id !== post.creator.$id && "hidden"}`}
                onClick={(e) => e.stopPropagation()}>
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={16}
                  height={16}
                  className="md:w-5 md:h-5 opacity-70 hover:opacity-100 transition-opacity"
                />
              </Link>
              {isAdmin && (
                <button
                  type="button"
                  aria-label="Eliminar"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.confirm("¿Eliminar esta noticia?")) {
                      deletePost({ postId: post.$id, imageId: post.imageId });
                    }
                  }}
                  className="p-0.5 md:p-1 rounded hover:bg-[#F5F5F5] transition-colors">
                  <img
                    src={"/assets/icons/delete.svg"}
                    alt="delete"
                    width={16}
                    height={16}
                    className="md:w-5 md:h-5 opacity-70 hover:opacity-100 transition-opacity"
                  />
                </button>
              )}
            </div>
          </div>
          {showMeta && (
            <div className="flex items-center gap-1 md:gap-2 text-[#666666] text-xs mb-2 md:mb-3">
              <span>{multiFormatDateString(post.$createdAt)}</span>
              <span>•</span>
              <span>{post.location}</span>
            </div>
          )}
          {showTags && (
            <div className="flex flex-wrap gap-1 mb-3 overflow-hidden" style={{ maxHeight: '2.5rem' }}>
              {post.tags.slice(0, 2).map((tag: string, index: string) => (
                <span
                  key={`${tag}${index}`}
                  className="text-xs text-[#BB1919] bg-[#BB1919]/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full h-fit flex-shrink-0"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="text-xs text-[#666666] bg-gray-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full h-fit flex-shrink-0">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </Link>
        {showStats && (
          <div className="mt-2 md:mt-3">
            <PostStats post={post} userId={user.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
