import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsaq8LGjeVMZeCmpNEdMaW4nFs7-v7pZ8",
  authDomain: "citamrongai-ba22a.firebaseapp.com",
  databaseURL: "https://citamrongai-ba22a-default-rtdb.firebaseio.com",
  projectId: "citamrongai-ba22a",
  storageBucket: "citamrongai-ba22a.firebasestorage.app",
  messagingSenderId: "1056970669316",
  appId: "1:1056970669316:web:22da0871e4d0937b622451"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, rtdb, storage, auth };
