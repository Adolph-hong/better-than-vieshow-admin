import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

interface HeaderProps {
  title: string
  buttonText?: string
  back?: boolean
  backTo?: string
  onClick?: () => void
}

const Header = ({ title, buttonText, onClick, back, backTo }: HeaderProps) => {
  const navigate = useNavigate()

  return (
    <section className="flex items-center justify-between p-6">
      <div className="flex items-center gap-2">
        {back && (
          <button
            className="flex h-10 w-10 items-center justify-center"
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          >
            <ArrowLeft className="cursor-pointer" />
          </button>
        )}

        <span className="header-2 text-gray-700">{title}</span>
      </div>
      {buttonText && (
        <button
          type="button"
          className="bg-primary-500 body-medium flex cursor-pointer rounded-[10px] px-4 py-2.5 text-white"
          onClick={onClick}
        >
          {buttonText}
        </button>
      )}
    </section>
  )
}
export default Header
