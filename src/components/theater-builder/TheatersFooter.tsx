import { ClipLoader } from "react-spinners"

type TheatersFooterProps = {
  normalSeatCount: number
  accessibleSeatCount: number
  onCreate?: () => void
  isCreateDisabled?: boolean
  isLoading?: boolean
}

const TheatersFooter = (props: TheatersFooterProps) => {
  const { normalSeatCount, accessibleSeatCount, onCreate, isCreateDisabled, isLoading } = props

  const disabled = (isCreateDisabled ?? false) || isLoading

  return (
    <>
      <div className="h-[88px]" />
      <footer className="fixed right-0 bottom-0 left-60 z-10 h-[88px] w-auto border-t border-[#E5E5E5] bg-white">
        <div className="mx-auto flex h-full w-full items-center justify-between">
          <dl
            className="ml-6 flex items-center gap-8 text-base font-medium text-gray-700"
            style={{ marginTop: "34.5px", marginBottom: "34.5px" }}
          >
            <div className="flex items-center">
              <dt>一般座位：</dt>
              <dd className="body-medium">{normalSeatCount}</dd>
            </div>
            <div className="flex items-center">
              <dt>殘障座位：</dt>
              <dd className="body-medium">{accessibleSeatCount}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={onCreate}
            disabled={disabled}
            className={`body-medium mt-6 mr-6 mb-6 flex h-11 min-w-[100px] items-center justify-center rounded-[10px] px-4 py-[10.5px] text-white transition-colors ${
              disabled
                ? "bg-primary-500 cursor-not-allowed opacity-60"
                : "bg-primary-500 cursor-pointer hover:cursor-pointer"
            }`}
          >
            {isLoading ? <ClipLoader color="#ffffff" size={20} /> : "建立影廳"}
          </button>
        </div>
      </footer>
    </>
  )
}

TheatersFooter.defaultProps = {
  onCreate: undefined,
  isCreateDisabled: false,
  isLoading: false,
}

export default TheatersFooter
