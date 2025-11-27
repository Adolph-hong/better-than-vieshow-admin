interface MovieListProps {
  movies: { id: string; movieName: string }[]
}

const MovieList = ({ movies }: MovieListProps) => {
  return (
    <div className="rounded-sm bg-white p-4">
      <div className="font-family-inter flex justify-between px-2 py-3 font-semibold text-[#000000]">
        <span>電影</span>
        <span>場次</span>
      </div>

      <div className="flex flex-col">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="body-medium flex justify-between border-t border-gray-50 px-2 py-3"
          >
            <span className="line-clamp-2 max-w-46.5 break-all">{movie.movieName}</span>
            <span>0</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MovieList
