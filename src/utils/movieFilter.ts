import type { MovieItem } from "@/services/movieAPI"

/**
 * 過濾電影列表，只保留在指定日期還在映期內的電影
 * @param movies 電影列表
 * @param checkDate 檢查日期（可選，預設為今天）
 * @returns 過濾後的電影列表
 */
const filterMoviesByDate = (movies: MovieItem[], checkDate?: Date): MovieItem[] => {
  const date = checkDate || new Date()
  date.setHours(0, 0, 0, 0)

  return movies.filter((movie) => {
    // 檢查上映日
    if (movie.startAt) {
      const startDate = new Date(movie.startAt)
      startDate.setHours(0, 0, 0, 0)
      if (date < startDate) {
        return false // 還沒上映
      }
    }

    // 檢查下映日
    if (!movie.endAt) {
      // 如果沒有下映日，顯示
      return true
    }

    const endDate = new Date(movie.endAt)
    endDate.setHours(0, 0, 0, 0)

    // 如果下映日 >= 檢查日期，顯示（下映日當天還會顯示）
    return endDate >= date
  })
}

export default filterMoviesByDate
