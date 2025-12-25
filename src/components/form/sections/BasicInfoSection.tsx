import type { UseFormRegister, Control, FieldErrors } from "react-hook-form"
import type { MovieFormValues } from "../hooks/useMovieForm"
import InputComponent from "../InputComponent"
import FilmTypeSelect from "../FilmTypeSelect"
import CustomSelect from "../CustomSelect"
import TitleComponent from "../TitleComponent"

interface BasicInfoSectionProps {
  register: UseFormRegister<MovieFormValues>
  control: Control<MovieFormValues>
  errors: FieldErrors<MovieFormValues>
  isEditMode: boolean
}

const BasicInfoSection = ({ register, control, errors, isEditMode }: BasicInfoSectionProps) => {
  return (
    <section className="flex justify-between border-t border-gray-100 py-6">
      <TitleComponent
        title="基本資訊"
        description={isEditMode ? "編輯電影資訊" : "新增電影後無法更新"}
      />
      <div className="flex w-full max-w-141 flex-col gap-6">
        <InputComponent
          label="電影名稱"
          placeholder="電影名稱"
          register={register}
          registerName="movieName"
          error={errors.movieName?.message}
        />
        <FilmTypeSelect name="filmType" control={control} error={errors.filmType?.message} />
        <div className="flex gap-6">
          <div className="flex-1">
            <InputComponent
              label="片長"
              placeholder="60"
              type="text"
              register={register}
              registerName="duration"
              error={errors.duration?.message}
              suffix="分鐘"
            />
          </div>
          <div className="flex-1">
            <CustomSelect
              label="分級"
              placeholder="請選擇分級"
              name="category"
              control={control}
              error={errors.category?.message}
              options={[
                { label: "普遍級", value: "G" },
                { label: "輔導級", value: "PG-12" },
                { label: "限制級", value: "R-18" },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default BasicInfoSection

