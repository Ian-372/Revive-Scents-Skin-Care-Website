import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    getDocs,
    addDoc,
    doc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


// =========================================================
// ELEMENTS
// =========================================================

const addressList =
    document.getElementById("addressList");

const checkoutItems =
    document.getElementById("checkoutItems");

const cartItemCount =
    document.getElementById("cartItemCount");

const checkoutSubtotal =
    document.getElementById("checkoutSubtotal");

const checkoutDelivery =
    document.getElementById("checkoutDelivery");

const checkoutTotal =
    document.getElementById("checkoutTotal");

const placeOrderButton =
    document.getElementById("placeOrderButton");

const checkoutMessage =
    document.getElementById("checkoutMessage");

const checkoutEmail =
    document.getElementById("checkoutEmail");

const checkoutPhone =
    document.getElementById("checkoutPhone");

const deliveryNote =
    document.getElementById("deliveryNote");

const mpesaPhone =
    document.getElementById("mpesaPhone");

const addNewAddress =
    document.getElementById("addNewAddress");

const addressModal =
    document.getElementById("addressModal");

const modalOverlay =
    document.getElementById("modalOverlay");

const closeAddressModal =
    document.getElementById("closeAddressModal");

const checkoutAddressForm =
    document.getElementById("checkoutAddressForm");

const saveCheckoutAddress =
    document.getElementById("saveCheckoutAddress");


// =========================================================
// STATE
// =========================================================

let currentUser = null;

let cart = [];

let addresses = [];

let selectedAddressId = null;

let products = [];


// =========================================================
// DELIVERY FEE
// =========================================================

const DELIVERY_FEE = 250;


// =========================================================
// AUTH
// =========================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "auth/login.html";

            return;
        }


        if (!user.emailVerified) {

            window.location.href =
                "auth/verify-email.html";

            return;
        }


        currentUser = user;

        checkoutEmail.value =
            user.email || "";


        try {

            await loadCart();

            await loadAddresses();

            await loadUserProfile();

            updateCheckout();

        } catch (error) {

            console.error(
                "Checkout initialization error:",
                error
            );

            showMessage(
                "Unable to load checkout. Please refresh the page.",
                "error"
            );

        }

    }
);


// =========================================================
// LOAD CART
// =========================================================

async function loadCart() {

    /*
     * We support the cart structure used by the store.
     *
     * Expected localStorage:
     *
     * reviveCart = [
     *   {
     *      id,
     *      name,
     *      price,
     *      quantity,
     *      image
     *   }
     * ]
     */


    const storedCart =
        localStorage.getItem(
            "reviveCart"
        );


    if (!storedCart) {

        cart = [];

        renderCart();

        return;

    }


    try {

        cart =
            JSON.parse(
                storedCart
            );


        if (!Array.isArray(cart)) {

            cart = [];

        }

    } catch {

        cart = [];

    }


    /*
     * Revalidate products against Firestore.
     */

    if (cart.length) {

        await validateCartProducts();

    }


    renderCart();

}


// =========================================================
// VALIDATE PRODUCTS
// =========================================================

async function validateCartProducts() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "products"
            )
        );


    products =
        snapshot.docs.map(
            productDoc => ({

                id:
                    productDoc.id,

                ...productDoc.data()

            })
        );


    cart =
        cart
            .map(item => {

                const product =
                    products.find(
                        product =>
                            product.id ===
                            String(item.id)
                    );


                if (!product) {

                    return null;

                }


                if (
                    product.active === false
                ) {

                    return null;

                }


                return {

                    id:
                        product.id,

                    name:
                        product.name,

                    price:
                        Number(
                            product.price
                        ) || 0,

                    image:
                        product.image || "",

                    quantity:
                        Math.min(
                            Math.max(
                                Number(
                                    item.quantity
                                ) || 1,
                                1
                            ),
                            Number(
                                product.stock
                            ) || 0
                        )

                };

            })
            .filter(Boolean);


    localStorage.setItem(
        "reviveCart",
        JSON.stringify(cart)
    );

}


// =========================================================
// LOAD ADDRESSES
// =========================================================

async function loadAddresses() {

    addressList.innerHTML = `
        <div class="checkout-loading">
            Loading your addresses...
        </div>
    `;


    const snapshot =
        await getDocs(
            collection(
                db,
                "addresses"
            )
        );


    addresses = [];


    snapshot.forEach(
        addressDoc => {

            const data =
                addressDoc.data();


            if (
                data.userId ===
                currentUser.uid
            ) {

                addresses.push({

                    id:
                        addressDoc.id,

                    ...data

                });

            }

        }
    );


    /*
     * Default address first.
     */

    addresses.sort(
        (a, b) =>
            Number(b.isDefault) -
            Number(a.isDefault)
    );


    if (addresses.length) {

        const defaultAddress =
            addresses.find(
                address =>
                    address.isDefault === true
            );


        selectedAddressId =
            defaultAddress
                ? defaultAddress.id
                : addresses[0].id;

    }


    renderAddresses();

}


