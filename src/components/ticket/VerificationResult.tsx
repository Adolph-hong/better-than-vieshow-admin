interface VerificationResultProps {
  isSuccess: boolean
}

const VerificationResult = ({ isSuccess }: VerificationResultProps) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center pt-[69px]">
      <div
        className={`pointer-events-auto rounded-[36px] px-6 py-4 ${
          isSuccess ? "bg-white" : "bg-[#BD6565]"
        }`}
      >
        <p
          className={`font-family-inter text-center leading-[16px] font-medium tracking-[-0.5px] ${isSuccess ? "text-[#000000]" : "text-white"}`}
        >
          {isSuccess ? "驗票成功 !" : "驗票失敗 !"}
        </p>
      </div>
    </div>
  )
}

export default VerificationResult
