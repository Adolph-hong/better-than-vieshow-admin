import { useCallback, startTransition, useState, useEffect } from "react"
import { X } from "lucide-react"
import { useController } from "react-hook-form"
import type { MovieFormValues } from "./hooks/useMovieForm"
import type { Control } from "react-hook-form"

interface TagInputProps {
  label: string
  name: "director" | "actors"
  control: Control<MovieFormValues>
  placeholder?: string
  error?: string
  inputId: string
  showRequiredBadge?: boolean
  isFilled?: boolean
}

const TagInput = ({
  label,
  name,
  control,
  placeholder,
  error,
  inputId,
  showRequiredBadge = false,
  isFilled,
}: TagInputProps) => {
  const { field } = useController({ name, control })
  const fieldValue = typeof field.value === "string" ? field.value : ""
  const [tags, setTags] = useState<string[]>(
    fieldValue
      ? fieldValue
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
      : []
  )
  const [inputValue, setInputValue] = useState<string>("")
  const [isComposing, setIsComposing] = useState<boolean>(false)

  useEffect(() => {
    const newFieldValue = typeof field.value === "string" ? field.value : ""
    const newTags = newFieldValue
      ? newFieldValue
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
      : []
    setTags(newTags)
  }, [field.value])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // 如果正在輸入中文（輸入法組合中），不處理 Enter 鍵
      if (e.key === "Enter" && !isComposing && !e.nativeEvent.isComposing) {
        e.preventDefault()
        const inputElement = e.currentTarget
        const trimmedValue = inputElement.value.trim()
        if (trimmedValue && !tags.includes(trimmedValue)) {
          const newTags = [...tags, trimmedValue]
          const tagValue = newTags.join(",")
          inputElement.value = ""
          setInputValue("")
          startTransition(() => {
            setTags(newTags)
            field.onChange(tagValue)
          })
        }
      } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
        // 當輸入框為空且按下 Backspace 時，刪除最後一個標籤
        e.preventDefault()
        const newTags = tags.slice(0, -1)
        const tagValue = newTags.join(",")
        setTags(newTags)
        field.onChange(tagValue)
      }
    },
    [tags, field, inputValue, isComposing]
  )

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true)
  }, [])

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false)
  }, [])

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const newTags = tags.filter((tag) => tag !== tagToRemove)
      const tagValue = newTags.join(",")
      setTags(newTags)
      field.onChange(tagValue)
    },
    [tags, field]
  )

  const handleBlur = useCallback(() => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !tags.includes(trimmedValue)) {
      const newTags = [...tags, trimmedValue]
      const tagValue = newTags.join(",")
      setInputValue("")
      startTransition(() => {
        setTags(newTags)
        field.onChange(tagValue)
      })
    } else if (trimmedValue) {
      // 如果已經存在，清空輸入框
      setInputValue("")
    }
  }, [inputValue, tags, field])

  const isFieldFilled = typeof isFilled === "boolean" ? isFilled : tags.length > 0
  const shouldShowRequired = showRequiredBadge && !isFieldFilled

  return (
    <div className="font-family-inter flex flex-col gap-2 text-sm font-medium text-[#000000]">
      <span className="flex items-center gap-2">
        <span>{label}</span>
        {shouldShowRequired && (
          <span className="body-small rounded-full bg-[#FFF0F0] px-2 py-0.5 text-[10px] text-[#E54848]">
            必填
          </span>
        )}
      </span>
      <input type="hidden" {...field} value={fieldValue} />
      <label
        htmlFor={inputId}
        className="flex min-h-11.5 cursor-text flex-wrap items-center gap-2 rounded-lg border border-white bg-white p-2"
      >
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex h-7 items-center gap-1 rounded-lg bg-[#5365AC] pr-1 pl-2 text-white"
          >
            <span className="font-family-inter text-sm font-normal">{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="flex items-center justify-center rounded hover:bg-blue-600"
              aria-label={`移除 ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <input
          id={inputId}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 border-none bg-transparent text-gray-900 outline-none"
          autoComplete="off"
        />
      </label>
      {error && <span className="text-red-500">{error}</span>}
    </div>
  )
}

export default TagInput
