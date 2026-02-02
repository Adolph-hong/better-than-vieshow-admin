import TheaterTypeSelect from "./TheaterTypeSelect"

type TheaterBasicInfoFormProps = {
  name: string
  onNameChange: (value: string) => void
  floor: number | ""
  onFloorChange: (value: number | "") => void
  type: string
  onTypeChange: (value: string) => void
}

const TheaterBasicInfoForm = ({
  name,
  onNameChange,
  floor,
  onFloorChange,
  type,
  onTypeChange,
}: TheaterBasicInfoFormProps) => {
  return (
    <section>
      <h2 className="text-2xl font-bold">基本資訊</h2>
      <div className="mt-4 flex gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="theaterName" className="flex flex-col">
            <span>影廳名稱</span>
            <input
              id="theaterName"
              type="text"
              placeholder="影廳名稱"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              className="mt-2 w-[320px] rounded-lg border border-white bg-white px-3 py-[10.5px] text-gray-700 placeholder:text-[#999999]"
            />
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="floorCount" className="flex flex-col font-normal">
            <span>樓層數</span>
            <input
              id="floorCount"
              type="number"
              min={1}
              placeholder="樓層數"
              value={floor}
              onChange={(e) => {
                const val = e.target.value
                onFloorChange(val === "" ? "" : Number(val))
              }}
              className="mt-2 w-[129px] rounded-lg border border-white bg-white px-3 py-[10.5px] placeholder:text-[#999999]"
            />
          </label>
        </div>
        <TheaterTypeSelect value={type} onChange={onTypeChange} />
      </div>
    </section>
  )
}

export default TheaterBasicInfoForm
