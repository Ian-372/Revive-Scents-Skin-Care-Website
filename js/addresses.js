import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
    auth,
    db
} from "./firebase-config.js";


// =====================================================
// ELEMENTS
// =====================================================

const addressesList =
    document.getElementById("addressesList");

const addressModal =
    document.getElementById("addressModal");

const addressForm =
    document.getElementById("addressForm");

const addAddressButton =
    document.getElementById("addAddressButton");

const closeAddressModal =
    document.getElementById("closeAddressModal");

const cancelAddress =
    document.getElementById("cancelAddress");

const modalOverlay =
    document.getElementById("modalOverlay");

const modalTitle =
    document.getElementById("addressModalTitle");

const saveAddressButton =
    document.getElementById("saveAddressButton");

const addressMessage =
    document.getElementById("addressMessage");


// =====================================================
// FORM ELEMENTS
// =====================================================

const addressId =
    document.getElementById("addressId");

const addressLabel =
    document.getElementById("addressLabel");

const recipientFirstName =
    document.getElementById("recipientFirstName");

const recipientLastName =
    document.getElementById("recipientLastName");

const recipientPhone =
    document.getElementById("recipientPhone");

const county =
    document.getElementById("county");

const town =
    document.getElementById("town");

const area =
    document.getElementById("area");

const building =
    document.getElementById("building");

const deliveryNote =
    document.getElementById("deliveryNote");

const isDefault =
    document.getElementById("isDefault");


let currentUser = null;
let addresses = [];


// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(auth, async (user) => {

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


    currentUser = user;

    await loadAddresses();

});


// =====================================================
// LOAD ADDRESSES
// =====================================================

