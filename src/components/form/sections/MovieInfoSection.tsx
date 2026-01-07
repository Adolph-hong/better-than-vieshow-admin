import { useMemo } from "react"
import { useWatch } from "react-hook-form"
import InputComponent from "../InputComponent"
import PosterUpload from "../PosterUpload"
import TagInput from "../TagInput"
import TitleComponent from "../TitleComponent"
import type { MovieFormValues } from "../hooks/useMovieForm"
import type { UseFormRegister, Control, FieldErrors, UseFormSetValue } from "react-hook-form"

interface MovieInfoSectionProps {
  register: UseFormRegister<MovieFormValues>
  control: Control<MovieFormValues>
  errors: FieldErrors<MovieFormValues>
  setValue: UseFormSetValue<MovieFormValues>
  originalPosterUrl: string | null
}

// 將 YouTube URL 轉換為嵌入 URL
const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null

  try {
    // 處理各種 YouTube URL 格式
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    // https://youtube.com/watch?v=VIDEO_ID

    let videoId: string | null = null

    // 如果已經是嵌入 URL，直接返回
    if (url.includes("youtube.com/embed/")) {
      return url
    }

    // 處理標準 YouTube URL
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (watchMatch) {
      const [, extractedVideoId] = watchMatch
      if (extractedVideoId) {
        videoId = extractedVideoId
      }
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`
    }

    return null
  } catch {
    return null
  }
}

const MovieInfoSection = ({
  register,
  control,
  errors,
  setValue,
  originalPosterUrl,
}: MovieInfoSectionProps) => {
  const trailerLink = useWatch({ control, name: "trailerLink" })
  const embedUrl = useMemo(() => {
    if (!trailerLink || typeof trailerLink !== "string") return null
    return getYouTubeEmbedUrl(trailerLink.trim())
  }, [trailerLink])

  return (
    <section className="flex justify-between border-t border-gray-100 py-6">
      <TitleComponent title="電影介紹" description="會顯示在電影資訊頁面" />
      <div className="flex w-full max-w-141 flex-col gap-6">
        <TagInput
          label="導演"
          name="director"
          control={control}
          placeholder="導演"
          error={errors.director?.message}
          inputId="director-input"
        />
        <TagInput
          label="演員"
          name="actors"
          control={control}
          placeholder="演員A、演員B、演員C"
          error={errors.actors?.message}
          inputId="actor-input"
        />
        <InputComponent
          label="描述"
          placeholder="電影描述"
          register={register}
          registerName="describe"
          error={errors.describe?.message}
          as="textarea"
        />
        <div className="flex flex-col gap-2">
          <InputComponent
            label="預告片連結"
            placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
            register={register}
            registerName="trailerLink"
            error={errors.trailerLink?.message}
          />
          {embedUrl && (
            <div className="mt-2 w-full overflow-hidden rounded-lg">
              <iframe
                width="100%"
                height="315"
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="aspect-video w-full"
                style={{ minHeight: "315px" }}
              />
            </div>
          )}
        </div>
        <PosterUpload
          key={originalPosterUrl || "new"}
          label="電影封面"
          placeholder="JPG or PNG"
          existingImageUrl={originalPosterUrl}
          onChange={(file) => setValue("poster", file)}
        />
      </div>
    </section>
  )
}

export default MovieInfoSection
