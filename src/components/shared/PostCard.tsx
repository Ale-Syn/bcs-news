import { Models } from "appwrite";
import { Link } from "react-router-dom";

import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();

  if (!post.creator) return;

  return (
    <div className="post-card bbc-card-hover flex flex-col h-full">
      <Link to={`/posts/${post.$id}`} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="post image"
            className="object-cover w-full h-full"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-between mb-3">
          <div className="flex items-center gap-2">
            <Link to={`/profile/${post.creator.$id}`}>
              <img
                src={post.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="creator"
                className="w-7 h-7 rounded-full border-2 border-[#BB1919]"
              />
            </Link>
            <span className="text-sm text-[#1A1A1A] font-medium">
              {post.creator.name}
            </span>
          </div>

          <Link
            to={`/update-post/${post.$id}`}
            className={`${user.id !== post.creator.$id && "hidden"}`}>
            <img
              src={"/assets/icons/edit.svg"}
              alt="edit"
              width={20}
              height={20}
              className="opacity-70 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        <Link to={`/posts/${post.$id}`} className="flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2 line-clamp-2 hover:text-[#BB1919] transition-colors">
            {post.caption}
          </h3>
          <div className="flex items-center gap-2 text-[#666666] text-sm mb-3">
            <span>{multiFormatDateString(post.$createdAt)}</span>
            <span>•</span>
            <span>{post.location}</span>
          </div>
          <div className="flex flex-wrap gap-2 flex-grow">
            {post.tags.slice(0, 3).map((tag: string, index: string) => (
              <span
                key={`${tag}${index}`}
                className="text-xs text-[#BB1919] bg-[#BB1919]/10 px-2 py-1 rounded-full h-fit"
              >
                #{tag}
              </span>
            ))}
          </div>
        </Link>

        <div className="mt-3">
          <PostStats post={post} userId={user.id} />
        </div>
      </div>
    </div>
  );
};

export default PostCard;
