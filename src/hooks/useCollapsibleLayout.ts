import { useState, useCallback, useEffect } from "react"

interface CollapsibleLayoutState {
  isEmployeePanelCollapsed: boolean
  toggleEmployeePanel: () => void
}

export const useCollapsibleLayout = (): CollapsibleLayoutState => {
  const [isEmployeePanelCollapsed, setIsEmployeePanelCollapsed] =
    useState(false)

  const toggleEmployeePanel = useCallback(() => {
    setIsEmployeePanelCollapsed((prev) => !prev)
  }, [])

  // Keyboard shortcut: Ctrl+B (like VS Code sidebar toggle)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "b") {
        event.preventDefault()
        toggleEmployeePanel()
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [toggleEmployeePanel])

  return {
    isEmployeePanelCollapsed,
    toggleEmployeePanel,
  }
}
