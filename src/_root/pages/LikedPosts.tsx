import { DraggableGridPostList, Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";

const LikedPosts = () => {
  const { data: currentUser } = useGetCurrentUser();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <>
      {currentUser.liked.length === 0 && (
        <p className="text-light-4">Aun no tienes noticias guardadas</p>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="body-bold text-[#1A1A1A]">Posts que me gustan</h3>
          <div className="text-sm text-[#666666] bg-[#F8F8F8] px-3 py-1 rounded-full border border-[#E5E5E5]">
            🖱️ Arrastra para reordenar
          </div>
        </div>
        <DraggableGridPostList 
          posts={currentUser.liked} 
          showStats={false}
          onReorder={(newOrder) => {
            localStorage.setItem('likedPostOrder', JSON.stringify(newOrder.map(post => post.$id)));
          }}
        />
      </div>
    </>
  );
};

export default LikedPosts;
