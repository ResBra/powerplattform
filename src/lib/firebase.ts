import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  indexedDBLocalPersistence,
  initializeAuth,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// --- SINGLETON SERVICE HOLDER ---
let app: any = null;
let auth: any = null;
let googleProvider: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

const initFirebase = () => {
    if (typeof window === "undefined") return; 
    
    if (!app) {
        try {
            app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            
            // 1. HARDENED AUTH INITIALIZATION
            // On mobile, we MUST use indexedDBLocalPersistence for session reliability
            try {
               auth = getAuth(app);
            } catch (e) {
               auth = initializeAuth(app, {
                 persistence: indexedDBLocalPersistence
               });
            }

            googleProvider = new GoogleAuthProvider();
            
            // 2. FIRESTORE WITH OFFLINE PERSISTENCE (CRITICAL FOR ANDROID)
            db = getFirestore(app);
            if (typeof window !== "undefined") {
              enableIndexedDbPersistence(db).catch((err) => {
                  if (err.code === 'failed-precondition') {
                      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.");
                  } else if (err.code === 'unimplemented') {
                      console.warn("The current browser doesn't support all of the features required to enable persistence");
                  }
              });
            }

            storage = getStorage(app);
            
            isSupported().then(supported => {
                if (supported) analytics = getAnalytics(app);
            });
            
            console.log("✅ FIREBASE SYSTEM ONLINE: Native Android Optimization Active");
        } catch (error) {
            console.error("❌ FIREBASE CRITICAL ERROR:", error);
        }
    }
};

initFirebase();

export { auth, googleProvider, db, storage, analytics, app };
