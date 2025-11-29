import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ScheduleItem, ScheduleSettings } from "@/types/schedule"

export interface FirestoreScheduleItem extends Omit<ScheduleItem, "createdAt"> {
  userId: string
  createdAt: Timestamp | null // Can be null when using serverTimestamp()
  updatedAt: Timestamp | null // Can be null when using serverTimestamp()
}

export interface FirestoreUserSettings {
  locale: string
  preferences: Record<string, unknown>
  scheduleSettings: ScheduleSettings
}

/**
 * Save user settings to Firestore
 */
export async function saveUserSettings(
  userId: string,
  settings: FirestoreUserSettings
): Promise<void> {
  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, {
    settings,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Load user settings from Firestore
 */
export async function loadUserSettings(
  userId: string
): Promise<FirestoreUserSettings | null> {
  const userRef = doc(db, "users", userId)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const userData = userSnap.data()
    return userData.settings || null
  }

  return null
}

/**
 * Save schedule to Firestore
 */
export async function saveSchedule(
  userId: string,
  schedule: ScheduleItem
): Promise<string> {
  const schedulesRef = collection(db, "schedules")

  const firestoreSchedule: Omit<FirestoreScheduleItem, "id"> = {
    userId,
    name: schedule.name,
    month: schedule.month,
    year: schedule.year,
    employees: schedule.employees,
    constraints: schedule.constraints,
    schedule: schedule.schedule,
    isGenerated: schedule.isGenerated,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  }

  if (schedule.id && schedule.id !== "new") {
    const scheduleRef = doc(db, "schedules", schedule.id)
    const updateData = {
      userId,
      name: schedule.name,
      month: schedule.month,
      year: schedule.year,
      employees: schedule.employees,
      constraints: schedule.constraints,
      schedule: schedule.schedule,
      isGenerated: schedule.isGenerated,
      updatedAt: serverTimestamp() as Timestamp,
    }
    await updateDoc(scheduleRef, updateData)
    return schedule.id
  } else {
    const docRef = await addDoc(schedulesRef, firestoreSchedule)
    return docRef.id
  }
}

/**
 * Load schedules for a user with pagination
 */
export async function loadUserSchedules(
  userId: string,
  limit: number = 20
): Promise<ScheduleItem[]> {
  const schedulesRef = collection(db, "schedules")
  const q = query(schedulesRef, where("userId", "==", userId))

  const querySnapshot = await getDocs(q)

  const schedules = querySnapshot.docs.map((doc) => {
    const data = doc.data() as FirestoreScheduleItem
    return {
      id: doc.id,
      name: data.name,
      month: data.month,
      year: data.year,
      employees: data.employees,
      constraints: data.constraints,
      schedule: data.schedule,
      createdAt: data.createdAt?.toDate() || new Date(),
      isGenerated: data.isGenerated,
    }
  })

  return schedules
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
}

/**
 * Delete a schedule from Firestore
 */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  const scheduleRef = doc(db, "schedules", scheduleId)
  await deleteDoc(scheduleRef)
}

/**
 * Subscribe to real-time updates for user schedules
 */
export function subscribeToUserSchedules(
  userId: string,
  callback: (schedules: ScheduleItem[]) => void
): () => void {
  const schedulesRef = collection(db, "schedules")
  const q = query(schedulesRef, where("userId", "==", userId))

  return onSnapshot(q, (querySnapshot) => {
    const schedules = querySnapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreScheduleItem
      return {
        id: doc.id,
        name: data.name,
        month: data.month,
        year: data.year,
        employees: data.employees,
        constraints: data.constraints,
        schedule: data.schedule,
        createdAt: data.createdAt?.toDate() || new Date(),
        isGenerated: data.isGenerated,
      }
    })

    const sortedSchedules = schedules.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
    callback(sortedSchedules)
  })
}
