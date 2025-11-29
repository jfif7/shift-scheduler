"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, googleProvider, db } from "@/lib/firebase"
import {
  performAutoMigration,
  hasAlreadyMigrated,
  clearLocalStorageAfterMigration,
} from "@/utils/dataMigration"

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, save/update user data in Firestore
        await saveUserToFirestore(user)
      }
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const saveUserToFirestore = async (user: User) => {
    const userRef = doc(db, "users", user.uid)

    try {
      // Check if user document already exists
      const userSnap = await getDoc(userRef)
      const isNewUser = !userSnap.exists()

      if (userSnap.exists()) {
        // Update last login
        await updateDoc(userRef, {
          lastLogin: new Date(),
          email: user.email,
          name: user.displayName,
          picture: user.photoURL,
        })
      } else {
        // Create new user document
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName,
          picture: user.photoURL,
          createdAt: new Date(),
          lastLogin: new Date(),
          settings: {
            locale: "zh-TW",
            preferences: {},
          },
        })
      }

      // Perform automatic migration on first login
      if (isNewUser && !hasAlreadyMigrated()) {
        console.log(
          "New user detected, checking for localStorage data to migrate..."
        )
        const migrationResult = await performAutoMigration(user.uid)

        if (migrationResult.migrated) {
          console.log(
            `Successfully migrated ${migrationResult.scheduleCount} schedules`
          )
          clearLocalStorageAfterMigration()
        }
      }
    } catch (error) {
      console.error("Error saving user to Firestore:", error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
