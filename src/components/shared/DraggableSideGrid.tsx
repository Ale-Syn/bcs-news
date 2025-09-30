import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Models } from "appwrite";
import { useUserContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";

type DraggableSideGridProps = {
  posts: Models.Document[];
  onReorder?: (reorderedPosts: Models.Document[]) => void;
};

// Componente SidePostCard específico para noticias laterales
const SidePostCard = ({ post }: { post: Models.Document }) => {
  const { user } = useUserContext();

  if (!post.creator) return;

  return (
    <div className="side-post-card flex flex-col group h-full">
      {/* Imagen - altura ligeramente reducida */}
      <Link to={`/posts/${post.$id}`} className="flex-shrink-0 h-[180px]">
        <div className="relative w-full h-full overflow-hidden rounded-t-lg">
          <img
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="post image"
            className="object-cover w-full h-full"
          />
        </div>
      </Link>

      {/* Contenido - altura restante (165px) */}
      <div className="p-2 sm:p-3 md:p-3 flex flex-col justify-between flex-1">
        <div className="flex-grow mt-3 sm:mt-3 md:mt-3">
          <Link to={`/posts/${post.$id}`} className="flex flex-col h-full">
            <div className="flex-between items-start mb-2 sm:mb-3 md:mb-3 gap-2">
              <h3 className="text-sm sm:text-base md:text-base lg:text-lg font-semibold text-[#1A1A1A] line-clamp-2 hover:text-[#BB1919] transition-colors flex-1 min-w-0">
                {post.title}
              </h3>
              <Link
                to={`/update-post/${post.$id}`}
                className={`flex-shrink-0 ${user.id !== post.creator.$id && "hidden"}`}
                onClick={(e) => e.stopPropagation()}>
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={16}
                  height={16}
                  className="md:w-5 md:h-5 opacity-70 hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>
            <div className="text-xs text-[#444444] line-clamp-3 mb-2">{post.caption}</div>
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
      className={`w-full h-full transition-none relative ${
        isDragging 
          ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-[#BB1919] ring-opacity-50 z-50' 
          : ''
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