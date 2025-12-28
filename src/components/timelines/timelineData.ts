export function createTimeSlots(start: string, end: string, stepMinutes: number): string[] {
  const [startH, startM] = start.split(":").map(Number)
  const [endH, endM] = end.split(":").map(Number)

  const startTotal = startH * 60 + startM
  const endTotal = endH * 60 + endM

  const result: string[] = []

  for (let t = startTotal; t <= endTotal; t += stepMinutes) {
    const h = Math.floor(t / 60)
    const m = t % 60

    const hh = String(h).padStart(2, "0")
    const mm = String(m).padStart(2, "0")
    result.push(`${hh}:${mm}`)
  }

  return result
}

export type TheaterType = "數位" | "3DX" | "IMAX"

export interface Theater {
  id: string
  name: string
  type: TheaterType
  generalSeats: number
  disabledSeats: number
}

export const theaters: Theater[] = [
  {
    id: "dragon",
    name: "龍廳",
    type: "數位",
    generalSeats: 240,
    disabledSeats: 6,
  },
  {
    id: "phoenix",
    name: "鳳廳",
    type: "3DX",
    generalSeats: 240,
    disabledSeats: 6,
  },
  {
    id: "turtle",
    name: "烏龜廳",
    type: "IMAX",
    generalSeats: 120,
    disabledSeats: 4,
  },
  {
    id: "husky",
    name: "哈士奇廳",
    type: "數位",
    generalSeats: 160,
    disabledSeats: 4,
  },
  {
    id: "tiger",
    name: "虎廳",
    type: "3DX",
    generalSeats: 200,
    disabledSeats: 5,
  },
  {
    id: "lion",
    name: "獅廳",
    type: "數位",
    generalSeats: 180,
    disabledSeats: 5,
  },
  {
    id: "eagle",
    name: "鷹廳",
    type: "IMAX",
    generalSeats: 150,
    disabledSeats: 4,
  },
  {
    id: "bear",
    name: "熊廳",
    type: "3DX",
    generalSeats: 220,
    disabledSeats: 6,
  },
  {
    id: "wolf",
    name: "狼廳",
    type: "數位",
    generalSeats: 190,
    disabledSeats: 5,
  },
  {
    id: "panda",
    name: "熊貓廳",
    type: "IMAX",
    generalSeats: 140,
    disabledSeats: 4,
  },
  {
    id: "rabbit",
    name: "兔廳",
    type: "3DX",
    generalSeats: 170,
    disabledSeats: 5,
  },
]

export const timeSlots = createTimeSlots("09:00", "24:00", 15)
