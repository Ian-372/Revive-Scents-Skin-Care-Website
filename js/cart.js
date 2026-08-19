// =====================================================
// REVIVE CART
// =====================================================

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const summaryItems =
    document.getElementById("summaryItems");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutButton =
    document.getElementById("checkoutButton");


// =====================================================
// PRICE FORMAT
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
// GET CART
// =====================================================

function getCart() {

    try {

        return JSON.parse(
            localStorage.getItem("reviveCart")
        ) || [];

    } catch {

        return [];

    }

}


// =====================================================
// SAVE CART
// =====================================================

function saveCart(cart) {

    localStorage.setItem(
        "reviveCart",
        JSON.stringify(cart)
    );

}


// =====================================================
// RENDER CART
// =====================================================

function renderCart() {

    const cart = getCart();


    if (!cart.length) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <h2>
                    Your cart is empty
                </h2>

                <p>
                    You haven't added anything yet.
                </p>

                <a
                    href="shop.html"
                    class="btn btn-primary"
                >
                    Explore the Shop →
                </a>

            </div>

        `;

        updateSummary([]);

        return;

    }


    cartItems.innerHTML =
        cart.map((item, index) => `

            <article
                class="cart-item"
                data-index="${index}"
            >

                <a
                    href="product.html?id=${encodeURIComponent(item.id)}"
                    class="cart-item-image"
                >

                    <img
                        src="${escapeHTML(item.image || "")}"
                        alt="${escapeHTML(item.name || "Product")}"
                    >

                </a>


                <div class="cart-item-info">

                    <span class="cart-item-category">
                        ${escapeHTML(item.category || "REVIVE")}
                    </span>

                    <h3>
                        ${escapeHTML(item.name || "Product")}
                    </h3>

                    <span class="cart-item-price">
                        ${formatPrice(item.price)}
                    </span>


                    <div class="cart-controls">

                        <button
                            type="button"
                            class="decrease-item"
                            data-index="${index}"
                            ${item.quantity <= 1 ? "disabled" : ""}
                        >
                            −
                        </button>

                        <strong>
                            ${item.quantity}
                        </strong>

                        <button
                            type="button"
                            class="increase-item"
                            data-index="${index}"
                        >
                            +
                        </button>

                    </div>


                    <button
                        type="button"
                        class="cart-remove"
                        data-index="${index}"
                    >
                        Remove
                    </button>

                </div>


                <strong class="cart-item-total">

                    ${formatPrice(
                        Number(item.price) *
                        Number(item.quantity)
                    )}

                </strong>

            </article>

        `).join("");


    updateSummary(cart);

}


// =====================================================
// SUMMARY
// =====================================================

function updateSummary(cart) {

    const itemCount =
        cart.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );


    const subtotal =
        cart.reduce(
            (total, item) =>
                total +
                (
                    Number(item.price || 0) *
                    Number(item.quantity || 0)
                ),
            0
        );


    if (cartCount) {

        cartCount.textContent =
            itemCount;

    }


    if (summaryItems) {

        summaryItems.textContent =
            itemCount;

    }


    if (cartSubtotal) {

        cartSubtotal.textContent =
            formatPrice(subtotal);

    }


    if (cartTotal) {

        cartTotal.textContent =
            formatPrice(subtotal);

    }


    if (checkoutButton) {

        checkoutButton.disabled =
            cart.length === 0;

    }

}


// =====================================================
// CART ACTIONS
// =====================================================

cartItems.addEventListener(
    "click",
    (event) => {

        const increase =
            event.target.closest(
                ".increase-item"
            );

        const decrease =
            event.target.closest(
                ".decrease-item"
            );

        const remove =
            event.target.closest(
                ".cart-remove"
            );


        const button =
            increase ||
            decrease ||
            remove;


        if (!button) return;


        const index =
            Number(button.dataset.index);


        const cart =
            getCart();


        if (!cart[index]) return;


        // Increase

        if (increase) {

            cart[index].quantity =
                Number(cart[index].quantity) + 1;

        }


        // Decrease

        if (decrease) {

            cart[index].quantity =
                Number(cart[index].quantity) - 1;


            if (
                cart[index].quantity <= 0
            ) {

                cart.splice(index, 1);

            }

        }


        // Remove

        if (remove) {

            cart.splice(index, 1);

        }


        saveCart(cart);

        renderCart();

    }
);


// =====================================================
// CHECKOUT
// =====================================================

checkoutButton.addEventListener(
    "click",
    () => {

        const cart =
            getCart();


        if (!cart.length) {

            return;

        }


        window.location.href =
            "checkout.html";

    }
);


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
// YEAR
// =====================================================

const year =
    document.getElementById("year");

if (year) {

    year.textContent =
        new Date().getFullYear();

}


// =====================================================
// START
// =====================================================

renderCart();