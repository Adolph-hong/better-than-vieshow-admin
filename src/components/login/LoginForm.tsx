import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { EyeClosedIcon, Eye, CheckIcon } from "lucide-react"
import toast from "react-hot-toast"
import { ClipLoader } from "react-spinners"
import sendAPI from "@/utils/sendAPI"

type LoginFormProps = {
  className?: string
}

const LoginForm = ({ className }: LoginFormProps) => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })
  const [shakeField, setShakeField] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
    // 當用戶開始輸入時，清除該欄位的錯誤
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }))
    }
  }

  const triggerShake = (field: string) => {
    setShakeField(field)
    setTimeout(() => setShakeField(null), 400)
  }

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await sendAPI(`/api/Auth/login`, "POST", formData)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorCode = errorData?.code || errorData?.error
        const errorMessage = errorData?.message || "登入失敗，請稍後再試"

        // 根據錯誤類型設定對應欄位的錯誤訊息
        if (
          errorCode === "EMAIL_NOT_FOUND" ||
          errorMessage.includes("信箱") ||
          errorMessage.includes("email") ||
          errorMessage.includes("用戶不存在")
        ) {
          setErrors((prev) => ({ ...prev, email: "信箱不存在" }))
          triggerShake("email")
        } else if (
          errorCode === "WRONG_PASSWORD" ||
          errorMessage.includes("密碼") ||
          errorMessage.includes("password")
        ) {
          setErrors((prev) => ({ ...prev, password: "密碼錯誤" }))
          triggerShake("password")
        } else {
          // 預設顯示在密碼欄位
          setErrors((prev) => ({ ...prev, password: errorMessage }))
          triggerShake("password")
        }
        return
      }

      const data = await response.json()

      const token = data.token || data.accessToken || data?.data?.token

      if (token) {
        localStorage.setItem("token", token)

        const userName = data.name || data.user?.name || data?.data?.name
        if (userName) {
          localStorage.setItem("user", userName)
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn("後端未回傳 token")
      }

      navigate("/")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("發生未知錯誤")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section
      className={`min-w-[485px] rounded-[10px] bg-white px-12 py-[64.5px] ${className || ""}`}
    >
      <header className="mb-12 flex flex-col items-center gap-3 text-center">
        <h1 className="header-2">歡迎回來</h1>
        <p className="body-medium">
          登入以繼續使用
          <span className="body-medium font-bold text-[#243B97]"> Better Than 威秀</span>
        </p>
      </header>

      <form className="flex flex-col gap-6">
        <label htmlFor="email" className="flex flex-col gap-2">
          <span className="body-medium">信箱</span>
          <div
            className={`flex h-[56px] items-center rounded-[10px] border px-4 ${
              errors.email ? "border-[#D82828]" : "border-[#CCCEE1]"
            } ${shakeField === "email" ? "animate-shake" : ""}`}
          >
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="輸入信箱"
              className="w-full outline-none placeholder:text-[#A0A1B6]"
            />
          </div>
          {errors.email && <span className="text-[#D82828]">{errors.email}</span>}
        </label>

        <label htmlFor="password" className="flex flex-col gap-2">
          <span className="body-medium">密碼</span>
          <div
            className={`relative flex h-[56px] items-center rounded-[10px] border px-4 ${
              errors.password ? "border-[#D82828]" : "border-[#CCCEE1]"
            } ${shakeField === "password" ? "animate-shake" : ""}`}
          >
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="輸入密碼"
              className="w-full outline-none placeholder:text-[#A0A1B6]"
            />
            <button
              type="button"
              className="cursor-pointer"
              aria-label="切換顯示密碼"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye /> : <EyeClosedIcon />}
            </button>
          </div>
          {errors.password && <span className="text-[#D82828]">{errors.password}</span>}
        </label>

        <label htmlFor="remember" className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="hidden"
          />
          <span
            className={`relative flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border ${rememberMe ? "border-[#5365AC] bg-[#5365AC]" : "border-[#D9D9D9]"}`}
          >
            {rememberMe && <CheckIcon className="h-5 w-5 text-white" />}
          </span>
          <span className="text-sm">記住我</span>
        </label>

        <button
          type="submit"
          onClick={handleLogin}
          disabled={isLoading}
          className={`mt-4 flex h-[48px] items-center justify-center rounded-[10px] bg-[#5365AC] font-medium text-white transition ${
            isLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-[#48529a]"
          }`}
        >
          {isLoading ? <ClipLoader color="#ffffff" size={20} /> : "登入"}
        </button>
      </form>
    </section>
  )
}

export default LoginForm
