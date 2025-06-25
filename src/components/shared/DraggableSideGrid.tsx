import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Models } from "appwrite";
import PostCard from "./PostCard";
import { useUserContext } from "@/context/AuthContext";

type DraggableSideGridProps = {
  posts: Models.Document[];
  onReorder?: (reorderedPosts: Models.Document[]) => void;
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
    
    console.log('Posts reordenados:', items.map(p => p.caption)); // Debug
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
      <PostCard post={post} />
      
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
    <div className="w-full">
      
      {/* Si no es ADMIN, mostrar grilla estática */}
      {!isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
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
                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full transition-colors duration-200 ${
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