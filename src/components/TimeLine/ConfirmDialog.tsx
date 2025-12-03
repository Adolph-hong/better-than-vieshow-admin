import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  warning?: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  warning,
  onConfirm,
  onCancel,
  confirmText = "確認",
  cancelText = "取消",
}: ConfirmDialogProps) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative z-10 flex w-100 flex-col gap-4 rounded-xl bg-white px-6 py-4">
        {/* 標題 */}
        <h2 className="font-roboto m-auto text-lg font-semibold text-[#000000] uppercase">
          {title}
        </h2>

        {/* 訊息 */}
        <div className="flex flex-col gap-2">
          <p className="font-roboto font-normal text-[#000000] uppercase">{message}</p>

          {/* 警告訊息 */}
          {warning && (
            <div className="flex flex-col gap-3 border-l-4 border-[#CBA418] bg-[#F0E3B5] px-3 py-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 text-[#8E661A]" />
                <span className="font-roboto font-semibold text-[#8E661A] uppercase">警告</span>
              </div>
              <p className="font-roboto text-sm font-normal text-[#A98239]">{warning}</p>
            </div>
          )}
        </div>

        {/* 按鈕 */}
        <div className="flex h-10 justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="font-roboto h-full cursor-pointer rounded-sm bg-[#000000] px-3 text-white"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="font-roboto h-full cursor-pointer rounded-sm border border-[#000000] bg-white px-3 text-[#000000]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
