import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAe9SA7R00Dyn9th-kMHOLcwrHix07ov7Y",
    authDomain: "revive-scents.firebaseapp.com",
    projectId: "revive-scents",
    storageBucket: "revive-scents.firebasestorage.app",
    messagingSenderId: "993547635456",
    appId: "1:993547635456:web:03a9c1df1488650084c1e5"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };