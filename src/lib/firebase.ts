import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBSaL8c-I0tobDRx4eSlAVKfoLnNIlzdfc",
  authDomain: "test-firebase-bfa39.firebaseapp.com",
  projectId: "test-firebase-bfa39",
  storageBucket: "test-firebase-bfa39.firebasestorage.app",
  messagingSenderId: "250642845593",
  appId: "1:250642845593:web:82ad312563c7e34e728d08",
  measurementId: "G-4SMEBB7PLD",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope("email")
googleProvider.addScope("profile")

// Development emulator setup (optional)
if (process.env.NODE_ENV === "development") {
  // connectAuthEmulator(auth, "http://localhost:9099")
  // connectFirestoreEmulator(db, "localhost", 8080)
}

export default app
