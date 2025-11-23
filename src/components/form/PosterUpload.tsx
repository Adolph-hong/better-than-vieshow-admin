import { useCallback, useEffect, useMemo, useState } from "react"
import { Image } from "lucide-react"
import { useDropzone } from "react-dropzone"
import type { DropEvent, FileRejection } from "react-dropzone"

interface PosterUploadProps {
  label: string
  placeholder: string
  accept?: string[]
  existingImageUrl?: string | null
  onChange?: (file: File | null, event?: DropEvent) => void
}

const PosterUpload = ({
  label,
  placeholder,
  accept = ["image/jpeg", "image/png"],
  existingImageUrl,
  onChange,
}: PosterUploadProps) => {
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
      if (fileRejections.length > 0) {
        alert("檔案格式不正確，只能上傳 JPG / PNG")
        return
      }

      const firstFile = acceptedFiles[0] ?? null
      setFile(firstFile)
      onChange?.(firstFile, event)
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: accept.reduce<Record<string, string[]>>((acc, type) => {
      acc[type] = []
      return acc
    }, {}),
  })

  const previewUrl = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file)
    }

    if (existingImageUrl && existingImageUrl.trim() !== "") {
      return existingImageUrl
    }
    return null
  }, [file, existingImageUrl])

  useEffect(() => {
    if (!file) {
      return undefined
    }
    const blobUrl = URL.createObjectURL(file)
    return () => URL.revokeObjectURL(blobUrl)
  }, [file])

  const getContainerClassName = () => {
    if (previewUrl) {
      return "cursor-default border-transparent"
    }
    if (isDragActive) {
      return "cursor-pointer border-blue-500 bg-blue-50 text-blue-600"
    }
    return "cursor-pointer border-dashed border-[#d8d8d8] bg-white text-gray-700"
  }

  return (
    <div className="font-family-inter flex flex-col gap-2 text-sm font-medium text-[#000000]">
      <span>{label}</span>

      <div
        {...(previewUrl ? {} : getRootProps())}
        className={`flex w-full max-w-[564px] items-center justify-center rounded-[10px] border-2 ${getContainerClassName()}`}
      >
        {!previewUrl && <input {...getInputProps()} />}
        {previewUrl ? (
          <div className="relative flex w-full items-center justify-center rounded-[10px] bg-gray-50">
            <img
              src={previewUrl}
              alt="poster preview"
              className="w-full rounded-[10px]"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
            <div className="absolute inset-0 flex justify-center rounded-[10px] bg-white/40">
              <button
                type="button"
                className="body-medium absolute top-[60px] cursor-pointer rounded-[10px] bg-white px-6 py-4 text-[#000000]"
                onClick={(e) => {
                  e.stopPropagation()
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = accept.join(",")
                  input.onchange = (event) => {
                    const target = event.target as HTMLInputElement
                    const selectedFile = target.files?.[0] ?? null
                    if (selectedFile) {
                      setFile(selectedFile)
                      onChange?.(selectedFile)
                    }
                  }
                  input.click()
                }}
              >
                選擇其他照片
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[160px] w-full flex-col items-center justify-center gap-3">
            <Image size={40} className="text-[#CCCCCC]" />
            <div className="font-family-inter font-bold text-[#000000]">
              <span className="text-[#7B9BD1]">Upload</span> or drag and drop an image
            </div>
            <div className="font-family-inter text-regular text-[#666666]">{placeholder}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PosterUpload
