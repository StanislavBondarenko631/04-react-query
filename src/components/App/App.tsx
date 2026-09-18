import styles from "./App.module.css";

import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";

import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";

import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import ReactPaginateModule from "react-paginate";
import type { ReactPaginateProps } from "react-paginate";
import type { ComponentType } from "react";

type ModuleWithDefault<T> = { default: T };

const ReactPaginate = (
  ReactPaginateModule as unknown as ModuleWithDefault<
    ComponentType<ReactPaginateProps>
  >
).default;

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const [page, setPage] = useState<number>(1);

  const [query, setQuery] = useState<string>("");

  const {
    data,
    isFetching: isQueryFetching,
    isError: isQueryError,
    isSuccess,
  } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: query.length > 0,
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.total_pages || 0;

  const moviesList = data?.results || [];

  useEffect(() => {
    if (isSuccess && query.length > 0 && data?.results?.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [isSuccess, data, query]);

  const handleSearch = async (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  };

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />

      <SearchBar onSubmit={handleSearch} />

      <main className={styles.container}></main>

      {isQueryFetching && <Loader />}

      {isQueryError && <ErrorMessage />}

      {moviesList.length > 0 && !isQueryFetching && (
        <MovieGrid movies={moviesList} onSelect={setSelectedMovie} />
      )}

      {totalPages > 1 && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={styles.pagination}
          activeClassName={styles.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
