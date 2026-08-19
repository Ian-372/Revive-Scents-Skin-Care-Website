import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "./firebase-config.js";


const container =
    document.getElementById("productContainer");

const params =
    new URLSearchParams(window.location.search);

const productId =
    params.get("id");


// =====================================================
// FORMAT PRICE
// =====================================================

function formatPrice(price) {

    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0
    }).format(Number(price) || 0);

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// LOAD PRODUCT
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


        const product = {

            id: snapshot.id,

            ...snapshot.data()

        };


        /*
         * Don't allow inactive products
         * to be purchased/viewed directly.
         */

        if (product.active === false) {

            renderNotFound();
            return;

        }


        renderProduct(product);


    } catch (error) {

        console.error(
            "Failed to load product:",
            error
        );


        container.innerHTML = `

            <div class="product-not-found">

                <h1>
                    Something went wrong
                </h1>

                <p>
                    We couldn't load this product.
                    Please try again.
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

    document.title =
        "Product Not Found | REVIVE";


    container.innerHTML = `

        <div class="product-not-found">

            <h1>
                Product not found
            </h1>

            <p>
                Sorry, we couldn't find that
                Revive product.
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

function renderProduct(product) {

    document.title =
        `${product.name} | REVIVE`;


    const stock =
        Number(product.stock) || 0;


    container.innerHTML = `

        <div class="product-detail">


            <!-- IMAGE -->

            <div class="product-detail-image">

                ${
                    product.image

                        ? `
                            <img
                                src="${escapeHTML(product.image)}"
                                alt="${escapeHTML(product.name)}"
                            >
                          `

                        : `
                            <div class="product-image-placeholder">
                                REVIVE
                            </div>
                          `
                }

            </div>


            <!-- INFORMATION -->

            <div class="product-detail-info">


                <span class="eyebrow">

                    ${escapeHTML(
                        product.category || "REVIVE"
                    )}

                </span>


                <h1>

                    ${escapeHTML(
                        product.name ||
                        "Unnamed Product"
                    )}

                </h1>


                <strong class="product-price">

                    ${formatPrice(
                        product.price
                    )}

                </strong>


                <p class="product-description">

                    ${escapeHTML(
                        product.description ||
                        "A Revive care solution."
                    )}

                </p>


                <!-- STOCK -->

                <div class="product-stock">

                    ${
                        stock > 0

                            ? `✓ ${stock} available`

                            : "Out of stock"
                    }

                </div>


                <!-- QUANTITY -->

                <div class="quantity-control">

                    <button
                        type="button"
                        id="decreaseQuantity"
                        ${stock <= 0 ? "disabled" : ""}
                    >
                        −
                    </button>


                    <span id="quantity">
                        1
                    </span>


                    <button
                        type="button"
                        id="increaseQuantity"
                        ${stock <= 0 ? "disabled" : ""}
                    >
                        +
                    </button>

                </div>


                <!-- ADD TO CART -->

                <button
                    type="button"
                    class="btn btn-primary add-to-cart"
                    id="addToCart"
                    ${stock <= 0 ? "disabled" : ""}
                >

                    ${
                        stock > 0
                            ? "Add to Cart →"
                            : "Out of Stock"
                    }

                </button>


                <div
                    class="product-message"
                    id="productMessage"
                ></div>


                <!-- DETAILS -->

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
                                stock > 0
                                    ? "In stock"
                                    : "Out of stock"
                            }

                        </span>

                    </div>


                </div>

            </div>

        </div>

    `;


    setupCart(product);

}


// =====================================================
// CART
// =====================================================

function setupCart(product) {

    let quantity = 1;


    const stock =
        Number(product.stock) || 0;


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


    if (!addButton) return;


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

            if (quantity < stock) {

                quantity++;

                quantityDisplay.textContent =
                    quantity;

            }

        }
    );


    addButton.addEventListener(
        "click",
        () => {

            if (stock <= 0) return;


            let cart =
                JSON.parse(
                    localStorage.getItem(
                        "reviveCart"
                    )
                ) || [];


            const existing =
                cart.find(
                    item =>
                        item.id === product.id
                );


            if (existing) {

                const newQuantity =
                    existing.quantity +
                    quantity;


                if (newQuantity > stock) {

                    message.textContent =
                        `Only ${stock} available.`;

                    message.className =
                        "product-message error";

                    return;

                }


                existing.quantity =
                    newQuantity;

            } else {

                cart.push({

                    id:
                        product.id,

                    name:
                        product.name,

                    price:
                        Number(product.price) || 0,

                    image:
                        product.image || "",

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
                total +
                Number(item.quantity || 0),
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
// FOOTER YEAR
// =====================================================

const year =
    document.getElementById(
        "year"
    );


if (year) {

    year.textContent =
        new Date().getFullYear();

}


// =====================================================
// START
// =====================================================

updateCartCount();

loadProduct();