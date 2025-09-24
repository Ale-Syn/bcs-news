import { useParams, useNavigate } from "react-router-dom";
import { useGetPosts } from "@/lib/react-query/queries";
import { DraggablePostGrid, Loader, AdBanner } from "@/components/shared";
import { Button } from "@/components/ui";

const Location = () => {
  const { location, category } = useParams();
  const navigate = useNavigate();
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
    <div className="flex flex-1 flex-col w-full">
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdBanner heightClass="h-16 md:h-20 lg:h-20" className="rounded-lg" />
        </div>
      </div>
      <div className="common-container">
        <div className="user-container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                className="shad-button_ghost p-2">
                <img
                  src={"/assets/icons/back.svg"}
                  alt="Volver"
                  width={20}
                  height={20}
                  className="md:w-6 md:h-6"
                />
              </Button>
              <h2 className="h3-bold md:h2-bold text-[#1A1A1A]">
                {displayName}
                <div className="h-1 w-20 bg-[#BB1919] rounded-full"></div>
              </h2>
            </div>
          </div>
          <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="body-bold text-[#1A1A1A]">
              {category ? "Posts por categoría" : "Posts por ubicación"}
            </h3>
          </div>
          <DraggablePostGrid 
            posts={filteredPosts}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default Location; 