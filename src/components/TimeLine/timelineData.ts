// 時間槽位生成函數
// 從 start 到 end，每 stepMinutes 分鐘一個間距
export function createTimeSlots(
  start: string, // 例如 '09:00'
  end: string, // 例如 '18:00'
  stepMinutes: number // 例如 15
): string[] {
  // 1 先把 '09:00' 拆成 ['09', '00'] 再轉成數字
  const [startH, startM] = start.split(":").map(Number)
  const [endH, endM] = end.split(":").map(Number)

  // 2 換算成「從 00:00 起算的總分鐘數」
  const startTotal = startH * 60 + startM
  const endTotal = endH * 60 + endM

  // 3 準備一個空陣列,等等要把所有時間字串 push 進去
  const result: string[] = []

  // 4 用 for 迴圈,每次加 stepMinutes (例如 15 分鐘)
  for (let t = startTotal; t <= endTotal; t += stepMinutes) {
    // t 就是現在的「總分鐘數」
    const h = Math.floor(t / 60) // 幾點: 用總分鐘數 / 60 取整數
    const m = t % 60 // 幾分: 用總分鐘數 % 60 取餘數

    // 5 轉回 'HH:MM' 這種格式,補 0 用 padStart(2, '0')
    const hh = String(h).padStart(2, "0") // 9 變 '09'
    const mm = String(m).padStart(2, "0") // 0 變 '00'
    result.push(`${hh}:${mm}`)
  }

  return result
}

// 廳次資料介面
export interface Theater {
  id: string
  name: string
  generalSeats: number // 一般座位數
  disabledSeats: number // 殘障座位數
}

// 九個廳的資料
export const theaters: Theater[] = [
  {
    id: "dragon",
    name: "龍廳",
    generalSeats: 240,
    disabledSeats: 6,
  },
  {
    id: "phoenix",
    name: "鳳廳",
    generalSeats: 240,
    disabledSeats: 6,
  },
  {
    id: "turtle",
    name: "烏龜廳",
    generalSeats: 120,
    disabledSeats: 4,
  },
  {
    id: "husky",
    name: "哈士奇廳",
    generalSeats: 160,
    disabledSeats: 4,
  },
  {
    id: "tiger",
    name: "虎廳",
    generalSeats: 200,
    disabledSeats: 5,
  },
  {
    id: "lion",
    name: "獅廳",
    generalSeats: 180,
    disabledSeats: 5,
  },
  {
    id: "eagle",
    name: "鷹廳",
    generalSeats: 150,
    disabledSeats: 4,
  },
  {
    id: "bear",
    name: "熊廳",
    generalSeats: 220,
    disabledSeats: 6,
  },
  {
    id: "wolf",
    name: "狼廳",
    generalSeats: 190,
    disabledSeats: 5,
  },
]

// 生成時間槽位：從 09:00 到 24:00，每 15 分鐘一個間距
export const timeSlots = createTimeSlots("09:00", "24:00", 15)
