import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "../auth/login.html";
        return;
    }

    if (!user.emailVerified) {
        window.location.href = "../auth/verify-email.html";
    }

});