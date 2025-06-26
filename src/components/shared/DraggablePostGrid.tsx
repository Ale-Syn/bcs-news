import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Models } from "appwrite";
import PostCard from "./PostCard";
import { useUserContext } from "@/context/AuthContext";

type DraggablePostGridProps = {
  posts: Models.Document[];
  className?: string;
  onReorder?: (reorderedPosts: Models.Document[]) => void;
};

const DraggablePostGrid = ({ 
  posts, 
  className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-fr",
  onReorder 
}: DraggablePostGridProps) => {
  const { user } = useUserContext();
  const [orderedPosts, setOrderedPosts] = useState<Models.Document[]>(posts);
  
  // Verificar si el usuario es ADMIN
  const isAdmin = user.role === "ADMIN";

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

  if (!orderedPosts || orderedPosts.length === 0) return null;

  // Componente de post individual
  const PostItem = ({ post, isDragging = false }: { 
    post: Models.Document; 
    isDragging?: boolean;
  }) => (
    <div
      className={`w-full h-full flex transition-transform duration-200 relative ${
        isDragging 
          ? 'rotate-3 scale-105 shadow-lg ring-2 ring-[#BB1919] ring-opacity-50' 
          : 'hover:scale-102'
      }`}
      style={{
        cursor: isAdmin ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
    >
      <PostCard post={post} />
      

      
      {/* Drag indicator - solo para ADMIN */}
      {isAdmin && isDragging && (
        <div className="absolute top-2 right-2 bg-[#BB1919] text-white p-1 rounded-full z-10">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM8 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3-9a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
        </div>
      )}
    </div>
  );

  // Si no es ADMIN, mostrar grilla estática
  if (!isAdmin) {
    return (
      <div className={className}>
        {orderedPosts.map((post) => (
          <PostItem key={post.$id} post={post} />
        ))}
      </div>
    );
  }

  // Si es ADMIN, mostrar con funcionalidad drag and drop
  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="posts-grid" direction="horizontal">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`${className} ${snapshot.isDraggingOver ? 'bg-gray-50 rounded-lg p-2' : ''}`}
          >
            {orderedPosts.map((post, index) => (
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
  );
};

export default DraggablePostGrid; 