// =========================================================
// LOAD USER PROFILE
// =========================================================

async function loadUserProfile() {

    const userRef =
        doc(
            db,
            "users",
            currentUser.uid
        );


    const snapshot =
        await getDoc(
            userRef
        );


    if (!snapshot.exists()) {

        return;

    }


    const data =
        snapshot.data();


    checkoutPhone.value =
        data.phone || "";


    if (
        !mpesaPhone.value &&
        data.phone
    ) {

        mpesaPhone.value =
            data.phone;

    }

}


// =========================================================
// RENDER ADDRESSES
// =========================================================

function renderAddresses() {

    if (!addresses.length) {

        addressList.innerHTML = `

            <div class="checkout-loading">

                You don't have a saved delivery address yet.

            </div>

        `;

        return;

    }


    addressList.innerHTML =
        addresses
            .map(
                address =>
                    createAddressHTML(
                        address
                    )
            )
            .join("");


    document
        .querySelectorAll(
            ".checkout-address"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    () => {

                        selectedAddressId =
                            element.dataset.id;

                        renderAddresses();

                        validateCheckout();

                    }
                );

            }
        );

}


// =========================================================
// ADDRESS HTML
// =========================================================

function createAddressHTML(
    address
) {

    const selected =
        address.id ===
        selectedAddressId;


    const name =
        `${address.recipientFirstName || ""} ${address.recipientLastName || ""}`
            .trim();


    return `

        <label
            class="checkout-address ${selected ? "selected" : ""}"
            data-id="${escapeHTML(address.id)}"
        >

            <input
                type="radio"
                name="deliveryAddress"
                ${selected ? "checked" : ""}
            >

            <span class="address-radio"></span>


            <div class="address-details">

                <strong>

                    ${escapeHTML(
                        address.label ||
                        "Address"
                    )}

                    ${
                        address.isDefault
                            ? `
                                <span class="address-default">
                                    DEFAULT
                                </span>
                              `
                            : ""
                    }

                </strong>


                <p>

                    ${escapeHTML(name)}

                    ·

                    ${escapeHTML(
                        address.recipientPhone ||
                        ""
                    )}

                    <br>

                    ${escapeHTML(
                        address.area ||
                        ""
                    )}

                    ${
                        address.building
                            ? `,
                                ${escapeHTML(
                                    address.building
                                )}`
                            : ""
                    }

                    <br>

                    ${escapeHTML(
                        address.town ||
                        ""
                    )},

                    ${escapeHTML(
                        address.county ||
                        ""
                    )}

                </p>

            </div>

        </label>

    `;

}


// =========================================================
// RENDER CART
// =========================================================

function renderCart() {

    if (!cart.length) {

        checkoutItems.innerHTML = `

            <div class="checkout-loading">

                Your bag is empty.

            </div>

        `;

        placeOrderButton.disabled = true;

        cartItemCount.textContent = "0";

        checkoutSubtotal.textContent =
            "KSh 0";

        checkoutDelivery.textContent =
            "KSh 0";

        checkoutTotal.textContent =
            "KSh 0";

        return;

    }


    checkoutItems.innerHTML =
        cart
            .map(
                item =>
                    createCartItemHTML(
                        item
                    )
            )
            .join("");


    const quantity =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity
                ),
            0
        );


    cartItemCount.textContent =
        quantity;

}


// =========================================================
// CART ITEM
// =========================================================

function createCartItemHTML(
    item
) {

    const total =
        Number(item.price) *
        Number(item.quantity);


    return `

        <div class="checkout-item">

            <div class="checkout-item-image">

                ${
                    item.image
                        ? `
                            <img
                                src="${escapeHTML(item.image)}"
                                alt="${escapeHTML(item.name)}"
                            >
                          `
                        : ""
                }

            </div>


            <div class="checkout-item-info">

                <strong>
                    ${escapeHTML(
                        item.name
                    )}
                </strong>

                <span>
                    Qty: ${Number(item.quantity)}
                </span>

            </div>


            <strong class="checkout-item-price">

                KSh
                ${total.toLocaleString()}

            </strong>

        </div>

    `;

}


