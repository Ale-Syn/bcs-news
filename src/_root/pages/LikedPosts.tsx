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

      <div className="saved-container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="h3-bold md:h2-bold text-[#1A1A1A]">
            Posts que me Gustan
            <div className="h-1 w-20 bg-[#BB1919] rounded-full"></div>
          </h2>
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
