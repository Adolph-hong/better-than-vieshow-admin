import { useNavigate } from "react-router-dom"

interface FormActionsProps {
  isEditMode: boolean
}

const FormActions = ({ isEditMode }: FormActionsProps) => {
  const navigate = useNavigate()

  return (
    <section className="flex justify-end gap-6 border-t border-gray-100 py-6">
      <button
        className="body-medium text-primary-500 border-primary-500 flex cursor-pointer items-center justify-center rounded-[10px] border px-4 py-2.5"
        type="button"
        onClick={() => navigate("/movies")}
      >
        取消
      </button>
      <button
        type="submit"
        className="body-medium border-primary-500 bg-primary-500 flex cursor-pointer items-center justify-center rounded-[10px] border px-4 py-2.5 text-white"
      >
        {isEditMode ? "更新" : "建立電影"}
      </button>
    </section>
  )
}

export default FormActions
