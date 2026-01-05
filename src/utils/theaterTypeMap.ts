/**
 * 將英文影廳類型轉換為中文顯示名稱
 * @param type - 英文影廳類型 (例如: "Digital", "IMAX", "4DX")
 * @returns 中文顯示名稱
 */
export const getTheaterTypeDisplayName = (type: string): string => {
  const typeMap: Record<string, string> = {
    Digital: "一般數位",
    IMAX: "IMAX",
    "4DX": "4DX",
  }

  return typeMap[type] || type
}
