import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Models } from "appwrite";
import PostCard from "./PostCard";

type DraggableSideGridProps = {
  posts: Models.Document[];
  onReorder?: (reorderedPosts: Models.Document[]) => void;
};

const DraggableSideGrid = ({ 
  posts, 
  onReorder 
}: DraggableSideGridProps) => {
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

  return (
    <div className="w-full lg:w-1/2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="body-bold text-[#1A1A1A]">Noticias Rápidas</h3>
        <div className="text-xs text-[#666666] bg-[#F8F8F8] px-2 py-1 rounded-full border border-[#E5E5E5]">
          🖱️ Arrastra
        </div>
      </div>
      
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
                      className={`w-full h-full transition-all duration-200 ${
                        snapshot.isDragging 
                          ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-[#BB1919] ring-opacity-50 z-50' 
                          : 'hover:scale-102 hover:shadow-md'
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                      }}
                    >
                      <div className="relative">
                        <PostCard post={post} />
                        
                        {/* Drag indicator */}
                        {snapshot.isDragging && (
                          <div className="absolute top-2 right-2 bg-[#BB1919] text-white p-1 rounded-full shadow-lg">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM8 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3-9a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                            </svg>
                          </div>
                        )}
                        
                        {/* Hover indicator */}
                        <div className={`absolute top-2 left-2 transition-opacity duration-200 ${
                          snapshot.isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <div className="bg-white/90 backdrop-blur-sm text-[#BB1919] p-1 rounded-full shadow-sm">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DraggableSideGrid; 