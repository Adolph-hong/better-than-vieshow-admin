import { useNavigate } from "react-router-dom"
import { ClipLoader } from "react-spinners"

interface FormActionsProps {
  isEditMode: boolean
  isSubmitting?: boolean
}

const FormActions = ({ isEditMode, isSubmitting = false }: FormActionsProps) => {
  const navigate = useNavigate()

  const getButtonText = () => {
    if (isEditMode) {
      return "更新"
    }
    return "建立電影"
  }

  return (
    <section className="flex justify-end gap-6 border-t border-gray-100 py-6">
      <button
        className="body-medium text-primary-500 border-primary-500 flex cursor-pointer items-center justify-center rounded-[10px] border px-4 py-2.5"
        type="button"
        onClick={() => navigate("/movies")}
        disabled={isSubmitting}
      >
        取消
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`body-medium border-primary-500 bg-primary-500 flex cursor-pointer items-center justify-center rounded-[10px] border px-4 py-2.5 text-white ${
          isSubmitting ? "cursor-not-allowed opacity-70" : ""
        }`}
      >
        {isSubmitting ? <ClipLoader color="#ffffff" size={20} /> : getButtonText()}
      </button>
    </section>
  )
}

export default FormActions
