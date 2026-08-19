import {
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


// =====================================================
// ELEMENTS
// =====================================================

const form =
    document.getElementById("profileForm");

const message =
    document.getElementById("profileMessage");

const saveButton =
    document.getElementById("saveProfile");

const firstNameInput =
    document.getElementById("firstName");

const lastNameInput =
    document.getElementById("lastName");

const phoneInput =
    document.getElementById("phone");

const emailInput =
    document.getElementById("email");

const profileDisplayName =
    document.getElementById("profileDisplayName");

const profileEmail =
    document.getElementById("profileEmail");

const profileAvatar =
    document.getElementById("profileAvatar");

const year =
    document.getElementById("year");


// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "../auth/login.html";

            return;

        }


        if (!user.emailVerified) {

            window.location.href =
                "../auth/verify-email.html";

            return;

        }


        await loadProfile(user);

    }
);


// =====================================================
// LOAD PROFILE
// =====================================================

async function loadProfile(user) {

    try {

        emailInput.value =
            user.email || "";


        profileEmail.textContent =
            user.email || "REVIVE account";


        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const snapshot =
            await getDoc(userRef);


        if (snapshot.exists()) {

            const data =
                snapshot.data();


            firstNameInput.value =
                data.firstName || "";


            lastNameInput.value =
                data.lastName || "";


            phoneInput.value =
                data.phone || "";


            updateProfilePreview(
                data.firstName,
                data.lastName
            );


            return;

        }


        // =============================================
        // CREATE PROFILE IF IT DOESN'T EXIST
        // =============================================

        await setDoc(
            userRef,
            {
                firstName: "",
                lastName: "",
                email:
                    user.email || "",
                phone: "",
                role: "customer",
                emailVerified:
                    user.emailVerified,
                createdAt:
                    serverTimestamp(),
                updatedAt:
                    serverTimestamp()
            }
        );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        showMessage(
            "Unable to load your profile.",
            "error"
        );

    }

}


// =====================================================
// UPDATE PROFILE PREVIEW
// =====================================================

function updateProfilePreview(
    firstName,
    lastName
) {

    const first =
        (firstName || "").trim();

    const last =
        (lastName || "").trim();


    const fullName =
        `${first} ${last}`.trim();


    if (!fullName) {

        profileDisplayName.textContent =
            "My Profile";

        profileAvatar.innerHTML =
            "<span>R</span>";

        return;

    }


    profileDisplayName.textContent =
        fullName;


    profileAvatar.innerHTML = `

        <span>
            ${escapeHTML(
                first.charAt(0).toUpperCase()
            )}
        </span>

    `;

}


// =====================================================
// SAVE PROFILE
// =====================================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const user =
            auth.currentUser;


        if (!user) {

            return;

        }


        const firstName =
            firstNameInput.value.trim();

        const lastName =
            lastNameInput.value.trim();

        const phone =
            phoneInput.value.trim();


        // =============================================
        // VALIDATION
        // =============================================

        if (!firstName || !lastName) {

            showMessage(
                "Please enter your first and last name.",
                "error"
            );

            return;

        }


        try {

            saveButton.disabled =
                true;

            saveButton.innerHTML =
                "Saving...";


            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            // =========================================
            // SAVE FIRESTORE PROFILE
            // =========================================

            await updateDoc(
                userRef,
                {
                    firstName,
                    lastName,
                    phone,
                    emailVerified:
                        user.emailVerified,
                    updatedAt:
                        serverTimestamp()
                }
            );


            // =========================================
            // UPDATE FIREBASE AUTH PROFILE
            // =========================================

            await updateProfile(
                user,
                {
                    displayName:
                        `${firstName} ${lastName}`
                }
            );


            // =========================================
            // UPDATE UI
            // =========================================

            updateProfilePreview(
                firstName,
                lastName
            );


            showMessage(
                "Your profile has been updated successfully.",
                "success"
            );


        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );


            if (
                error.code ===
                "permission-denied"
            ) {

                showMessage(
                    "You don't have permission to update this profile.",
                    "error"
                );

            } else {

                showMessage(
                    "Unable to update your profile. Please try again.",
                    "error"
                );

            }

        } finally {

            saveButton.disabled =
                false;

            saveButton.innerHTML = `

                Save changes

                <span>
                    →
                </span>

            `;

        }

    }
);


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;

    message.className =
        type;


    if (type === "success") {

        setTimeout(
            () => {

                message.textContent =
                    "";

                message.className =
                    "";

            },
            4000
        );

    }

}


// =====================================================
// HTML ESCAPING
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// =====================================================
// YEAR
// =====================================================

if (year) {

    year.textContent =
        new Date().getFullYear();

}