import logo from "@/assets/icon/Group 6.svg"

type LoginBackgroundProps = {
  className?: string
}

const LoginBackground = ({ className }: LoginBackgroundProps) => {
  return (
    <section className={className}>
      <div className="relative min-h-screen w-full overflow-hidden bg-[#E7E8EF]">
        <header className="relative z-10 flex pt-4 pl-6 text-[#333333]">
          <img src={logo} alt="logo" />
          <div className="flex flex-col items-center gap-1 pt-[10px]">
            <span className="text-base leading-none font-bold">Better Than</span>
            <span className="text-[32px] leading-none font-semibold">威秀</span>
          </div>
        </header>
        <div className="absolute top-1/2 right-[-447px] h-[1160px] w-[1160px] -translate-y-1/2 rounded-full bg-[#5365AC]/35" />
        <div className="absolute top-1/2 right-[-486px] h-[1080px] w-[1080px] -translate-y-1/2 rounded-full bg-[#5365AC]/40" />
        <div className="absolute top-1/2 right-[-529px] h-[1000px] w-[1000px] -translate-y-1/2 rounded-full bg-[#5365AC]/60" />
      </div>
    </section>
  )
}

export default LoginBackground
