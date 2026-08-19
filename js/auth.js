import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";


const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");
const registerButton = document.getElementById("registerButton");


function showMessage(message, type = "error") {
    registerMessage.textContent = message;
    registerMessage.className = `form-message ${type}`;
}


registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;


    if (password !== confirmPassword) {
        showMessage("Passwords do not match.");
        return;
    }


    if (password.length < 8) {
        showMessage("Password must contain at least 8 characters.");
        return;
    }


    try {

        registerButton.disabled = true;
        registerButton.textContent = "Creating account...";


        // Create Firebase Authentication account
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;


        // Add display name to Firebase Auth
        await updateProfile(user, {
            displayName: `${firstName} ${lastName}`
        });


        // Create customer profile in Firestore
        await setDoc(doc(db, "users", user.uid), {

            firstName,
            lastName,
            email,
            phone,

            role: "customer",

            emailVerified: false,

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()

        });


        // Send verification email
        await sendEmailVerification(user);


        showMessage(
            "Account created! Check your email to verify your account.",
            "success"
        );


        registerForm.reset();


        setTimeout(() => {
            window.location.href = "verify-email.html";
        }, 1500);


    } catch (error) {

        console.error("Registration error:", error);

        let message = "Something went wrong. Please try again.";

        if (error.code === "auth/email-already-in-use") {
            message = "An account with this email already exists.";
        }

        if (error.code === "auth/invalid-email") {
            message = "Please enter a valid email address.";
        }

        if (error.code === "auth/weak-password") {
            message = "Please choose a stronger password.";
        }

        showMessage(message);

        registerButton.disabled = false;
        registerButton.textContent = "Create Account";
    }

});

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const loginMessage = document.getElementById("loginMessage");
    const loginButton = document.getElementById("loginButton");

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document
            .getElementById("email")
            .value
            .trim();

        const password =
            document.getElementById("password").value;

        try {

            loginButton.disabled = true;
            loginButton.textContent = "Logging in...";

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            if (!user.emailVerified) {

                await signOut(auth);

                loginMessage.textContent =
                    "Please verify your email before logging in.";

                loginMessage.className =
                    "form-message error";

                loginButton.disabled = false;
                loginButton.textContent = "Log In";

                return;
            }

            window.location.href =
                "../account/dashboard.html";

        } catch (error) {

            console.error("Login error:", error);

            let message =
                "Unable to log in. Please check your details.";

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {
                message = "Incorrect email or password.";
            }

            if (error.code === "auth/too-many-requests") {
                message =
                    "Too many attempts. Please try again later.";
            }

            loginMessage.textContent = message;
            loginMessage.className =
                "form-message error";

            loginButton.disabled = false;
            loginButton.textContent = "Log In";
        }
    });
}