import type { UseFormRegister, Control, FieldErrors, UseFormSetValue } from "react-hook-form"
import type { MovieFormValues } from "../hooks/useMovieForm"
import InputComponent from "../InputComponent"
import TagInput from "../TagInput"
import PosterUpload from "../PosterUpload"
import TitleComponent from "../TitleComponent"

interface MovieInfoSectionProps {
  register: UseFormRegister<MovieFormValues>
  control: Control<MovieFormValues>
  errors: FieldErrors<MovieFormValues>
  setValue: UseFormSetValue<MovieFormValues>
  originalPosterUrl: string | null
}

const MovieInfoSection = ({
  register,
  control,
  errors,
  setValue,
  originalPosterUrl,
}: MovieInfoSectionProps) => {
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
          placeholder="電影名稱"
          register={register}
          registerName="describe"
          error={errors.describe?.message}
          as="textarea"
        />
        <InputComponent
          label="預告片連結"
          placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
          register={register}
          registerName="trailerLink"
          error={errors.trailerLink?.message}
        />
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

