import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";


/* =====================================================
   REGISTRATION
===================================================== */

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");
const registerButton = document.getElementById("registerButton");


function showRegisterMessage(message, type = "error") {

    if (!registerMessage) return;

    registerMessage.textContent = message;
    registerMessage.className = `form-message ${type}`;
}


if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const firstName =
            document.getElementById("firstName").value.trim();

        const lastName =
            document.getElementById("lastName").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        /* Password validation */

        if (password !== confirmPassword) {

            showRegisterMessage(
                "Passwords do not match."
            );

            return;
        }


        if (password.length < 8) {

            showRegisterMessage(
                "Password must contain at least 8 characters."
            );

            return;
        }


        try {

            registerButton.disabled = true;
            registerButton.textContent =
                "Creating account...";


            /* Create Firebase Authentication account */

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;


            /* Add display name to Firebase Auth */

            await updateProfile(user, {

                displayName:
                    `${firstName} ${lastName}`

            });


            /* Create customer profile in Firestore */

            await setDoc(
                doc(db, "users", user.uid),
                {

                    firstName,
                    lastName,
                    email,
                    phone,

                    role: "customer",

                    emailVerified: false,

                    createdAt: serverTimestamp(),

                    updatedAt: serverTimestamp()

                }
            );


            /* Send verification email */

            await sendEmailVerification(user);


            showRegisterMessage(
                "Account created! Check your email to verify your account.",
                "success"
            );


            registerForm.reset();


            setTimeout(() => {

                window.location.href =
                    "verify-email.html";

            }, 1500);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            let message =
                "Something went wrong. Please try again.";


            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                message =
                    "An account with this email already exists.";

            }


            if (
                error.code ===
                "auth/invalid-email"
            ) {

                message =
                    "Please enter a valid email address.";

            }


            if (
                error.code ===
                "auth/weak-password"
            ) {

                message =
                    "Please choose a stronger password.";

            }


            showRegisterMessage(message);


            registerButton.disabled = false;

            registerButton.textContent =
                "Create Account";

        }

    });

}


/* =====================================================
   LOGIN
===================================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    const loginMessage =
        document.getElementById("loginMessage");

    const loginButton =
        document.getElementById("loginButton");


    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            try {

                loginButton.disabled = true;

                loginButton.textContent =
                    "Logging in...";


                /* Firebase login */

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                console.log(
                    "LOGIN SUCCESS:",
                    user.uid
                );

                console.log(
                    "EMAIL VERIFIED:",
                    user.emailVerified
                );


                /* Require email verification */

                if (!user.emailVerified) {

                    await signOut(auth);


                    loginMessage.textContent =
                        "Please verify your email before logging in.";

                    loginMessage.className =
                        "form-message error";


                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Log In";


                    return;
                }


                /* Successful login */

                loginMessage.textContent =
                    "Login successful. Opening your account...";

                loginMessage.className =
                    "form-message success";


                setTimeout(() => {

                    window.location.replace(
                        "../account/dashboard.html"
                    );

                }, 500);

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                let message =
                    "Unable to log in. Please check your details.";


                if (
                    error.code ===
                    "auth/invalid-credential" ||

                    error.code ===
                    "auth/wrong-password" ||

                    error.code ===
                    "auth/user-not-found"
                ) {

                    message =
                        "Incorrect email or password.";

                }


                if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    message =
                        "Too many attempts. Please try again later.";

                }


                loginMessage.textContent =
                    message;

                loginMessage.className =
                    "form-message error";


                loginButton.disabled = false;

                loginButton.textContent =
                    "Log In";

            }

        }
    );

}