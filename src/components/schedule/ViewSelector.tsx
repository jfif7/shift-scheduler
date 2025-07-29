import { Button } from "@/components/ui/button"
import {
  VIEW_CONFIGURATIONS,
  AVAILABLE_VIEWS,
  ScheduleViewType,
} from "@/types/viewTypes"

interface ViewSelectorProps {
  currentView: ScheduleViewType
  onViewChange: (view: ScheduleViewType) => void
}

export const ViewSelector = ({
  currentView,
  onViewChange,
}: ViewSelectorProps) => {
  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
      {AVAILABLE_VIEWS.map((viewType) => {
        const config = VIEW_CONFIGURATIONS[viewType]
        const Icon = config.icon

        return (
          <Button
            key={viewType}
            variant={currentView === viewType ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange(viewType)}
            className="flex items-center gap-2"
            title={config.description}
          >
            <Icon className="w-4 h-4" />
          </Button>
        )
      })}
    </div>
  )
}
