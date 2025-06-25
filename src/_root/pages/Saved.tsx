import { Models } from "appwrite";

import { DraggableGridPostList, Loader, NoDataMessage } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";

const Saved = () => {
  const { data: currentUser } = useGetCurrentUser();

  const savePosts = currentUser?.save
    ? currentUser.save
        .filter((savePost: Models.Document) => savePost.post)
        .map((savePost: Models.Document) => ({
          ...savePost.post,
          creator: {
            imageUrl: currentUser.imageUrl,
          },
        }))
        .reverse()
    : [];

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <h2 className="h3-bold md:h2-bold text-left w-full">
          Noticias Guardadas
          <div className="h-1 w-20 bg-[#BB1919] rounded-full"></div>
        </h2>
      </div>

      {!currentUser ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savePosts.length === 0 ? (
            <NoDataMessage
              title="No hay noticias guardadas"
              message="Las noticias que guardes aparecerán aquí"
            />
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="body-bold text-[#1A1A1A]">Posts Guardados</h3>
                <div className="text-sm text-[#666666] bg-[#F8F8F8] px-3 py-1 rounded-full border border-[#E5E5E5]">
                  🖱️ Arrastra para reordenar
                </div>
              </div>
              <DraggableGridPostList 
                posts={savePosts} 
                showStats={false}
                onReorder={(newOrder) => {
                  localStorage.setItem('savedPostOrder', JSON.stringify(newOrder.map(post => post.$id)));
                }}
              />
            </div>
          )}
        </ul>
      )}
    </div>
  );
};

export default Saved;