// =========================================================
// UPDATE CHECKOUT
// =========================================================

function updateCheckout() {

    const subtotal =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                (
                    Number(item.price) *
                    Number(item.quantity)
                ),
            0
        );


    const delivery =
        cart.length
            ? DELIVERY_FEE
            : 0;


    const total =
        subtotal +
        delivery;


    checkoutSubtotal.textContent =
        `KSh ${subtotal.toLocaleString()}`;


    checkoutDelivery.textContent =
        delivery
            ? `KSh ${delivery.toLocaleString()}`
            : "KSh 0";


    checkoutTotal.textContent =
        `KSh ${total.toLocaleString()}`;


    validateCheckout();

}


// =========================================================
// VALIDATE
// =========================================================

function validateCheckout() {

    const selectedPayment =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    const validAddress =
        Boolean(
            selectedAddressId
        );


    const validCart =
        cart.length > 0;


    const validPhone =
        checkoutPhone.value.trim().length > 0;


    const mpesaValid =
        selectedPayment?.value !== "mpesa" ||
        mpesaPhone.value.trim().length > 0;


    placeOrderButton.disabled =
        !(
            validAddress &&
            validCart &&
            validPhone &&
            mpesaValid
        );

}


// =========================================================
// PAYMENT SWITCH
// =========================================================

document
    .querySelectorAll(
        ".payment-method"
    )
    .forEach(
        method => {

            method.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".payment-method"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "selected"
                                )
                        );


                    method.classList.add(
                        "selected"
                    );


                    const input =
                        method.querySelector(
                            "input"
                        );


                    input.checked =
                        true;


                    const mpesaDetails =
                        document.getElementById(
                            "mpesaDetails"
                        );


                    mpesaDetails.style.display =
                        input.value === "mpesa"
                            ? "block"
                            : "none";


                    validateCheckout();

                }
            );

        }
    );


// =========================================================
// INPUT VALIDATION
// =========================================================

[
    checkoutPhone,
    mpesaPhone
].forEach(
    input => {

        input.addEventListener(
            "input",
            validateCheckout
        );

    }
);


// =========================================================
// ADD ADDRESS MODAL
// =========================================================

addNewAddress.addEventListener(
    "click",
    () => {

        addressModal.classList.add(
            "open"
        );

        addressModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }
);


function closeAddressModalWindow() {

    addressModal.classList.remove(
        "open"
    );

    addressModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


closeAddressModal.addEventListener(
    "click",
    closeAddressModalWindow
);


modalOverlay.addEventListener(
    "click",
    closeAddressModalWindow
);


// =========================================================
// SAVE NEW ADDRESS
// =========================================================

checkoutAddressForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        if (!currentUser) return;


        try {

            saveCheckoutAddress.disabled =
                true;

            saveCheckoutAddress.innerHTML =
                "Saving...";


            const newAddress = {

                userId:
                    currentUser.uid,

                label:
                    document
                        .getElementById(
                            "newAddressLabel"
                        )
                        .value
                        .trim(),

                recipientFirstName:
                    document
                        .getElementById(
                            "newAddressFirstName"
                        )
                        .value
                        .trim(),

                recipientLastName:
                    document
                        .getElementById(
                            "newAddressLastName"
                        )
                        .value
                        .trim(),

                recipientPhone:
                    document
                        .getElementById(
                            "newAddressPhone"
                        )
                        .value
                        .trim(),

                county:
                    document
                        .getElementById(
                            "newAddressCounty"
                        )
                        .value
                        .trim(),

                town:
                    document
                        .getElementById(
                            "newAddressTown"
                        )
                        .value
                        .trim(),

                area:
                    document
                        .getElementById(
                            "newAddressArea"
                        )
                        .value
                        .trim(),

                building:
                    document
                        .getElementById(
                            "newAddressBuilding"
                        )
                        .value
                        .trim(),

                isDefault:
                    addresses.length === 0,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            };


            const reference =
                await addDoc(
                    collection(
                        db,
                        "addresses"
                    ),
                    newAddress
                );


            checkoutAddressForm.reset();


            closeAddressModalWindow();


            await loadAddresses();


            selectedAddressId =
                reference.id;


            renderAddresses();


            validateCheckout();


        } catch (error) {

            console.error(
                "Failed to save checkout address:",
                error
            );

            const formMessage =
                document.getElementById(
                    "addressFormMessage"
                );


            formMessage.textContent =
                "Unable to save this address.";

            formMessage.className =
                "checkout-message error";


        } finally {

            saveCheckoutAddress.disabled =
                false;

            saveCheckoutAddress.innerHTML =
                `Save address <span>→</span>`;

        }

    }
);


