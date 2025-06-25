import { useParams } from "react-router-dom";
import { useGetPosts } from "@/lib/react-query/queries";
import { DraggableGridPostList, Loader } from "@/components/shared";

const Location = () => {
  const { location, category } = useParams();
  const { data: postsData, isLoading } = useGetPosts();

  // Get the filter parameter (could be location or category)
  const filterParam = category || location || "";
  const displayName = decodeURIComponent(filterParam);

  // Filter posts by location or category
  const filteredPosts = postsData?.pages.reduce((acc: any[], page) => {
    const pagePosts = page.documents.filter(
      (post: any) => post.location === displayName
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

  if (!filteredPosts?.length) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4">
          No se encontraron noticias para esta categoría.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="user-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="h3-bold md:h2-bold text-[#1A1A1A]">
              {displayName}
              <div className="h-1 w-20 bg-[#BB1919] rounded-full"></div>
            </h2>
          </div>
          <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="body-bold text-[#1A1A1A]">
              {category ? "Posts por categoría" : "Posts por ubicación"}
            </h3>
          </div>
          <DraggableGridPostList 
            posts={filteredPosts} 
            showUser={true}
            onReorder={(newOrder) => {
              localStorage.setItem(`${category ? 'category' : 'location'}PostOrder`, JSON.stringify(newOrder.map(post => post.$id)));
            }}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default Location; 