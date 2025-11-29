import {
  loadUserSchedules,
  saveSchedule,
  saveUserSettings,
} from "@/services/firestoreAPI"
import { ScheduleItem, ScheduleSettings } from "@/types/schedule"
import { toast } from "sonner"

/**
 * Check if localStorage has schedule data
 */
export function hasLocalStorageData(): boolean {
  try {
    const data = localStorage.getItem("scheduleData")
    if (!data) return false

    const parsed = JSON.parse(data)
    return Array.isArray(parsed.schedules) && parsed.schedules.length > 0
  } catch {
    return false
  }
}

/**
 * Perform automatic migration on first login
 */
export async function performAutoMigration(userId: string): Promise<{
  migrated: boolean
  scheduleCount: number
  error?: string
}> {
  try {
    if (!hasLocalStorageData()) {
      return { migrated: false, scheduleCount: 0 }
    }

    const existingSchedules = await loadUserSchedules(userId)
    if (existingSchedules.length > 0) {
      console.log("User already has Firestore data, skipping migration")
      return { migrated: false, scheduleCount: 0 }
    }

    const localData = localStorage.getItem("scheduleData")
    if (!localData) {
      return { migrated: false, scheduleCount: 0 }
    }

    const parsedData = JSON.parse(localData)
    const localSchedules: ScheduleItem[] = parsedData.schedules || []
    const localSettings: ScheduleSettings = parsedData.settings

    console.log(
      `Migrating ${localSchedules.length} schedules from localStorage to Firestore`
    )

    for (const schedule of localSchedules) {
      await saveSchedule(userId, {
        ...schedule,
        id: "new",
      })
    }

    if (localSettings) {
      await saveUserSettings(userId, {
        locale: "zh-TW",
        preferences: {},
        scheduleSettings: localSettings,
      })
    }

    toast.success(`成功將 ${localSchedules.length} 個班表同步到雲端！`, {
      description: "您的資料現在已安全地儲存在雲端",
    })

    return {
      migrated: true,
      scheduleCount: localSchedules.length,
    }
  } catch (error) {
    console.error("Auto-migration failed:", error)
    toast.error("資料同步失敗", {
      description: "請稍後再試，或聯繫技術支援",
    })

    return {
      migrated: false,
      scheduleCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Clear localStorage after successful migration (Option A)
 */
export function clearLocalStorageAfterMigration() {
  try {
    // Keep a backup flag to prevent re-migration
    localStorage.setItem("migrated_to_firestore", "true")
    localStorage.setItem("migration_date", new Date().toISOString())
    localStorage.removeItem("scheduleData")

    console.log("localStorage cleared after successful migration")
  } catch (error) {
    console.error("Failed to clear localStorage:", error)
  }
}

/**
 * Check if user has already migrated (to prevent duplicate migrations)
 */
export function hasAlreadyMigrated(): boolean {
  return localStorage.getItem("migrated_to_firestore") === "true"
}