// =========================================================
// PLACE ORDER
// =========================================================

placeOrderButton.addEventListener(
    "click",
    placeOrder
);


async function placeOrder() {

    if (!currentUser) return;


    if (!selectedAddressId) {

        showMessage(
            "Please select a delivery address.",
            "error"
        );

        return;

    }


    const selectedPayment =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        )?.value;


    if (!selectedPayment) {

        showMessage(
            "Please select a payment method.",
            "error"
        );

        return;

    }


    try {

        placeOrderButton.disabled =
            true;

        placeOrderButton.innerHTML =
            `
                <span>
                    Processing...
                </span>
            `;


        const address =
            addresses.find(
                item =>
                    item.id ===
                    selectedAddressId
            );


        if (!address) {

            throw new Error(
                "Selected address could not be found."
            );

        }


        const subtotal =
            cart.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    (
                        Number(item.price) *
                        Number(item.quantity)
                    ),
                0
            );


        const delivery =
            DELIVERY_FEE;


        const total =
            subtotal +
            delivery;


        /*
         * Re-fetch products immediately before
         * creating the order.
         *
         * This protects the order from stale
         * localStorage prices.
         */

        const latestProducts =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        const productMap =
            new Map();


        latestProducts.forEach(
            productDoc => {

                productMap.set(
                    productDoc.id,
                    productDoc.data()
                );

            }
        );


        const verifiedItems =
            cart.map(
                item => {

                    const product =
                        productMap.get(
                            String(item.id)
                        );


                    if (!product) {

                        throw new Error(
                            `${item.name} is no longer available.`
                        );

                    }


                    if (
                        product.active === false
                    ) {

                        throw new Error(
                            `${product.name} is currently unavailable.`
                        );

                    }


                    const quantity =
                        Number(
                            item.quantity
                        );


                    const stock =
                        Number(
                            product.stock
                        ) || 0;


                    if (
                        quantity > stock
                    ) {

                        throw new Error(
                            `Only ${stock} ${product.name} available.`
                        );

                    }


                    return {

                        productId:
                            String(item.id),

                        name:
                            product.name,

                        price:
                            Number(
                                product.price
                            ) || 0,

                        quantity,

                        image:
                            product.image || ""

                    };

                }
            );


        const verifiedSubtotal =
            verifiedItems.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    (
                        item.price *
                        item.quantity
                    ),
                0
            );


        const orderTotal =
            verifiedSubtotal +
            delivery;


        /*
         * Order document.
         */

        const orderData = {

            userId:
                currentUser.uid,

            customerEmail:
                currentUser.email || "",

            customerPhone:
                checkoutPhone.value.trim(),

            items:
                verifiedItems,

            subtotal:
                verifiedSubtotal,

            deliveryFee:
                delivery,

            total:
                orderTotal,

            deliveryAddress: {

                label:
                    address.label || "",

                recipientFirstName:
                    address.recipientFirstName || "",

                recipientLastName:
                    address.recipientLastName || "",

                recipientPhone:
                    address.recipientPhone || "",

                county:
                    address.county || "",

                town:
                    address.town || "",

                area:
                    address.area || "",

                building:
                    address.building || ""

            },

            deliveryNote:
                deliveryNote.value.trim(),

            paymentMethod:
                selectedPayment,

            paymentStatus:
                "pending",

            orderStatus:
                "pending",

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        };


        const orderReference =
            await addDoc(
                collection(
                    db,
                    "orders"
                ),
                orderData
            );


        /*
         * Clear cart after successful order.
         */

        localStorage.removeItem(
            "reviveCart"
        );


        /*
         * Redirect to order details.
         */

        window.location.href =
            `account/order-details.html?id=${encodeURIComponent(
                orderReference.id
            )}`;


    } catch (error) {

        console.error(
            "Order creation failed:",
            error
        );


        showMessage(
            error.message ||
            "Unable to place your order.",
            "error"
        );


        placeOrderButton.disabled =
            false;

        placeOrderButton.innerHTML =
            `
                <span>
                    Place order
                </span>

                <span>
                    →
                </span>
            `;

    }

}


// =========================================================
// MESSAGE
// =========================================================

function showMessage(
    text,
    type
) {

    checkoutMessage.textContent =
        text;

    checkoutMessage.className =
        `checkout-message ${type}`;

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )

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


// =========================================================
// YEAR
// =========================================================

document.getElementById(
    "year"
).textContent =
    new Date().getFullYear();