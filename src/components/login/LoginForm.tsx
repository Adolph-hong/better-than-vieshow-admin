import { useState } from "react"
import { EyeClosedIcon, Eye, CheckIcon } from "lucide-react"

type LoginFormProps = {
  className?: string
}

const LoginForm = ({ className }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
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
          <div className="flex h-[56px] items-center rounded-[10px] border border-[#CCCEE1] px-4">
            <input
              id="email"
              type="email"
              placeholder="輸入信箱"
              className="w-full outline-none placeholder:text-[#A0A1B6]"
            />
          </div>
        </label>

        <label htmlFor="password" className="flex flex-col gap-2">
          <span className="body-medium">密碼</span>
          <div className="relative flex h-[56px] rounded-[10px] border border-[#CCCEE1] px-4">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
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
          className="mt-4 h-[48px] cursor-pointer rounded-[10px] bg-[#5365AC] font-medium text-white transition hover:bg-[#48529a]"
        >
          登入
        </button>
      </form>
    </section>
  )
}

export default LoginForm
