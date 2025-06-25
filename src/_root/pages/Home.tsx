import { Models } from "appwrite";
import { Loader, PostCard, NoDataMessage, DraggablePostGrid, DraggableSideGrid } from "@/components/shared";
import { useGetRecentPosts } from "@/lib/react-query/queries";
import { Link, useParams } from "react-router-dom";
import { multiFormatDateString } from "@/lib/utils";
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Home = () => {
  const { location } = useParams();
  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();

  // Estado para manejar el orden personalizado de los posts
  const [reorderedPosts, setReorderedPosts] = useState<Models.Document[]>([]);
  // Estado específico para las noticias laterales
  const [reorderedSidePosts, setReorderedSidePosts] = useState<Models.Document[]>([]);

  // Get unique locations from posts
  const locations =
    posts?.documents.reduce((acc: string[], post) => {
      if (post.location && !acc.includes(post.location)) {
        acc.push(post.location);
      }
      return acc;
    }, []) || [];

  if (isErrorPosts) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-[#1A1A1A]">Something bad happened</p>
        </div>
      </div>
    );
  }

  // Filter posts by location if location param exists
  const filteredPosts = location
    ? posts?.documents.filter(
        (post) => post.location === decodeURIComponent(location)
      )
    : posts?.documents;

  // Usar posts reordenados si existen, sino usar los originales
  const postsToDisplay = reorderedPosts.length > 0 ? reorderedPosts : filteredPosts;

  // Get the first 5 posts as featured posts for the carousel
  const featuredPosts = postsToDisplay?.slice(0, 5) || [];

  // Posts para la sección lateral - usar reordenados si existen
  const sidePostsToDisplay = reorderedSidePosts.length > 0 
    ? reorderedSidePosts 
    : postsToDisplay?.slice(0, 2) || [];

  // Función para manejar el reordenamiento
  const handleReorder = (newOrder: Models.Document[]) => {
    setReorderedPosts(newOrder);
    // Aquí podrías agregar lógica para persistir el orden en localStorage o base de datos
    localStorage.setItem('postOrder', JSON.stringify(newOrder.map(post => post.$id)));
  };

  // Función para manejar el reordenamiento de las noticias laterales
  const handleSideReorder = (newOrder: Models.Document[]) => {
    console.log('Reordenando posts laterales:', newOrder.map(p => p.caption)); // Debug
    setReorderedSidePosts(newOrder);
    localStorage.setItem('sidePostOrder', JSON.stringify(newOrder.map(post => post.$id)));
  };

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <div className="w-full mb-0 mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mb-4 gap-4">
              <h2 className="h3-bold md:h2-bold text-[#1A1A1A]">
                Altavoz BCS
                <div className="h-1 w-20 bg-[#BB1919] rounded-full"></div>
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Link
                  to="/"
                  className={`px-3 sm:px-4 py-2 rounded-xl bg-[#F8F8F8] text-[#1A1A1A] border border-[#E5E5E5] hover:bg-[#F0F0F0] transition-colors duration-200 small-medium md:base-medium ${
                    !location ? "bg-[#F0F0F0]" : ""
                  }`}>
                  Todas
                </Link>
                {locations.map((loc) => (
                  <Link
                    key={loc}
                    to={`/${loc}`}
                    className={`px-3 sm:px-4 py-2 rounded-xl bg-[#F8F8F8] text-[#1A1A1A] border border-[#E5E5E5] hover:bg-[#F0F0F0] transition-colors duration-200 small-medium md:base-medium ${
                      location === loc ? "bg-[#F0F0F0]" : ""
                    }`}>
                    {loc}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <>
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full">
                {/* Featured Posts Carousel */}
                {featuredPosts.length > 0 && (
                  <div className="featured-posts w-full lg:w-1/2 max-w-4xl">
                    <Carousel
                      className="w-full"
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      plugins={[
                        Autoplay({
                          delay: 5000,
                          stopOnInteraction: false,
                        }),
                      ]}>
                      <CarouselContent>
                        {featuredPosts.map((post: Models.Document) => (
                          <CarouselItem key={post.$id}>
                            <Link to={`/posts/${post.$id}`} className="block">
                              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
                                <img
                                  src={
                                    post.imageUrl ||
                                    "/assets/icons/profile-placeholder.svg"
                                  }
                                  alt={post.caption}
                                  className="object-cover w-full h-full"
                                />
                                <div className="bbc-gradient-overlay" />
                                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                                  <div className="flex items-center gap-3 mb-2">
                                    <img
                                      src={
                                        post.creator?.imageUrl ||
                                        "/assets/icons/profile-placeholder.svg"
                                      }
                                      alt="creator"
                                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-[#BB1919]"
                                    />
                                    <span className="text-white text-xs sm:text-sm font-medium">
                                      {post.creator?.name}
                                    </span>
                                  </div>
                                  <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-2 line-clamp-2">
                                    {post.caption}
                                  </h3>
                                  <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                                    <span>
                                      {multiFormatDateString(post.$createdAt)}
                                    </span>
                                    <span>•</span>
                                    <span>{post.location}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="hidden sm:flex" />
                      <CarouselNext className="hidden sm:flex" />
                    </Carousel>
                  </div>
                )}

                {/* Side Posts Grid with Drag and Drop */}
                {sidePostsToDisplay && sidePostsToDisplay.length > 0 ? (
                  <DraggableSideGrid 
                    posts={sidePostsToDisplay} 
                    onReorder={handleSideReorder}
                  />
                ) : (
                  <div className="w-full lg:w-1/2">
                    <NoDataMessage
                      title="No hay registros"
                      message={"No hay registros disponibles en este momento"}
                    />
                  </div>
                )}
              </div>

              {/* Full Width News Section with Drag and Drop */}
              <div className="mt-6 border-t border-[#E5E5E5] pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="h3-bold md:h2-bold text-[#1A1A1A]">
                      Noticias Destacadas
                      <div className="h-1 w-20 bg-[#BB1919] rounded-full"></div>
                    </h2>
                  </div>
                  <div className="text-sm text-[#666666] bg-[#F8F8F8] px-3 py-1 rounded-full border border-[#E5E5E5]">
                    🖱️ Arrastra para reordenar
                  </div>
                </div>
                {postsToDisplay && postsToDisplay.length > 0 ? (
                  <DraggablePostGrid 
                    posts={postsToDisplay.slice(0, 6)} 
                    onReorder={handleReorder}
                  />
                ) : (
                  <NoDataMessage
                    title="No hay noticias destacadas"
                    message={"No hay noticias destacadas disponibles en este momento"}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
