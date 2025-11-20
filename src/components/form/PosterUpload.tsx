import { useCallback, useEffect, useMemo, useState } from "react"
import { Image } from "lucide-react"
import { useDropzone } from "react-dropzone"
import type { DropEvent, FileRejection } from "react-dropzone"

interface PosterUploadProps {
  label: string
  placeholder: string
  accept?: string[]
  onChange?: (file: File | null, event?: DropEvent) => void
}

const PosterUpload = ({
  label,
  placeholder,
  accept = ["image/jpeg", "image/png"],
  onChange,
}: PosterUploadProps) => {
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
      if (fileRejections.length > 0) {
        // eslint-disable-next-line no-alert
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
    if (!file) {
      return null
    }

    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    if (!previewUrl) {
      return undefined
    }
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  return (
    <div className="font-family-inter flex flex-col gap-2 text-sm font-medium text-[#000000]">
      <span>{label}</span>

      <div
        {...getRootProps()}
        className={`flex h-40 w-full cursor-pointer items-center justify-center rounded-[10px] border-2 ${
          isDragActive
            ? "border-blue-500 bg-blue-50 text-blue-600"
            : "border-dashed border-[#d8d8d8] bg-white text-gray-700"
        }`}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-gray-50">
            <img src={previewUrl} alt="poster preview" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
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
