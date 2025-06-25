import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { Input } from "@/components/ui";
import { useDebounce } from "@/hooks/useDebounce";
import { DraggableGridPostList, Loader, NoDataMessage } from "@/components/shared";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queries";
import { Models } from "appwrite";

export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: any;
};

const SearchResults = ({
  isSearchFetching,
  searchedPosts,
}: SearchResultProps) => {
  const handleSearchReorder = (newOrder: Models.Document[]) => {
    localStorage.setItem('searchPostOrder', JSON.stringify(newOrder.map(post => post.$id)));
  };

  if (isSearchFetching) {
    return <Loader />;
  } else if (searchedPosts && searchedPosts.documents.length > 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="body-bold text-[#1A1A1A]">Resultados de búsqueda</h3>
          <div className="text-sm text-[#666666] bg-[#F8F8F8] px-3 py-1 rounded-full border border-[#E5E5E5]">
            🖱️ Arrastra para reordenar
          </div>
        </div>
        <DraggableGridPostList 
          posts={searchedPosts.documents} 
          onReorder={handleSearchReorder}
        />
      </div>
    );
  } else {
    return (
      <NoDataMessage
        title="No se encontraron resultados"
        message="Intenta con otros términos de búsqueda"
      />
    );
  }
};

const Explore = () => {
  const { ref, inView } = useInView();
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const { data: searchedPosts, isFetching: isSearchFetching } =
    useSearchPosts(debouncedSearch);

  // Función para manejar el reordenamiento de posts populares
  const handleReorder = (newOrder: Models.Document[]) => {
    localStorage.setItem('explorePostOrder', JSON.stringify(newOrder.map(post => post.$id)));
  };

  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [inView, searchValue]);

  if (!posts)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts =
    !shouldShowSearchResults &&
    posts.pages.every((item) => item.documents.length === 0);

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">
          Buscar Noticia
          <div className="h-1 w-20 bg-[#BB1919] rounded-full"></div>
        </h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-[#F8F8F8] border border-[#E5E5E5]">
          <img
            src="/assets/icons/search.svg"
            width={24}
            height={24}
            alt="search"
            className="invert-[0.2]"
          />
          <Input
            type="text"
            placeholder="Buscar noticia por titulo, descripcion o categoria..."
            className="explore-search"
            value={searchValue}
            onChange={(e) => {
              const { value } = e.target;
              setSearchValue(value);
            }}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold text-[#1A1A1A]">
          Noticias Populares
        </h3>

        <div className="flex items-center gap-4">
          <div className="text-sm text-[#666666] bg-[#F8F8F8] px-3 py-1 rounded-full border border-[#E5E5E5]">
            🖱️ Arrastra para reordenar
          </div>
          <div className="flex-center gap-3 bg-[#F8F8F8] rounded-xl px-4 py-2 cursor-pointer border border-[#E5E5E5] hover:bg-[#F0F0F0] transition-colors duration-200">
            <p className="small-medium md:base-medium text-[#1A1A1A]">Todas</p>
            <img
              src="/assets/icons/filter.svg"
              width={20}
              height={20}
              alt="filter"
              className="invert-[0.2]"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : shouldShowPosts ? (
          <NoDataMessage
            title="No hay noticias"
            message="Las noticias no estan disponibles en este momento"
          />
        ) : (
          posts.pages.map((item, index) => (
            <DraggableGridPostList 
              key={`page-${index}`} 
              posts={item.documents}
              onReorder={(newOrder) => handleReorder(newOrder)}
            />
          ))
        )}
      </div>

      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Explore;
