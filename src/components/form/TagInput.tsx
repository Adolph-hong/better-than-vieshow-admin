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
}

const TagInput = ({ label, name, control, placeholder, error, inputId }: TagInputProps) => {
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
      if (e.key === "Enter") {
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
      }
    },
    [tags, field]
  )

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const newTags = tags.filter((tag) => tag !== tagToRemove)
      const tagValue = newTags.join(",")
      setTags(newTags)
      field.onChange(tagValue)
    },
    [tags, field]
  )

  return (
    <div className="font-family-inter flex flex-col gap-2 text-sm font-medium text-[#000000]">
      <span>{label}</span>
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
