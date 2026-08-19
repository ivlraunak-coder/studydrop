import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getDatabase, ref, push, set, onValue, remove, update, onDisconnect, get
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAU5lhYGSoZRQGE-Qk1z2OOFwkGfolPOb0",
  authDomain: "studydrop-6af19.firebaseapp.com",
  projectId: "studydrop-6af19",
  storageBucket: "studydrop-6af19.firebasestorage.app",
  messagingSenderId: "216969700185",
  appId: "1:216969700185:web:edb2a8b06573b08bc86248",
  databaseURL: "https://studydrop-6af19-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Expose only the Firebase primitives needed by feature modules.
Object.assign(globalThis, {
  firebaseApp: app,
  auth,
  db,
  getAuth,
  signInAnonymously,
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
  update,
  onDisconnect,
  get
});

export { app, auth, db };
