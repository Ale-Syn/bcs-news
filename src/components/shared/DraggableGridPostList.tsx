import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { PostStats } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";

type DraggableGridPostListProps = {
  posts: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
  onReorder?: (reorderedPosts: Models.Document[]) => void;
};

const DraggableGridPostList = ({
  posts,
  showUser = true,
  showStats = true,
  onReorder,
}: DraggableGridPostListProps) => {
  const { user } = useUserContext();
  const [orderedPosts, setOrderedPosts] = useState<Models.Document[]>(posts);

  useEffect(() => {
    setOrderedPosts(posts);
  }, [posts]);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(orderedPosts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedPosts(items);
    onReorder?.(items);
  };

  if (!orderedPosts) return null;

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="grid-posts" direction="horizontal">
        {(provided, snapshot) => (
          <ul
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`grid-container ${snapshot.isDraggingOver ? 'bg-gray-50 rounded-lg p-2' : ''}`}
          >
            {orderedPosts.map((post, index) => (
              <Draggable key={post.$id} draggableId={post.$id} index={index}>
                {(provided, snapshot) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`relative min-w-80 h-80 transition-transform duration-200 ${
                      snapshot.isDragging 
                        ? 'rotate-2 scale-105 shadow-xl ring-2 ring-[#BB1919] ring-opacity-50 z-50' 
                        : 'hover:scale-102'
                    }`}
                    style={{
                      ...provided.draggableProps.style,
                      cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                    }}
                  >
                    <Link to={`/posts/${post.$id}`} className="grid-post_link">
                      <img
                        src={post.imageUrl}
                        alt="post"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-0 left-0 right-0 p-4">
                        <div className="flex flex-wrap gap-2">
                          {post.tags?.map((tag: string, index: string) => (
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
                            {post.caption}
                          </h3>
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <span>{post.location}</span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1A1A1A]/95 to-transparent">
                      <div className="flex items-center justify-between">
                        {showUser && (
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                post.creator?.imageUrl ||
                                "/assets/icons/profile-placeholder.svg"
                              }
                              alt="creator"
                              className="w-8 h-8 rounded-full border-2 border-[#BB1919]"
                            />
                            <p className="line-clamp-1 text-white font-medium">{post.creator?.name}</p>
                          </div>
                        )}
                        {showStats && (
                          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <PostStats post={post} userId={user.id} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Drag indicator */}
                    {snapshot.isDragging && (
                      <div className="absolute top-2 right-2 bg-[#BB1919] text-white p-1 rounded-full">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM8 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3-9a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </svg>
                      </div>
                    )}
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableGridPostList; 