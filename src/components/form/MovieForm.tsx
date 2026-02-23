import toast from "react-hot-toast"
import { ClipLoader } from "react-spinners"
import FormActions from "./FormActions"
import { useMovieForm } from "./hooks/useMovieForm"
import BasicInfoSection from "./sections/BasicInfoSection"
import MovieInfoSection from "./sections/MovieInfoSection"
import PlayPeriodSection from "./sections/PlayPeriodSection"

interface MovieFormProps {
  movieId?: string
}

const MovieForm = ({ movieId }: MovieFormProps) => {
  const { form, isEditMode, originalPosterUrl, handleSubmit, isLoading, isSubmitting } =
    useMovieForm(movieId)
  const {
    register,
    handleSubmit: formHandleSubmit,
    control,
    formState: { errors },
    setValue,
  } = form

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <ClipLoader color="#5365AC" size={40} />
      </div>
    )
  }

  return (
    <form
      onSubmit={formHandleSubmit(
        (data) => {
          handleSubmit(data)
        },
        (formErrors) => {
          const firstError = Object.values(formErrors)[0]
          if (firstError?.message) {
            toast.error(firstError.message, { id: "validation-form-error" })
          } else {
            toast.error("請檢查表單欄位是否填寫正確", { id: "validation-form-error" })
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
        isEditMode={isEditMode}
      />
      <PlayPeriodSection control={control} errors={errors} isEditMode={isEditMode} />
      <FormActions isEditMode={isEditMode} isSubmitting={isSubmitting} />
    </form>
  )
}

export default MovieForm
