import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


// =====================================================
// ELEMENTS
// =====================================================

const wishlistContainer =
    document.getElementById("wishlistContainer");

const wishlistMessage =
    document.getElementById("wishlistMessage");

const cartCount =
    document.getElementById("cartCount");

const year =
    document.getElementById("year");


// =====================================================
// STATE
// =====================================================

let currentUser = null;


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


        currentUser = user;

        await loadWishlist();

    }
);


// =====================================================
// LOAD WISHLIST
// =====================================================

async function loadWishlist() {

    if (!currentUser) {
        return;
    }


    try {

        wishlistContainer.innerHTML = `

            <div class="account-loading">

                Loading your wishlist...

            </div>

        `;


        const wishlistRef =
            doc(
                db,
                "wishlists",
                currentUser.uid
            );


        const wishlistSnapshot =
            await getDoc(
                wishlistRef
            );


        if (!wishlistSnapshot.exists()) {

            renderEmptyWishlist();

            return;

        }


        const data =
            wishlistSnapshot.data();


        const items =
            Array.isArray(data.items)
                ? data.items
                : [];


        if (!items.length) {

            renderEmptyWishlist();

            return;

        }


        renderWishlist(items);

    } catch (error) {

        console.error(
            "Wishlist loading error:",
            error
        );


        wishlistContainer.innerHTML = `

            <div class="empty-account-state">

                <div class="empty-account-icon">
                    !
                </div>

                <h3>
                    Unable to load wishlist
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

                <button
                    type="button"
                    class="account-button"
                    id="retryWishlist"
                >
                    Try again
                </button>

            </div>

        `;


        document
            .getElementById("retryWishlist")
            ?.addEventListener(
                "click",
                loadWishlist
            );

    }

}


// =====================================================
// EMPTY WISHLIST
// =====================================================

function renderEmptyWishlist() {

    wishlistContainer.innerHTML = `

        <div class="empty-account-state">

            <div class="empty-account-icon">
                ♡
            </div>

            <h3>
                Your wishlist is empty
            </h3>

            <p>
                Save products you love
                and they'll appear here.
            </p>

            <a
                href="../shop.html"
                class="account-button"
            >
                Explore the shop
            </a>

        </div>

    `;

}


// =====================================================
// RENDER WISHLIST
// =====================================================

function renderWishlist(items) {

    wishlistContainer.innerHTML = `

        <div class="wishlist-grid">

            ${items.map(
                product =>
                    createWishlistCard(product)
            ).join("")}

        </div>

    `;


    document
        .querySelectorAll(".remove-wishlist")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    await removeFromWishlist(
                        button.dataset.id
                    );

                }
            );

        });

}


// =====================================================
// CREATE WISHLIST CARD
// =====================================================

function createWishlistCard(product) {

    const productId =
        product.id || "";

    const productName =
        product.name || "Unnamed product";

    const productImage =
        product.image || "";

    const productCategory =
        product.category || "";

    const productPrice =
        Number(product.price) || 0;


    return `

        <article
            class="wishlist-card"
            data-id="${escapeHTML(productId)}"
        >

            <a
                href="../product.html?id=${encodeURIComponent(productId)}"
                class="wishlist-image"
            >

                ${
                    productImage

                        ? `

                            <img
                                src="${escapeHTML(productImage)}"
                                alt="${escapeHTML(productName)}"
                                loading="lazy"
                            >

                          `

                        : `

                            <div class="wishlist-image-placeholder">
                                ♡
                            </div>

                          `
                }

            </a>


            <div class="wishlist-info">

                ${
                    productCategory

                        ? `

                            <span>
                                ${escapeHTML(productCategory)}
                            </span>

                          `

                        : ""
                }


                <h3>
                    ${escapeHTML(productName)}
                </h3>


                <strong>
                    ${formatPrice(productPrice)}
                </strong>


                <div class="wishlist-actions">

                    <a
                        href="../product.html?id=${encodeURIComponent(productId)}"
                        class="account-button"
                    >
                        View product
                    </a>


                    <button
                        type="button"
                        class="remove-wishlist"
                        data-id="${escapeHTML(productId)}"
                    >
                        Remove
                    </button>

                </div>

            </div>

        </article>

    `;

}


// =====================================================
// REMOVE FROM WISHLIST
// =====================================================

async function removeFromWishlist(productId) {

    if (!currentUser) {
        return;
    }


    try {

        const wishlistRef =
            doc(
                db,
                "wishlists",
                currentUser.uid
            );


        const snapshot =
            await getDoc(
                wishlistRef
            );


        if (!snapshot.exists()) {
            return;
        }


        const data =
            snapshot.data();


        const items =
            Array.isArray(data.items)
                ? data.items
                : [];


        const updatedItems =
            items.filter(
                item =>
                    item.id !== productId
            );


        await setDoc(
            wishlistRef,
            {
                items: updatedItems,

                updatedAt:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        showMessage(
            "Removed from your wishlist.",
            "success"
        );


        await loadWishlist();

    } catch (error) {

        console.error(
            "Remove wishlist error:",
            error
        );


        showMessage(
            "Unable to update your wishlist.",
            "error"
        );

    }

}


// =====================================================
// PRICE FORMATTER
// =====================================================

function formatPrice(price) {

    return new Intl.NumberFormat(
        "en-KE",
        {
            style: "currency",
            currency: "KES",
            maximumFractionDigits: 0
        }
    ).format(
        Number(price) || 0
    );

}


// =====================================================
// CART COUNT
// =====================================================

function updateCartCount() {

    try {

        const cart =
            JSON.parse(
                localStorage.getItem(
                    "reviveCart"
                )
            ) || [];


        const count =
            cart.reduce(
                (total, item) =>
                    total +
                    (Number(item.quantity) || 0),
                0
            );


        if (cartCount) {

            cartCount.textContent =
                count;

        }

    } catch (error) {

        console.error(
            "Cart count error:",
            error
        );

        if (cartCount) {
            cartCount.textContent = "0";
        }

    }

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    message,
    type
) {

    if (!wishlistMessage) {
        return;
    }


    wishlistMessage.textContent =
        message;


    wishlistMessage.className =
        `wishlist-message ${type}`;


    setTimeout(
        () => {

            wishlistMessage.textContent =
                "";

            wishlistMessage.className =
                "wishlist-message";

        },
        3500
    );

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
// PAGE INITIALIZATION
// =====================================================

if (year) {

    year.textContent =
        new Date().getFullYear();

}


updateCartCount();