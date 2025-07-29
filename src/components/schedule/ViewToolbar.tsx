import { Button } from "@/components/ui/button"
import { FileSpreadsheet, FileImage, ChevronDown, Palette } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { ScheduleSettings } from "@/types/schedule"

interface ViewToolbarProps {
  hasScheduleData: boolean
  settings: ScheduleSettings
  showShiftColors: boolean
  onToggleShiftColors: () => void
  onExportCSV: () => void
  onExportImage: () => void
}

export const ViewToolbar = ({
  hasScheduleData,
  settings,
  showShiftColors,
  onToggleShiftColors,
  onExportCSV,
  onExportImage,
}: ViewToolbarProps) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const t = useTranslations()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowExportDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="flex items-center gap-2">
      {/* Shift Colors Toggle - only for multi-shift schedules */}
      {settings.shiftsPerDay > 1 && (
        <Button
          variant={showShiftColors ? "default" : "outline"}
          size="sm"
          onClick={onToggleShiftColors}
          className="flex items-center gap-2"
          title={
            showShiftColors
              ? t("scheduleView.hideShiftColors")
              : t("scheduleView.showShiftColors")
          }
        >
          <Palette className="w-4 h-4" />
        </Button>
      )}

      {/* Export Options */}
      {hasScheduleData && (
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="flex items-center gap-2"
          >
            {t("schedule.export")}
            <ChevronDown className="w-4 h-4" />
          </Button>
          {showExportDropdown && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  onExportCSV()
                  setShowExportDropdown(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {t("schedule.exportCSV")}
              </button>
              <button
                onClick={() => {
                  onExportImage()
                  setShowExportDropdown(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <FileImage className="w-4 h-4" />
                {t("schedule.exportImage")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
