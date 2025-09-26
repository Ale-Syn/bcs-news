import { Models } from "appwrite";
import { Loader, NoDataMessage, DraggablePostGrid, DraggableSideGrid } from "@/components/shared";
import { useGetRecentPosts, useGetAllPosts, useSavePostOrder, useGetOrderedPosts } from "@/lib/react-query/queries";
import { Link, useParams, useNavigate } from "react-router-dom";
import { multiFormatDateString } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Home = () => {
  const { location, category } = useParams();
  const { user } = useUserContext();
  const isAdmin = user.role === "ADMIN";
  const navigate = useNavigate();
  

  // Usar posts ordenados si el usuario no es admin, sino usar posts normales
  const {
    data: recentPosts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = isAdmin ? useGetAllPosts() : useGetRecentPosts();

  const {
    data: mainOrderedPosts,
    isLoading: isMainOrderLoading,
  } = useGetOrderedPosts("main");

  const {
    data: sideOrderedPosts,
    isLoading: isSideOrderLoading,
  } = useGetOrderedPosts("side");

  const { mutate: saveMainOrder } = useSavePostOrder();
  const { mutate: saveSideOrder } = useSavePostOrder();

  // Estado para manejar el orden personalizado de los posts (solo para admin)
  const [reorderedPosts, setReorderedPosts] = useState<Models.Document[]>([]);
  // Estado específico para las noticias laterales (solo para admin)
  const [reorderedSidePosts, setReorderedSidePosts] = useState<Models.Document[]>([]);

  // Seleccionar qué posts usar basado en si es admin o no
  const posts = isAdmin ? recentPosts : (mainOrderedPosts || recentPosts);
  const sidePostsSource = isAdmin ? recentPosts : (sideOrderedPosts || recentPosts);

  useEffect(() => {
    // Solo cargar desde localStorage si es admin
    if (isAdmin && recentPosts?.documents) {
      const savedOrder = localStorage.getItem('postOrder');
      if (savedOrder) {
        try {
          const orderIds = JSON.parse(savedOrder);
          const orderedPosts = orderIds
            .map((id: string) => recentPosts.documents.find((post: Models.Document) => post.$id === id))
            .filter(Boolean);
          setReorderedPosts(orderedPosts);
        } catch (error) {
          console.error('Error loading saved order:', error);
        }
      }

      const savedSideOrder = localStorage.getItem('sidePostOrder');
      if (savedSideOrder) {
        try {
          const orderIds = JSON.parse(savedSideOrder);
          const orderedSidePosts = orderIds
            .map((id: string) => recentPosts.documents.find((post: Models.Document) => post.$id === id))
            .filter(Boolean);
          setReorderedSidePosts(orderedSidePosts);
        } catch (error) {
          console.error('Error loading saved side order:', error);
        }
      }
    }
  }, [isAdmin, recentPosts]);

  if (isErrorPosts) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-[#1A1A1A]">Something bad happened</p>
        </div>
      </div>
    );
  }

  // Filter posts by location or category if param exists
  const filterParam = category || location;

  // Construir lista de categorías/zonas usando tus categorías; fallback a ubicaciones de posts
  // Eliminado: categorías/locations ya no se usan en esta vista (barra global)
  const filteredPosts = filterParam
    ? posts?.documents.filter(
        (post: Models.Document) => post.location === decodeURIComponent(filterParam)
      )
    : posts?.documents;

  // Usar posts reordenados si existen (solo admin), sino usar los filtrados/ordenados
  const postsToDisplay = isAdmin && reorderedPosts.length > 0 ? reorderedPosts : filteredPosts;

  // Excluir noticias destacadas para "Más Noticias" y carrusel
  const mainPostsOnly = (postsToDisplay || []).filter((p: any) => !p?.isFeaturedSide);

  // Posts para la sección lateral
  // Si hay un orden guardado (para todos), usarlo; si no, usar las marcadas como destacadas (máx 2); fallback a recientes
  const featuredMarked = (sidePostsSource?.documents || recentPosts?.documents || [])
    ?.filter((p: any) => p.isFeaturedSide)
    .slice(0, 2);
  const sidePostsToDisplay = isAdmin && reorderedSidePosts.length > 0 
    ? reorderedSidePosts.slice(0, 2) 
    : (sideOrderedPosts?.documents?.length ? sideOrderedPosts.documents.slice(0,2) : featuredMarked.length ? featuredMarked : (sidePostsSource?.documents?.slice(0, 2) || []));

  // Quitar duplicados: excluir de "Más Noticias" lo que está en "Noticias Destacadas"
  const sideIds = new Set((sidePostsToDisplay || []).map((p: Models.Document) => p.$id));
  const mainWithoutSide = mainPostsOnly.filter((p: Models.Document) => !sideIds.has(p.$id));

  // Primeros 5 para carrusel, solo de "Más Noticias" (no destacadas ni duplicadas)
  const featuredPosts = mainWithoutSide.slice(0, 5);

  // Función para manejar el reordenamiento (solo admin)
  const handleReorder = (newOrder: Models.Document[]) => {
    if (!isAdmin) return;
    setReorderedPosts(newOrder);
    const postIds = newOrder.map(post => post.$id);
    localStorage.setItem('postOrder', JSON.stringify(postIds));
    saveMainOrder({ orderType: "main", postIds });
  };

  // Función para manejar el reordenamiento de las noticias laterales (solo admin)
  const handleSideReorder = (newOrder: Models.Document[]) => {
    if (!isAdmin) return;
    setReorderedSidePosts(newOrder);
    const postIds = newOrder.map(post => post.$id);
    localStorage.setItem('sidePostOrder', JSON.stringify(postIds));
    saveSideOrder({ orderType: "side", postIds });
  };

  return (
    <div className="flex flex-1">
      <div className="w-full">
        <div className="home-container">
          <div className="home-posts">
            {filterParam && (
              <div className="flex max-w-5xl w-full mb-2">
                <Button
                  onClick={() => navigate(-1)}
                  variant="ghost"
                  className="shad-button_ghost">
                  <img
                    src={"/assets/icons/back.svg"}
                    alt="back"
                    width={20}
                    height={20}
                    className="md:w-6 md:h-6"
                  />
                  <p className="text-sm md:text-base font-medium text-[#1A1A1A]">Volver</p>
                </Button>
              </div>
            )}
            {/* Barra de categorías removida; ahora es global (CategoriesBar) */}
            {(isPostLoading || (!isAdmin && (isMainOrderLoading || isSideOrderLoading))) && !posts ? (
              <Loader />
            ) : (
              <>
                <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 xl:gap-12 w-full lg:items-stretch">
                  {/* Featured Posts Carousel */}
                  {featuredPosts.length > 0 && (
                    <div className="featured-posts w-full lg:w-3/4 xl:w-3/5 max-w-4xl">
                      <Carousel
                        className="w-full h-full"
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
                        <CarouselContent className="h-full">
                          {featuredPosts.map((post: Models.Document) => (
                            <CarouselItem key={post.$id} className="h-full">
                              <Link to={`/posts/${post.$id}`} className="block h-full">
                                <div className="relative aspect-[16/9] md:aspect-[16/8] lg:aspect-[16/9] w-full h-full overflow-hidden rounded-lg md:rounded-xl">
                                  <img
                                    src={
                                      post.imageUrl ||
                                      "/assets/icons/profile-placeholder.svg"
                                    }
                                    alt={post.title}
                                    className="object-cover w-full h-full"
                                  />
                                  <div className="bbc-gradient-overlay" />
                                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                      {/* Avatar removido */}
                                    </div>
                                    <h3 className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-1 md:mb-2 line-clamp-2">
                                      {post.title}
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
                        <CarouselPrevious className="hidden md:flex" />
                        <CarouselNext className="hidden md:flex" />
                      </Carousel>
                    </div>
                  )}

                  {/* Side Posts Grid with Drag and Drop */}
                  <div className="w-full lg:w-1/4 xl:w-2/5 flex flex-col">
                    <div className="mt-2 mb-6 flex-shrink-0">
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#1A1A1A]">
                        Noticias Destacadas
                        <div className="h-1 w-32 bg-[#BB1919] rounded-full"></div>
                      </h2>
                      {isAdmin && (
                        <p className="text-xs text-gray-500 mt-1">Arrastra para reordenar (visible para todos)</p>
                      )}
                    </div>
                    <div className="flex-1 flex items-stretch">
                      {sidePostsToDisplay && sidePostsToDisplay.length > 0 ? (
                        <DraggableSideGrid 
                          posts={sidePostsToDisplay} 
                          onReorder={handleSideReorder}
                        />
                      ) : (
                        <NoDataMessage
                          title="No hay registros"
                          message={"No hay registros disponibles en este momento"}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Full Width News Section with Drag and Drop */}
                <div className="mt-4 md:mt-6 border-t border-[#E5E5E5] pt-4 md:pt-6">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div>
                      <h2 className="text-lg sm:base-bold md:h3-bold text-[#1A1A1A]">
                        Más Noticias
                        <div className="h-1 w-16 md:w-20 bg-[#BB1919] rounded-full"></div>
                      </h2>
                      {isAdmin && (
                        <p className="text-xs text-gray-500 mt-1">Arrastra para reordenar (visible para todos)</p>
                      )}
                    </div>
                  </div>
                  {mainWithoutSide && mainWithoutSide.length > 0 ? (
                    <DraggablePostGrid 
                      posts={isAdmin ? mainWithoutSide : mainWithoutSide.slice(0, 10)} 
                      onReorder={handleReorder}
                      showMeta={false}
                      showTags={false}
                      showCaption={true}
                    />
                  ) : (
                    <NoDataMessage
                      title="No hay más noticias"
                      message={"No hay más noticias disponibles en este momento"}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
