import { useState } from "react"
import { EyeClosedIcon, Eye } from "lucide-react"

type LoginFormProps = {
  className?: string
}

const LoginForm = ({ className }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
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
          <div className="relative flex h-[56px] items-center rounded-[10px] border border-[#CCCEE1] px-4">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="輸入密碼"
              className="w-full outline-none placeholder:text-[#A0A1B6]"
            />
            <button
              type="button"
              className="absolute right-4 flex items-center justify-center"
              aria-label="切換顯示密碼"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye /> : <EyeClosedIcon />}
            </button>
          </div>
        </label>

        <label htmlFor="remember" className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="h-[18px] w-[18px] appearance-none rounded-[4px] border border-[#D9D9D9] checked:border-[#D9D9D9]"
          />
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
