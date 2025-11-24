// eslint-disable-next-line import/prefer-default-export
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dojpfbtw8"
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "movie_poster"

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", uploadPreset)

  const res = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error("電影封面上傳失敗，請稍後再試")
  }

  const data = await res.json()
  return data.secure_url
}

const generateSignature = async (
  publicId: string,
  timestamp: number,
  apiSecret: string
): Promise<string> => {
  const message = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-1", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

export const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return

  try {
    const urlParts = imageUrl.split("/")
    const uploadIndex = urlParts.findIndex((part) => part === "upload")
    if (uploadIndex === -1) return

    const afterUpload = urlParts.slice(uploadIndex + 1)
    const publicIdWithExt = afterUpload.join("/")
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "")

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dojpfbtw8"
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET

    // 如果沒有 API key 和 secret，無法刪除（需要後端支援）
    if (!apiKey || !apiSecret) {
      // eslint-disable-next-line no-console
      console.warn("無法刪除 Cloudinary 圖片：缺少 API 憑證")
      return
    }

    const deleteUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`
    const timestamp = Math.round(new Date().getTime() / 1000)
    const signature = await generateSignature(publicId, timestamp, apiSecret)

    const formData = new FormData()
    formData.append("public_id", publicId)
    formData.append("timestamp", timestamp.toString())
    formData.append("api_key", apiKey)
    formData.append("signature", signature)

    const res = await fetch(deleteUrl, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      throw new Error("刪除圖片失敗")
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("刪除 Cloudinary 圖片時發生錯誤:", error)
  }
}
