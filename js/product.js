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


const container =
    document.getElementById("productContainer");


const params =
    new URLSearchParams(
        window.location.search
    );


const productId =
    params.get("id");


let currentUser = null;
let currentProduct = null;


// =====================================================
// FORMAT PRICE
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
// LOAD PRODUCT FROM FIRESTORE
// =====================================================

async function loadProduct() {

    if (!productId) {

        renderNotFound();

        return;

    }


    try {

        const productRef =
            doc(
                db,
                "products",
                productId
            );


        const snapshot =
            await getDoc(productRef);


        if (!snapshot.exists()) {

            renderNotFound();

            return;

        }


        currentProduct = {
            id: snapshot.id,
            ...snapshot.data()
        };


        if (
            currentProduct.active === false
        ) {

            renderNotFound();

            return;

        }


        renderProduct();


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        container.innerHTML = `

            <div class="product-not-found">

                <h1>
                    Unable to load product
                </h1>

                <p>
                    Please refresh the page
                    and try again.
                </p>

                <a
                    href="shop.html"
                    class="btn btn-primary"
                >
                    Return to Shop
                </a>

            </div>

        `;

    }

}


// =====================================================
// PRODUCT NOT FOUND
// =====================================================

function renderNotFound() {

    container.innerHTML = `

        <div class="product-not-found">

            <h1>
                Product not found
            </h1>

            <p>
                Sorry, we couldn't find
                that REVIVE product.
            </p>

            <a
                href="shop.html"
                class="btn btn-primary"
            >
                Return to Shop
            </a>

        </div>

    `;

}


// =====================================================
// RENDER PRODUCT
// =====================================================

function renderProduct() {

    const product =
        currentProduct;


    document.title =
        `${product.name} | REVIVE`;


    container.innerHTML = `

        <div class="product-detail">


            <div class="product-detail-image">

                <img
                    src="${escapeHTML(
                        product.image || ""
                    )}"
                    alt="${escapeHTML(
                        product.name
                    )}"
                >

            </div>


            <div class="product-detail-info">


                <span class="eyebrow">

                    ${escapeHTML(
                        product.category || ""
                    )}

                </span>


                <h1>

                    ${escapeHTML(
                        product.name
                    )}

                </h1>


                <strong class="product-price">

                    ${formatPrice(
                        product.price
                    )}

                </strong>


                <p class="product-description">

                    ${escapeHTML(
                        product.description || ""
                    )}

                </p>


                <div class="product-stock">

                    ${
                        Number(product.stock) > 0

                            ? `✓ ${Number(product.stock)} available`

                            : `Out of stock`
                    }

                </div>


                <div class="quantity-control">

                    <button
                        type="button"
                        id="decreaseQuantity"
                    >
                        −
                    </button>


                    <span id="quantity">
                        1
                    </span>


                    <button
                        type="button"
                        id="increaseQuantity"
                    >
                        +
                    </button>

                </div>


                <div class="product-actions">


                    <button
                        type="button"
                        class="btn btn-primary add-to-cart"
                        id="addToCart"
                        ${
                            product.stock <= 0
                                ? "disabled"
                                : ""
                        }
                    >

                        Add to Cart →

                    </button>


                    <button
                        type="button"
                        class="wishlist-button"
                        id="wishlistButton"
                    >

                        <span id="wishlistIcon">
                            ♡
                        </span>

                        <span id="wishlistText">
                            Add to Wishlist
                        </span>

                    </button>


                </div>


                <div
                    class="product-message"
                    id="productMessage"
                ></div>


                <div class="product-details">


                    <div>

                        <strong>
                            Category
                        </strong>

                        <span>
                            ${escapeHTML(
                                product.category || "-"
                            )}
                        </span>

                    </div>


                    <div>

                        <strong>
                            Availability
                        </strong>

                        <span>

                            ${
                                Number(product.stock) > 0
                                    ? "In stock"
                                    : "Out of stock"
                            }

                        </span>

                    </div>


                </div>

            </div>

        </div>

    `;


    setupCart();

    setupWishlist();

}


// =====================================================
// CART
// =====================================================

