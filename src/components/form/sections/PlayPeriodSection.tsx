import { Controller, useWatch } from "react-hook-form"
import DatePicker from "../DatePicker"
import TitleComponent from "../TitleComponent"
import type { MovieFormValues } from "../hooks/useMovieForm"
import type { Control, FieldErrors } from "react-hook-form"

interface PlayPeriodSectionProps {
  control: Control<MovieFormValues>
  errors: FieldErrors<MovieFormValues>
  isEditMode: boolean
}

const PlayPeriodSection = ({ control, errors, isEditMode }: PlayPeriodSectionProps) => {
  const startAt = useWatch({ control, name: "startAt" })
  const endAt = useWatch({ control, name: "endAt" })
  const showRequiredBadge = !isEditMode

  return (
    <section className="flex justify-between border-t border-gray-100 py-6">
      <TitleComponent title="播放區間" description="只有在播放區間內的電影可以被排進時刻標中販售" />
      <div className="flex w-full max-w-141 items-end gap-6">
        <div className="flex-1">
          <Controller
            name="startAt"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="上映日"
                value={field.value}
                onChange={field.onChange}
                error={errors.startAt?.message}
                placeholder="選擇上映日"
                showRequiredBadge={showRequiredBadge}
                isFilled={typeof startAt === "string" && startAt.trim().length > 0}
              />
            )}
          />
        </div>
        <div className="flex-1">
          <Controller
            name="endAt"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="下映日"
                value={field.value}
                onChange={field.onChange}
                error={errors.endAt?.message}
                placeholder="選擇下映日"
                showRequiredBadge={showRequiredBadge}
                isFilled={typeof endAt === "string" && endAt.trim().length > 0}
              />
            )}
          />
        </div>
      </div>
    </section>
  )
}

export default PlayPeriodSection
