import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Controller } from "react-hook-form"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

interface Option {
  label: string
  value: string
}

interface CustomSelectProps<T extends FieldValues> {
  label: string
  placeholder?: string
  name: FieldPath<T>
  control: Control<T>
  error?: string
  options: Option[]
}

const CustomSelect = <T extends FieldValues>({
  label,
  placeholder,
  name,
  control,
  error,
  options,
}: CustomSelectProps<T>) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="font-family-inter relative flex flex-col gap-2 text-sm font-medium text-[#000000]">
      <label htmlFor={name}>{label}</label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selected = options.find((o) => o.value === field.value)
          return (
            <div className="relative">
              <button
                type="button"
                id={name}
                className="h-10 w-full cursor-pointer rounded-lg border border-white bg-white px-3 text-left text-gray-900"
                onClick={() => setOpen((v) => !v)}
              >
                {selected ? selected.label : placeholder || "請選擇"}
              </button>
              <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-gray-900">
                <ChevronDown />
              </span>

              {open && (
                <div
                  className="absolute z-10 mt-2 w-full overflow-hidden rounded-md border border-gray-100 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.12)]"
                  role="listbox"
                >
                  <div className="py-1">
                    {options.map((opt) => {
                      const active = opt.value === field.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={`w-full cursor-pointer px-3 py-2 text-left ${active ? "bg-gray-50 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
                          onClick={() => {
                            field.onChange(opt.value)
                            setOpen(false)
                          }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        }}
      />
      {error && <span>{error}</span>}
      {open && (
        <div className="fixed inset-0 z-5" onClick={() => setOpen(false)} aria-hidden="true" />
      )}
    </div>
  )
}

export default CustomSelect