function setupCart() {

    let quantity = 1;


    const quantityDisplay =
        document.getElementById(
            "quantity"
        );


    const decrease =
        document.getElementById(
            "decreaseQuantity"
        );


    const increase =
        document.getElementById(
            "increaseQuantity"
        );


    const addButton =
        document.getElementById(
            "addToCart"
        );


    const message =
        document.getElementById(
            "productMessage"
        );


    decrease.addEventListener(
        "click",
        () => {

            if (quantity > 1) {

                quantity--;

                quantityDisplay.textContent =
                    quantity;

            }

        }
    );


    increase.addEventListener(
        "click",
        () => {

            if (
                quantity <
                Number(currentProduct.stock)
            ) {

                quantity++;

                quantityDisplay.textContent =
                    quantity;

            }

        }
    );


    addButton.addEventListener(
        "click",
        () => {

            let cart =
                JSON.parse(
                    localStorage.getItem(
                        "reviveCart"
                    )
                ) || [];


            const existing =
                cart.find(
                    item =>
                        item.id ===
                        currentProduct.id
                );


            if (existing) {

                const newQuantity =
                    existing.quantity +
                    quantity;


                if (
                    newQuantity >
                    Number(currentProduct.stock)
                ) {

                    message.textContent =
                        "You cannot add more than the available stock.";

                    message.className =
                        "product-message error";

                    return;

                }


                existing.quantity =
                    newQuantity;

            } else {

                cart.push({

                    id:
                        currentProduct.id,

                    name:
                        currentProduct.name,

                    price:
                        currentProduct.price,

                    image:
                        currentProduct.image || "",

                    quantity

                });

            }


            localStorage.setItem(
                "reviveCart",
                JSON.stringify(cart)
            );


            updateCartCount();


            message.textContent =
                "Added to your cart ✓";


            message.className =
                "product-message success";

        }
    );

}


// =====================================================
// WISHLIST
// =====================================================

async function setupWishlist() {

    const button =
        document.getElementById(
            "wishlistButton"
        );


    if (!button) {
        return;
    }


    if (!currentUser) {

        button.addEventListener(
            "click",
            () => {

                window.location.href =
                    "auth/login.html";

            }
        );


        return;

    }


    await updateWishlistButton();


    button.addEventListener(
        "click",
        toggleWishlist
    );

}


// =====================================================
// UPDATE WISHLIST BUTTON
// =====================================================

async function updateWishlistButton() {

    const button =
        document.getElementById(
            "wishlistButton"
        );


    const icon =
        document.getElementById(
            "wishlistIcon"
        );


    const text =
        document.getElementById(
            "wishlistText"
        );


    if (
        !button ||
        !currentUser
    ) {

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


        const exists =
            items.some(
                item =>
                    item.id ===
                    currentProduct.id
            );


        if (exists) {

            button.classList.add(
                "active"
            );

            icon.textContent =
                "♥";

            text.textContent =
                "Remove from Wishlist";

        } else {

            button.classList.remove(
                "active"
            );

            icon.textContent =
                "♡";

            text.textContent =
                "Add to Wishlist";

        }

    } catch (error) {

        console.error(
            "Wishlist check error:",
            error
        );

    }

}


// =====================================================
// TOGGLE WISHLIST
// =====================================================

async function toggleWishlist() {

    if (!currentUser) {

        window.location.href =
            "auth/login.html";

        return;

    }


    const button =
        document.getElementById(
            "wishlistButton"
        );


    const message =
        document.getElementById(
            "productMessage"
        );


    button.disabled = true;


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


        let items = [];


        if (snapshot.exists()) {

            const data =
                snapshot.data();


            items =
                Array.isArray(data.items)
                    ? data.items
                    : [];

        }


        const existingIndex =
            items.findIndex(
                item =>
                    item.id ===
                    currentProduct.id
            );


        if (existingIndex !== -1) {

            items.splice(
                existingIndex,
                1
            );


            message.textContent =
                "Removed from your wishlist.";


            message.className =
                "product-message success";

        } else {

            items.push({

                id:
                    currentProduct.id,

                name:
                    currentProduct.name,

                price:
                    currentProduct.price,

                image:
                    currentProduct.image || "",

                category:
                    currentProduct.category || ""

            });


            message.textContent =
                "Added to your wishlist ♡";


            message.className =
                "product-message success";

        }


        await setDoc(
            wishlistRef,
            {
                items,
                updatedAt:
                    serverTimestamp()
            },
            {
                merge: true
            }
        );


        await updateWishlistButton();


    } catch (error) {

        console.error(
            "Wishlist update error:",
            error
        );


        message.textContent =
            "Unable to update your wishlist.";

        message.className =
            "product-message error";

    } finally {

        button.disabled = false;

    }

}


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        currentUser = user;

        /*
         * If the product has already rendered,
         * refresh the wishlist button.
         */

        if (currentProduct) {

            await setupWishlist();

        }

    }
);


// =====================================================
// CART COUNT
// =====================================================

function updateCartCount() {

    const cart =
        JSON.parse(
            localStorage.getItem(
                "reviveCart"
            )
        ) || [];


    const count =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (cartCount) {

        cartCount.textContent =
            count;

    }

}


// =====================================================
// HTML ESCAPING
// =====================================================

function escapeHTML(value) {

    return String(value)

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
// START
// =====================================================

document.getElementById(
    "year"
).textContent =
    new Date().getFullYear();


updateCartCount();

loadProduct();