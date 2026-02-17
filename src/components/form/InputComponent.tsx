import type { FieldPath, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form"

interface InputComponentProps<T extends FieldValues> {
  label: string
  placeholder?: string
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"]
  register: UseFormRegister<T>
  registerName: FieldPath<T>
  error?: string
  suffix?: string
  as?: "input" | "textarea"
  validation?: RegisterOptions<T, FieldPath<T>>
  showRequiredBadge?: boolean
  isFilled?: boolean
}

const InputComponent = <T extends FieldValues>({
  label,
  placeholder,
  type = "text",
  register,
  registerName,
  error,
  suffix,
  as = "input",
  validation,
  showRequiredBadge = false,
  isFilled = false,
}: InputComponentProps<T>) => {
  const shouldShowRequired = showRequiredBadge && !isFilled

  return (
    <div className="font-family-inter flex flex-col gap-2 text-sm font-medium text-[#000000]">
      <label htmlFor={registerName} className="flex items-center gap-2">
        <span>{label}</span>
        {shouldShowRequired && (
          <span className="body-small rounded-full bg-[#FFF0F0] px-2 py-0.5 text-[10px] text-[#E54848]">
            必填
          </span>
        )}
      </label>
      <div className="relative">
        {as === "textarea" ? (
          <textarea
            className={`h-[118px] w-full rounded-lg border border-white bg-white p-3 pr-${suffix ? "[52px]" : "3"} resize-none text-gray-900`}
            id={registerName}
            placeholder={placeholder}
            {...register(registerName, validation)}
          />
        ) : (
          <input
            id={registerName}
            placeholder={placeholder}
            className={`h-10 w-full rounded-lg border border-white bg-white px-3 pr-${suffix ? "[52px]" : "3"} text-gray-900`}
            type={type}
            {...register(registerName, validation)}
          />
        )}

        {suffix && (
          <span className="font-family-inter text-regular pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-900">
            {suffix}
          </span>
        )}
      </div>
      {error && <span>{error}</span>}
    </div>
  )
}

export default InputComponent
