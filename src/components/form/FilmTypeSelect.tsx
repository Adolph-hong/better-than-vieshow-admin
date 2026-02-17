import { useController } from "react-hook-form"
import Select from "react-select"
import type { MovieFormValues } from "./hooks/useMovieForm"
import type { Control } from "react-hook-form"

interface FilmTypeSelectProps {
  name: "filmType"
  control: Control<MovieFormValues>
  error?: string
  showRequiredBadge?: boolean
  isFilled?: boolean
}

const filmTypeOptions = [
  { label: "動作", value: "動作" },
  { label: "愛情", value: "愛情" },
  { label: "冒險", value: "冒險" },
  { label: "懸疑", value: "懸疑" },
  { label: "恐怖", value: "恐怖" },
  { label: "科幻", value: "科幻" },
  { label: "日本動漫", value: "日本動漫" },
  { label: "喜劇", value: "喜劇" },
]

const FilmTypeSelect = ({
  name,
  control,
  error,
  showRequiredBadge = false,
  isFilled = false,
}: FilmTypeSelectProps) => {
  const { field } = useController({ name, control })

  const fieldValue = typeof field.value === "string" ? field.value : ""
  const selectedValues = fieldValue
    ? fieldValue
        .split(",")
        .map((v: string) => v.trim())
        .filter(Boolean)
        .map((v: string) => filmTypeOptions.find((opt) => opt.value === v))
        .filter(Boolean)
    : []

  const shouldShowRequired = showRequiredBadge && !isFilled

  return (
    <div className="font-family-inter flex flex-col gap-2 text-sm font-medium text-[#000000]">
      <span className="flex items-center gap-2">
        <span>影片類型</span>
        {shouldShowRequired && (
          <span className="body-small rounded-full bg-[#FFF0F0] px-2 py-0.5 text-[10px] text-[#E54848]">
            必填
          </span>
        )}
      </span>
      <Select
        isMulti
        options={filmTypeOptions}
        value={selectedValues}
        onChange={(newValue) => {
          const values = newValue
            ? newValue
                .map((item) => item?.value)
                .filter(Boolean)
                .join(",")
            : ""
          field.onChange(values)
        }}
        placeholder="請選擇影片類型"
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "40px",
            border: "1px solid white",
            borderRadius: "8px",
            boxShadow: "none",
            "&:hover": {
              border: "1px solid white",
            },
          }),
          valueContainer: (base) => ({
            ...base,
            gap: "8px",
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: "#5365AC",
            borderRadius: "8px",
            margin: 0,
            marginRight: "8px",
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "white",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            fontWeight: "normal",
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: "white",
            "&:hover": {
              backgroundColor: "#4a5a9a",
              color: "white",
            },
          }),
          placeholder: (base) => ({
            ...base,
            color: "#9CA3AF",
          }),
        }}
      />
      {error && <span className="text-red-500">{error}</span>}
    </div>
  )
}

export default FilmTypeSelect
