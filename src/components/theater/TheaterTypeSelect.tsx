import { useState } from "react"
import { ChevronDown } from "lucide-react"

type TheaterTypeSelectProps = {
  value: string
  onChange: (value: string) => void
}

const TheaterTypeSelect = ({ value, onChange }: TheaterTypeSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <span id="theater-type-label" className="text-base font-normal">
        類型
      </span>
      <div className="relative">
        <button
          type="button"
          id="theaterType"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby="theater-type-label"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-[194px] cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-[10.5px] text-left"
        >
          <span>{value}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {isOpen && (
          <>
            <div
              role="button"
              tabIndex={0}
              aria-label="Close dropdown"
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setIsOpen(false)
              }}
            />
            <ul
              role="listbox"
              aria-labelledby="theater-type-label"
              className="absolute z-20 w-[194px] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg"
            >
              {["一般數位", "IMAX", "4DX"].map((type) => (
                <li
                  key={type}
                  role="option"
                  aria-selected={value === type}
                  tabIndex={0}
                  onClick={() => {
                    onChange(type)
                    setIsOpen(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onChange(type)
                      setIsOpen(false)
                    }
                  }}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  {type}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export default TheaterTypeSelect
