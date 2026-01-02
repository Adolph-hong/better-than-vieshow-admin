import type { Control, FieldPath, FieldValues } from "react-hook-form"
import { Controller } from "react-hook-form"

interface SwitchComponentProps<T extends FieldValues> {
  label: string
  name: FieldPath<T>
  control: Control<T>
  error?: string
}

const SwitchComponent = <T extends FieldValues>({
  label,
  name,
  control,
  error,
}: SwitchComponentProps<T>) => {
  return (
    <div className="font-family-inter flex flex-col gap-2 text-sm font-medium text-[#000000]">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <label
              htmlFor={name}
              className="relative inline-flex h-5 w-9 cursor-pointer items-center"
            >
              <input
                type="checkbox"
                id={name}
                className="peer sr-only"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <div className="peer h-5 w-9 rounded-full border border-gray-300 bg-gray-200 transition-colors duration-200 peer-checked:border-[#5365AC] peer-checked:bg-[#5365AC] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#5365AC] peer-focus:ring-offset-2" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-4" />
            </label>
            <span className="text-sm font-medium">{label}</span>
          </div>
        )}
      />
      {error && <span className="text-red-500">{error}</span>}
    </div>
  )
}

export default SwitchComponent

