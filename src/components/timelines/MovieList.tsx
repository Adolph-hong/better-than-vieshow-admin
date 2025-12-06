interface Schedule {
  id: string
  movieId: string
  theaterId: string
  startTime: string
  endTime: string
}

interface MovieListProps {
  movies: { id: string; movieName: string }[]
  schedules?: Schedule[]
}

const MovieList = ({ movies, schedules = [] }: MovieListProps) => {
  const safeMovies = Array.isArray(movies) ? movies : []
  const safeSchedules = Array.isArray(schedules) ? schedules : []

  const getShowtimeCount = (movieId: string): number => {
    return safeSchedules.filter((schedule) => schedule.movieId === movieId).length
  }

  return (
    <div className="rounded-sm bg-white p-4">
      <div className="font-family-inter flex justify-between px-2 py-3 font-semibold text-[#000000]">
        <span>電影</span>
        <span>場次</span>
      </div>

      <div className="flex flex-col">
        {safeMovies.map((movie) => (
          <div
            key={movie.id}
            className="body-medium flex justify-between border-t border-gray-50 px-2 py-3"
          >
            <span className="line-clamp-2 max-w-46.5 break-all">{movie.movieName}</span>
            <span>{getShowtimeCount(movie.id)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MovieList
