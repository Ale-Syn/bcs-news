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
  showCaption?: boolean;
  className?: string;
  layout?: "vertical" | "horizontal";
  showCreatedAt?: boolean;
  titleClampLines?: 2 | 3;
};

const PostCard = ({ post, showMeta = true, showTags = true, showStats = true, showCaption = false, className = "", layout = "vertical", showCreatedAt = false, titleClampLines = 2 }: PostCardProps) => {
  const { user } = useUserContext();
  const { mutate: deletePost } = useDeletePost();
  const isAdmin = user?.role === "ADMIN";

  if (!post.creator) return;

  const isHorizontal = layout === "horizontal";

  return (
    <div className={`post-card bbc-card-hover ${isHorizontal ? 'flex flex-row no-border' : 'flex flex-col'} h-full group ${className}`}>
      <Link to={`/posts/${post.$id}`} className={isHorizontal ? 'block w-40 sm:w-48 md:w-56 flex-shrink-0' : 'block'}>
        <div className={`${isHorizontal ? 'relative w-full h-full aspect-[4/3]' : 'relative aspect-[5/3] md:aspect-[5/2.8] lg:aspect-[5/3]'} w-full overflow-hidden`}>
          <img
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="post image"
            className="object-cover w-full h-full"
          />
        </div>
      </Link>

      <div className={`p-3 sm:p-4 md:p-4 pb-4 sm:pb-5 md:pb-5 flex flex-col flex-grow ${isHorizontal ? 'min-w-0 justify-center bg-white no-border' : ''}`}>
        <Link to={`/posts/${post.$id}`} className={`flex-grow flex flex-col ${isHorizontal ? 'min-w-0 justify-center' : ''}`}>
          <div className={`flex items-start ${isHorizontal ? 'mb-0' : 'mb-2'} gap-2`}>
            <div className="flex-1 min-w-0">
              <div className="leading-tight">
                <h3 className={`${isHorizontal ? 'text-base sm:text-lg md:text-xl' : 'text-sm sm:text-base md:text-base lg:text-lg'} font-semibold text-[#1A1A1A] ${titleClampLines === 3 ? 'line-clamp-3' : 'line-clamp-2'} hover:text-[#BB1919] transition-colors min-w-0`}>
                  {post.title}
                </h3>
              </div>
              {showCaption && (
                <div className="leading-snug">
                  <p className="mt-0 text-sm text-[#444444] line-clamp-2">{post.caption}</p>
                </div>
              )}
              {showCreatedAt && (
                <div className="mt-1 text-xs text-[#666666]">
                  {new Date(post.$createdAt).toLocaleString('es-MX', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </div>
              )}
            </div>
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
