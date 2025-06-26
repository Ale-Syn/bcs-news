import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Models } from "appwrite";
import { useUserContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";

type DraggableSideGridProps = {
  posts: Models.Document[];
  onReorder?: (reorderedPosts: Models.Document[]) => void;
};

// Componente SidePostCard específico para noticias laterales
const SidePostCard = ({ post }: { post: Models.Document }) => {
  const { user } = useUserContext();

  if (!post.creator) return;

  return (
    <div className="side-post-card bbc-card-hover flex flex-col group" style={{ height: '363px' }}>
      {/* Imagen - altura específica 202px */}
      <Link to={`/posts/${post.$id}`} className="flex-shrink-0" style={{ height: '198px' }}>
        <div className="relative w-full h-full overflow-hidden rounded-t-lg">
          <img
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="post image"
            className="object-cover w-full h-full"
          />
        </div>
      </Link>

      {/* Contenido - altura restante (165px) */}
      <div className="p-2 sm:p-3 md:p-3 flex flex-col justify-between" style={{ height: '200px' }}>
        <div className="flex-grow mt-3 sm:mt-4 md:mt-4">
          <div className="flex-between mb-1 md:mb-2">
            <div className="flex items-center gap-2">
              {/* Avatar removido */}
            </div>

            <Link
              to={`/update-post/${post.$id}`}
              className={`${user.id !== post.creator.$id && "hidden"}`}>
              <img
                src={"/assets/icons/edit.svg"}
                alt="edit"
                width={16}
                height={16}
                className="md:w-5 md:h-5 opacity-70 hover:opacity-100 transition-opacity"
              />
            </Link>
          </div>

          <Link to={`/posts/${post.$id}`} className="flex flex-col h-full">
            <h3 className="text-sm sm:text-base md:text-base lg:text-lg font-semibold text-[#1A1A1A] mb-1 line-clamp-2 hover:text-[#BB1919] transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-1 md:gap-2 text-[#666666] text-xs mb-1 md:mb-2">
              <span>{multiFormatDateString(post.$createdAt)}</span>
              <span>•</span>
              <span>{post.location}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2 overflow-hidden" style={{ maxHeight: '2rem' }}>
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
          </Link>
        </div>

        {/* PostStats oculto en noticias laterales para ahorrar espacio */}
        {/* <div className="mt-auto">
          <PostStats post={post} userId={user.id} />
        </div> */}
      </div>
    </div>
  );
};

const DraggableSideGrid = ({ 
  posts, 
  onReorder 
}: DraggableSideGridProps) => {
  const { user } = useUserContext();
  
  // Verificar si el usuario es ADMIN
  const isAdmin = user.role === "ADMIN";

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    // Evitar reordenar si se suelta en la misma posición
    if (result.destination.index === result.source.index) return;

    const items = Array.from(posts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder?.(items);
    
    console.log('Posts reordenados:', items.map(p => p.title)); // Debug
  };

  if (!posts || posts.length === 0) return null;

  // Componente de post individual
  const PostItem = ({ post, isDragging = false }: { 
    post: Models.Document; 
    isDragging?: boolean;
  }) => (
    <div
      className={`w-full h-full transition-all duration-200 relative ${
        isDragging 
          ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-[#BB1919] ring-opacity-50 z-50' 
          : 'hover:scale-102 hover:shadow-md'
      }`}
      style={{
        cursor: isAdmin ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
    >
      <SidePostCard post={post} />
      
      {/* Drag indicator - solo para ADMIN */}
      {isAdmin && isDragging && (
        <div className="absolute top-2 right-2 bg-[#BB1919] text-white p-1 rounded-full shadow-lg">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM8 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3-9a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col">
      
      {/* Si no es ADMIN, mostrar grilla estática */}
      {!isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3 md:gap-4 w-full h-full auto-rows-fr">
          {posts.map((post) => (
            <PostItem key={post.$id} post={post} />
          ))}
        </div>
      ) : (
        /* Si es ADMIN, mostrar con funcionalidad drag and drop */
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="side-posts-grid">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3 md:gap-4 w-full h-full auto-rows-fr transition-colors duration-200 ${
                  snapshot.isDraggingOver ? 'bg-gray-50 rounded-lg p-2' : ''
                }`}
              >
                {posts.map((post, index) => (
                  <Draggable key={post.$id} draggableId={post.$id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={provided.draggableProps.style}
                        className="h-full"
                      >
                        <PostItem post={post} isDragging={snapshot.isDragging} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default DraggableSideGrid; 