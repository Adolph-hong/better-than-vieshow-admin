type TheatersFooterProps = {
  normalSeatCount: number
  accessibleSeatCount: number
  onCreate?: () => void
  createLabel?: string
  isCreateDisabled?: boolean
}

const TheatersFooter = (props: TheatersFooterProps) => {
  const { normalSeatCount, accessibleSeatCount, onCreate, createLabel, isCreateDisabled } = props

  const buttonLabel = createLabel ?? "建立影廳"
  const disabled = isCreateDisabled ?? false

  return (
    <footer className="mt-[309px] h-[88px] w-full border-t border-[#E5E5E5] bg-white">
      <div className="mx-auto flex h-full w-full items-center justify-between">
        <div
          className="ml-6 flex items-center gap-8 text-base font-medium text-[#353642]"
          style={{ marginTop: "34.5px", marginBottom: "34.5px" }}
        >
          <p>
            一般座位：<span className="body-medium">{normalSeatCount}</span>
          </p>
          <p>
            殘障座位：<span className="body-medium">{accessibleSeatCount}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          disabled={disabled}
          className={`body-medium mt-6 mr-6 mb-6 flex h-11 items-center justify-center rounded-[10px] px-4 py-[10.5px] text-white transition-colors ${
            disabled ? "bg-primary-500 opacity-[60%]" : "bg-primary-500 cursor-pointer hover:cursor-pointer"
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </footer>
  )
}

TheatersFooter.defaultProps = {
  onCreate: undefined,
  createLabel: "建立影廳",
  isCreateDisabled: false,
}

export default TheatersFooter
