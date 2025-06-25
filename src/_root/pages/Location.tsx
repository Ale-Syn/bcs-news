import { useParams } from "react-router-dom";
import { useGetPosts } from "@/lib/react-query/queries";
import { DraggableGridPostList, Loader } from "@/components/shared";

const Location = () => {
  const { location } = useParams();
  const { data: postsData, isLoading } = useGetPosts();

  // Filter posts by location
  const locationPosts = postsData?.pages.reduce((acc: any[], page) => {
    const pagePosts = page.documents.filter(
      (post: any) => post.location === decodeURIComponent(location || "")
    );
    return [...acc, ...pagePosts];
  }, []);

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (!locationPosts?.length) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4">
          No se encontraron noticias para esta categoria.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="user-container">
          <h2 className="h3-bold md:h2-bold text-left w-full">
            Posts from {decodeURIComponent(location || "")}
          </h2>
          <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="body-bold text-[#1A1A1A]">Posts por ubicación</h3>
            <div className="text-sm text-[#666666] bg-[#F8F8F8] px-3 py-1 rounded-full border border-[#E5E5E5]">
              🖱️ Arrastra para reordenar
            </div>
          </div>
          <DraggableGridPostList 
            posts={locationPosts} 
            showUser={true}
            onReorder={(newOrder) => {
              localStorage.setItem('locationPostOrder', JSON.stringify(newOrder.map(post => post.$id)));
            }}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default Location; 