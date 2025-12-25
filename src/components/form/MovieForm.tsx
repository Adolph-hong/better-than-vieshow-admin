import FormActions from "./FormActions"
import { useMovieForm } from "./hooks/useMovieForm"
import BasicInfoSection from "./sections/BasicInfoSection"
import MovieInfoSection from "./sections/MovieInfoSection"
import PlayPeriodSection from "./sections/PlayPeriodSection"

interface MovieFormProps {
  movieId?: string
}

const MovieForm = ({ movieId }: MovieFormProps) => {
  const { form, isEditMode, originalPosterUrl, handleSubmit } = useMovieForm(movieId)
  const {
    register,
    handleSubmit: formHandleSubmit,
    control,
    formState: { errors },
    setValue,
  } = form

  return (
    <form
      onSubmit={formHandleSubmit(
        (data) => {
          handleSubmit(data)
        },
        (formErrors) => {
          const firstError = Object.values(formErrors)[0]
          if (firstError?.message) {
            alert(firstError.message)
          } else {
            alert("請檢查表單欄位是否填寫正確")
          }
        }
      )}
      className="mt-3 flex flex-col px-[122px]"
    >
      <BasicInfoSection
        register={register}
        control={control}
        errors={errors}
        isEditMode={isEditMode}
      />
      <MovieInfoSection
        register={register}
        control={control}
        errors={errors}
        setValue={setValue}
        originalPosterUrl={originalPosterUrl}
      />
      <PlayPeriodSection control={control} errors={errors} />
      <FormActions isEditMode={isEditMode} />
    </form>
  )
}

export default MovieForm
