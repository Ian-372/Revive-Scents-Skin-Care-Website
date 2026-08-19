import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    auth
} from "./firebase-config.js";


// =====================================================
// ADMIN CONFIGURATION
// =====================================================

const ADMIN_EMAIL =
    "ianmutuli36@gmail.com";


// =====================================================
// ELEMENTS
// =====================================================

const accessMessage =
    document.getElementById(
        "accessMessage"
    );

const statusIndicator =
    document.getElementById(
        "statusIndicator"
    );

const statusText =
    document.getElementById(
        "statusText"
    );

const enterDashboard =
    document.getElementById(
        "enterDashboard"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


// =====================================================
// YEAR
// =====================================================

document.getElementById(
    "year"
).textContent =
    new Date().getFullYear();


// =====================================================
// STATUS HELPERS
// =====================================================

function setStatus(
    message,
    status,
    indicatorClass = ""
) {

    accessMessage.textContent =
        message;

    statusText.textContent =
        status;

    statusIndicator.className =
        `status-indicator ${indicatorClass}`;

}


// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(
    auth,
    (user) => {

        // =================================================
        // NOT LOGGED IN
        // =================================================

        if (!user) {

            setStatus(
                "Please sign in with your administrator account to continue.",
                "Sign in required",
                "error"
            );

            enterDashboard.disabled =
                false;

            enterDashboard.querySelector(
                "span"
            ).textContent =
                "Go to administrator login";

            logoutButton.hidden =
                true;


            enterDashboard.onclick =
                () => {

                    window.location.href =
                        "../auth/login.html";

                };


            return;

        }


        // =================================================
        // WRONG ACCOUNT
        // =================================================

        if (
            user.email?.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            setStatus(
                "This account does not have administrator access.",
                "Access denied",
                "error"
            );

            enterDashboard.disabled =
                true;

            logoutButton.hidden =
                false;

            return;

        }


        // =================================================
        // EMAIL NOT VERIFIED
        // =================================================

        if (!user.emailVerified) {

            setStatus(
                "Your administrator email must be verified before continuing.",
                "Verification required",
                "error"
            );

            enterDashboard.disabled =
                true;

            logoutButton.hidden =
                false;

            return;

        }


        // =================================================
        // ADMIN VERIFIED
        // =================================================

        setStatus(
            "Your administrator account has been verified.",
            "Access granted",
            "ready"
        );


        enterDashboard.disabled =
            false;

        enterDashboard.querySelector(
            "span"
        ).textContent =
            "Enter dashboard";

        logoutButton.hidden =
            false;


        enterDashboard.onclick =
            () => {

                window.location.href =
                    "dashboard.html";

            };

    }
);


// =====================================================
// LOGOUT
// =====================================================

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            logoutButton.disabled =
                true;

            logoutButton.textContent =
                "Signing out...";


            await signOut(auth);


            window.location.href =
                "../auth/login.html";


        } catch (error) {

            console.error(
                "Admin logout failed:",
                error
            );


            logoutButton.disabled =
                false;

            logoutButton.textContent =
                "Sign out";

        }

    }
);