async function loadAddresses() {

    if (!currentUser) return;

    try {

        addressesList.innerHTML = `

            <div class="addresses-loading">

                <div class="loading-circle"></div>

                <p>
                    Loading your addresses...
                </p>

            </div>

        `;


        const addressesRef =
            collection(
                db,
                "addresses"
            );


        /*
         * IMPORTANT:
         *
         * Only request addresses belonging
         * to the currently authenticated user.
         */

        const addressQuery =
            query(
                addressesRef,

                where(
                    "userId",
                    "==",
                    currentUser.uid
                ),

                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                addressQuery
            );


        addresses = [];


        snapshot.forEach(
            (addressDoc) => {

                addresses.push({

                    id:
                        addressDoc.id,

                    ...addressDoc.data()

                });

            }
        );


        renderAddresses();


    } catch (error) {

        console.error(
            "Failed to load addresses:",
            error
        );


        addressesList.innerHTML = `

            <div class="empty-addresses">

                <div class="empty-icon">
                    !
                </div>

                <h2>
                    Couldn't load addresses
                </h2>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }

}


// =====================================================
// RENDER ADDRESSES
// =====================================================

function renderAddresses() {

    if (!addresses.length) {

        addressesList.innerHTML = `

            <div class="empty-addresses">

                <div class="empty-heart">
                    ♡
                </div>

                <span class="eyebrow">
                    YOUR DELIVERY BOOK
                </span>

                <h2>
                    No addresses yet.
                </h2>

                <p>
                    Add your first delivery address and
                    make your next REVIVE order easier.
                </p>

                <button
                    type="button"
                    class="empty-add-button"
                    id="emptyAddAddress"
                >
                    + Add your first address
                </button>

            </div>

        `;


        document
            .getElementById("emptyAddAddress")
            ?.addEventListener(
                "click",
                openAddModal
            );


        return;

    }


    addressesList.innerHTML =
        addresses
            .map(
                address =>
                    createAddressCard(address)
            )
            .join("");


    attachAddressActions();

}


// =====================================================
// ADDRESS CARD
// =====================================================

function createAddressCard(address) {

    const fullName =
        `${address.recipientFirstName || ""} ${address.recipientLastName || ""}`
            .trim();


    return `

        <article
            class="
                address-card
                ${address.isDefault ? "default-address" : ""}
            "
            data-id="${escapeHTML(address.id)}"
        >

            <div class="address-card-top">

                <div class="address-label">

                    <span class="address-icon">
                        ${getAddressIcon(address.label)}
                    </span>

                    <div>

                        <strong>
                            ${escapeHTML(
        address.label || "Address"
    )}
                        </strong>

                        ${address.isDefault
            ? `
                                    <span class="default-badge">
                                        DEFAULT
                                    </span>
                                `
            : ""
        }

                    </div>

                </div>


                <div class="address-actions">

                    <button
                        type="button"
                        class="edit-address"
                        data-id="${escapeHTML(address.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-address"
                        data-id="${escapeHTML(address.id)}"
                    >
                        Delete
                    </button>

                </div>

            </div>


            <div class="address-card-body">

                <strong class="recipient-name">
                    ${escapeHTML(fullName)}
                </strong>

                <p>
                    ${escapeHTML(
            address.area || ""
        )}
                    ${address.building
            ? `, ${escapeHTML(address.building)}`
            : ""
        }
                </p>

                <p>
                    ${escapeHTML(
            address.town || ""
        )},
                    ${escapeHTML(
            address.county || ""
        )}
                </p>

                <p class="recipient-phone">
                    ${escapeHTML(
            address.recipientPhone || ""
        )}
                </p>

                ${address.deliveryNote
            ? `
                            <div class="delivery-note">
                                <span>Note</span>
                                ${escapeHTML(
                address.deliveryNote
            )}
                            </div>
                        `
            : ""
        }

            </div>


            ${!address.isDefault
            ? `
                        <div class="address-card-footer">

                            <button
                                type="button"
                                class="make-default"
                                data-id="${escapeHTML(address.id)}"
                            >
                                Make default
                            </button>

                        </div>
                    `
            : ""
        }

        </article>

    `;

}


// =====================================================
// ADDRESS ICON
// =====================================================

function getAddressIcon(label) {

    const value =
        String(label || "").toLowerCase();


    if (value.includes("work")) {
        return "▣";
    }


    if (value.includes("campus")) {
        return "⌂";
    }


    return "♡";

}


// =====================================================
// ATTACH ACTIONS
// =====================================================

function attachAddressActions() {

    document
        .querySelectorAll(".edit-address")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    openEditModal(id);

                }
            );

        });


    document
        .querySelectorAll(".delete-address")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteAddress(
                        button.dataset.id
                    );

                }
            );

        });


    document
        .querySelectorAll(".make-default")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    setDefaultAddress(
                        button.dataset.id
                    );

                }
            );

        });

}


// =====================================================
// OPEN ADD MODAL
// =====================================================

function openAddModal() {

    addressForm.reset();

    addressId.value = "";

    modalTitle.textContent =
        "Add an address";

    saveAddressButton.innerHTML =
        `Save address <span>→</span>`;

    openModal();

}


// =====================================================
// OPEN EDIT MODAL
// =====================================================

function openEditModal(id) {

    const address =
        addresses.find(
            item => item.id === id
        );


    if (!address) return;


    addressId.value =
        address.id;

    addressLabel.value =
        address.label || "";

    recipientFirstName.value =
        address.recipientFirstName || "";

    recipientLastName.value =
        address.recipientLastName || "";

    recipientPhone.value =
        address.recipientPhone || "";

    county.value =
        address.county || "";

    town.value =
        address.town || "";

    area.value =
        address.area || "";

    building.value =
        address.building || "";

    deliveryNote.value =
        address.deliveryNote || "";

    isDefault.checked =
        address.isDefault === true;


    modalTitle.textContent =
        "Edit your address";

    saveAddressButton.innerHTML =
        `Update address <span>→</span>`;


    openModal();

}


// =====================================================
// OPEN MODAL
// =====================================================

function openModal() {

    addressModal.classList.add(
        "open"
    );

    addressModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );


    setTimeout(() => {

        addressLabel.focus();

    }, 100);

}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeModal() {

    addressModal.classList.remove(
        "open"
    );

    addressModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

}


// =====================================================
// SAVE ADDRESS
// =====================================================

addressForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!currentUser) return;


        const data = {

            userId:
                currentUser.uid,

            label:
                addressLabel.value.trim(),

            recipientFirstName:
                recipientFirstName.value.trim(),

            recipientLastName:
                recipientLastName.value.trim(),

            recipientPhone:
                recipientPhone.value.trim(),

            county:
                county.value.trim(),

            town:
                town.value.trim(),

            area:
                area.value.trim(),

            building:
                building.value.trim(),

            deliveryNote:
                deliveryNote.value.trim(),

            isDefault:
                isDefault.checked,

            updatedAt:
                serverTimestamp()

        };


        try {

            saveAddressButton.disabled =
                true;

            saveAddressButton.innerHTML =
                "Saving...";


            /*
             * If this is the default address,
             * remove default from all existing addresses.
             */

            if (data.isDefault) {

                await removeDefaultFromOthers(
                    addressId.value || null
                );

            }


            if (addressId.value) {

                // EDIT

                const addressRef =
                    doc(
                        db,
                        "addresses",
                        addressId.value
                    );


                await updateDoc(
                    addressRef,
                    data
                );


                showMessage(
                    "Address updated successfully.",
                    "success"
                );


            } else {

                // CREATE

                data.createdAt =
                    serverTimestamp();


                await addDoc(
                    collection(
                        db,
                        "addresses"
                    ),
                    data
                );


                showMessage(
                    "Address added successfully.",
                    "success"
                );

            }


            closeModal();

            await loadAddresses();


        } catch (error) {

            console.error(
                "Address save error:",
                error
            );


            showMessage(
                "Unable to save this address. Please try again.",
                "error"
            );

        } finally {

            saveAddressButton.disabled =
                false;

            saveAddressButton.innerHTML =
                addressId.value
                    ? `Update address <span>→</span>`
                    : `Save address <span>→</span>`;

        }

    }
);


// =====================================================
// REMOVE OTHER DEFAULTS
// =====================================================

async function removeDefaultFromOthers(
    currentAddressId
) {

    const updates =
        addresses
            .filter(
                address =>
                    address.isDefault === true &&
                    address.id !== currentAddressId
            )
            .map(
                address =>
                    updateDoc(
                        doc(
                            db,
                            "addresses",
                            address.id
                        ),
                        {
                            isDefault: false,
                            updatedAt:
                                serverTimestamp()
                        }
                    )
            );


    await Promise.all(
        updates
    );

}


// =====================================================
// SET DEFAULT
// =====================================================

async function setDefaultAddress(id) {

    try {

        const address =
            addresses.find(
                item => item.id === id
            );


        if (!address) return;


        await removeDefaultFromOthers(
            id
        );


        await updateDoc(
            doc(
                db,
                "addresses",
                id
            ),
            {
                isDefault: true,
                updatedAt:
                    serverTimestamp()
            }
        );


        showMessage(
            "Default address updated.",
            "success"
        );


        await loadAddresses();


    } catch (error) {

        console.error(
            "Default address error:",
            error
        );


        showMessage(
            "Unable to change your default address.",
            "error"
        );

    }

}


// =====================================================
// DELETE
// =====================================================

async function deleteAddress(id) {

    const address =
        addresses.find(
            item => item.id === id
        );


    if (!address) return;


    const confirmed =
        window.confirm(
            `Delete "${address.label || "this address"}"?`
        );


    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(
                db,
                "addresses",
                id
            )
        );


        showMessage(
            "Address deleted.",
            "success"
        );


        await loadAddresses();


    } catch (error) {

        console.error(
            "Delete address error:",
            error
        );


        showMessage(
            "Unable to delete this address.",
            "error"
        );

    }

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    text,
    type
) {

    addressMessage.textContent =
        text;

    addressMessage.className =
        `address-message ${type}`;


    setTimeout(() => {

        addressMessage.textContent =
            "";

        addressMessage.className =
            "address-message";

    }, 4000);

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value || "")

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
// EVENTS
// =====================================================

addAddressButton.addEventListener(
    "click",
    openAddModal
);

closeAddressModal.addEventListener(
    "click",
    closeModal
);

cancelAddress.addEventListener(
    "click",
    closeModal
);

modalOverlay.addEventListener(
    "click",
    closeModal
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            addressModal.classList.contains("open")
        ) {

            closeModal();

        }

    }
);


// =====================================================
// YEAR
// =====================================================

document.getElementById(
    "year"
).textContent =
    new Date().getFullYear();