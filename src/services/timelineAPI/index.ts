// 匯出共用類型
export { TimelineAPIError } from "./types"
export type { UnauthorizedError, ValidationError } from "./types"

// 匯出月曆 API
export { getMonthOverview } from "./calendar"
export type { DailyScheduleStatus, MonthOverviewResponse } from "./calendar"

// 匯出查詢時刻表 API
export { getDailySchedule } from "./searchTimeline"
export type { ShowtimeResponse, DailyScheduleResponse } from "./searchTimeline"

// 匯出儲存時刻表 API
export { saveDailySchedule } from "./saveTimeline"
export type { ShowtimeItem, SaveDailyScheduleRequest } from "./saveTimeline"

// 匯出分組時刻表 API
export { getGroupedSchedule } from "./groupedSchedule"
export type {
  GroupedScheduleResponse,
  MovieShowtimeGroup,
  TheaterTypeGroup,
  GroupedShowtimeItem,
} from "./groupedSchedule"

// 匯出開始販售時刻表 API
export { default as publishDailySchedule } from "./publishSchedule"

// 匯出複製時刻表 API
export { default as copyDailySchedule } from "./copySchedule"
export type { CopyScheduleRequest, CopyScheduleResponse } from "./copySchedule"
