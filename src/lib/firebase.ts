import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const validateConfig = () => {
    const missing = Object.entries(firebaseConfig)
        .filter(([_, value]) => !value)
        .map(([key]) => key);
    
    if (missing.length > 0) {
        console.warn("⚠️ CLOUD WARNING: Missing environment variables:", missing.join(", "));
        return false;
    }
    return true;
};

// --- SINGLETON SERVICE HOLDER ---
let app: any = null;
let auth: any = null;
let googleProvider: any = null;
let db: any = null;
let storage: any = null;

const initFirebase = () => {
    if (!app) {
        try {
            const isConfigValid = validateConfig();
            
            app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            auth = getAuth(app);
            googleProvider = new GoogleAuthProvider();
            db = getFirestore(app);
            storage = getStorage(app);
            
            if (isConfigValid) {
                console.log("🚀 CLOUD ENGINE: Connected to project [" + firebaseConfig.projectId + "]");
            } else {
                console.error("❌ CLOUD ERROR: Firebase initialized with INCOMPLETE configuration.");
            }
        } catch (error) {
            console.error("❌ CLOUD CRITICAL ERROR during initialization:", error);
        }
    }
};

initFirebase();

export { auth, googleProvider, db, storage, app };
