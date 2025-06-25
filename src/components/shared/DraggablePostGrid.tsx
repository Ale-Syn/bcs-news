import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Models } from "appwrite";
import PostCard from "./PostCard";

type DraggablePostGridProps = {
  posts: Models.Document[];
  className?: string;
  onReorder?: (reorderedPosts: Models.Document[]) => void;
};

const DraggablePostGrid = ({ 
  posts, 
  className = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 auto-rows-fr",
  onReorder 
}: DraggablePostGridProps) => {
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

  if (!orderedPosts || orderedPosts.length === 0) return null;

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
                    className={`w-full h-full flex transition-transform duration-200 ${
                      snapshot.isDragging 
                        ? 'rotate-3 scale-105 shadow-lg ring-2 ring-[#BB1919] ring-opacity-50' 
                        : 'hover:scale-102'
                    }`}
                    style={{
                      ...provided.draggableProps.style,
                      cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                    }}
                  >
                    <PostCard post={post} />
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