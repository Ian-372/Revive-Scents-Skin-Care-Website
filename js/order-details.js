import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


import {
    auth,
    db
} from "./firebase-config.js";


// =====================================================
// ELEMENTS
// =====================================================

const loading =
    document.getElementById("orderLoading");

const errorState =
    document.getElementById("orderError");

const orderContent =
    document.getElementById("orderContent");

const orderNumber =
    document.getElementById("orderNumber");

const orderDate =
    document.getElementById("orderDate");

const orderStatus =
    document.getElementById("orderStatus");

const orderItems =
    document.getElementById("orderItems");

const itemCount =
    document.getElementById("itemCount");

const subtotal =
    document.getElementById("subtotal");

const deliveryFee =
    document.getElementById("deliveryFee");

const orderTotal =
    document.getElementById("orderTotal");

const deliveryAddress =
    document.getElementById("deliveryAddress");

const paymentInformation =
    document.getElementById("paymentInformation");

const paymentStatus =
    document.getElementById("paymentStatus");

const customerName =
    document.getElementById("customerName");

const customerEmail =
    document.getElementById("customerEmail");

const customerPhone =
    document.getElementById("customerPhone");


// =====================================================
// ORDER ID
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );


const orderId =
    params.get("id");


// =====================================================
// AUTH
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


        if (!orderId) {

            showError();

            return;

        }


        await loadOrder(user);

    }
);


// =====================================================
// LOAD ORDER
// =====================================================

async function loadOrder(user) {

    try {

        const orderRef =
            doc(
                db,
                "orders",
                orderId
            );


        const snapshot =
            await getDoc(
                orderRef
            );


        if (!snapshot.exists()) {

            showError();

            return;

        }


        const order =
            {
                id: snapshot.id,
                ...snapshot.data()
            };


        /*
         * SECURITY CHECK
         *
         * Never allow a customer to view
         * another customer's order.
         */

        const ownerId =
            order.userId ||
            order.customerId;


        if (
            ownerId &&
            ownerId !== user.uid
        ) {

            showError();

            return;

        }


        renderOrder(order);


    } catch (error) {

        console.error(
            "Failed to load order:",
            error
        );

        showError();

    }

}


// =====================================================
// RENDER ORDER
// =====================================================

function renderOrder(order) {

    loading.classList.add(
        "hidden"
    );

    errorState.classList.add(
        "hidden"
    );

    orderContent.classList.remove(
        "hidden"
    );


    const displayNumber =
        order.orderNumber ||
        order.orderId ||
        `#${order.id.slice(0, 8).toUpperCase()}`;


    orderNumber.textContent =
        displayNumber;


    orderDate.textContent =
        formatDate(
            order.createdAt ||
            order.date ||
            order.orderDate
        );


    renderStatus(
        order.status
    );


    renderItems(
        order.items ||
        order.products ||
        []
    );


    renderSummary(
        order
    );


    renderDeliveryAddress(
        order
    );


    renderPayment(
        order
    );


    renderCustomer(
        order
    );


    document.title =
        `${displayNumber} | REVIVE`;

}


// =====================================================
// ITEMS
// =====================================================

function renderItems(items) {

    if (!Array.isArray(items)) {

        items = [];

    }


    const totalItems =
        items.reduce(
            (total, item) => {

                return total +
                    Number(
                        item.quantity || 1
                    );

            },
            0
        );


    itemCount.textContent =
        `${totalItems} ${
            totalItems === 1
                ? "item"
                : "items"
        }`;


    if (!items.length) {

        orderItems.innerHTML = `

            <div class="empty-order-items">

                <span>
                    No item information available.
                </span>

            </div>

        `;

        return;

    }


    orderItems.innerHTML =
        items.map(
            item => {

                const name =
                    item.name ||
                    item.productName ||
                    "REVIVE Product";


                const image =
                    item.image ||
                    item.productImage ||
                    "";


                const quantity =
                    Number(
                        item.quantity || 1
                    );


                const price =
                    Number(
                        item.price ||
                        item.unitPrice ||
                        0
                    );


                const total =
                    price * quantity;


                return `

                    <article class="order-item">

                        <div class="order-item-image">

                            ${
                                image
                                    ? `
                                        <img
                                            src="${escapeHTML(image)}"
                                            alt="${escapeHTML(name)}"
                                        >
                                    `
                                    : `
                                        <span>
                                            RS
                                        </span>
                                    `
                            }

                        </div>


                        <div class="order-item-info">

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                            <span>
                                Quantity: ${quantity}
                            </span>

                        </div>


                        <div class="order-item-price">

                            <span>
                                ${formatPrice(price)}
                            </span>

                            <strong>
                                ${formatPrice(total)}
                            </strong>

                        </div>

                    </article>

                `;

            }
        ).join("");

}


// =====================================================
// SUMMARY
// =====================================================

function renderSummary(order) {

    const subtotalValue =
        Number(
            order.subtotal ??
            calculateSubtotal(order.items)
        );


    const deliveryValue =
        Number(
            order.deliveryFee ??
            order.shippingFee ??
            0
        );


    const totalValue =
        Number(
            order.total ??
            order.totalAmount ??
            subtotalValue + deliveryValue
        );


    subtotal.textContent =
        formatPrice(
            subtotalValue
        );


    deliveryFee.textContent =
        deliveryValue > 0
            ? formatPrice(deliveryValue)
            : "FREE";


    orderTotal.textContent =
        formatPrice(
            totalValue
        );


    const status =
        String(
            order.paymentStatus ||
            order.payment?.status ||
            "Pending"
        );


    paymentStatus.textContent =
        `Payment: ${formatStatus(status)}`;


    paymentStatus.className =
        `payment-status ${statusClass(status)}`;

}


// =====================================================
// DELIVERY ADDRESS
// =====================================================

function renderDeliveryAddress(order) {

    const address =
        order.deliveryAddress ||
        order.address;


    if (
        address &&
        typeof address === "object"
    ) {

        const fullName =
            `${address.recipientFirstName || ""} ${
                address.recipientLastName || ""
            }`.trim();


        deliveryAddress.innerHTML = `

            <strong>
                ${escapeHTML(
                    fullName || "Delivery recipient"
                )}
            </strong>

            <p>
                ${escapeHTML(
                    address.area || ""
                )}
                ${
                    address.building
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

            ${
                address.phone
                    ? `
                        <p>
                            ${escapeHTML(address.phone)}
                        </p>
                    `
                    : ""
            }

        `;

        return;

    }


    /*
     * Supports orders where the address
     * was saved as a string.
     */

    if (typeof address === "string") {

        deliveryAddress.innerHTML = `

            <p>
                ${escapeHTML(address)}
            </p>

        `;

        return;

    }


    deliveryAddress.innerHTML = `

        <p class="muted">
            Delivery address information unavailable.
        </p>

    `;

}


// =====================================================
// PAYMENT
// =====================================================

function renderPayment(order) {

    const method =
        order.paymentMethod ||
        order.payment?.method ||
        "Not specified";


    const status =
        order.paymentStatus ||
        order.payment?.status ||
        "Pending";


    paymentInformation.innerHTML = `

        <div class="payment-row">

            <span>
                Payment method
            </span>

            <strong>
                ${escapeHTML(
                    formatStatus(method)
                )}
            </strong>

        </div>


        <div class="payment-row">

            <span>
                Payment status
            </span>

            <strong class="${statusClass(status)}">
                ${escapeHTML(
                    formatStatus(status)
                )}
            </strong>

        </div>

    `;

}


// =====================================================
// CUSTOMER
// =====================================================

function renderCustomer(order) {

    const customer =
        order.customer ||
        {};


    customerName.textContent =
        customer.name ||
        order.customerName ||
        "REVIVE Customer";


    customerEmail.textContent =
        customer.email ||
        order.customerEmail ||
        "—";


    customerPhone.textContent =
        customer.phone ||
        order.customerPhone ||
        "—";

}


// =====================================================
// STATUS
// =====================================================

function renderStatus(status) {

    const normalized =
        normalizeStatus(status);


    orderStatus.textContent =
        formatStatus(
            normalized
        );


    orderStatus.className =
        `order-status ${statusClass(normalized)}`;


    const steps = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "completed"
    ];


    const currentIndex =
        steps.indexOf(
            normalized
        );


    document
        .querySelectorAll(
            ".timeline-step"
        )
        .forEach(
            (step, index) => {

                step.classList.remove(
                    "completed",
                    "current"
                );


                if (
                    currentIndex >= 0 &&
                    index < currentIndex
                ) {

                    step.classList.add(
                        "completed"
                    );

                }


                if (
                    currentIndex >= 0 &&
                    index === currentIndex
                ) {

                    step.classList.add(
                        "current"
                    );

                }

            }
        );

}


// =====================================================
// HELPERS
// =====================================================

function normalizeStatus(status) {

    const value =
        String(
            status || "pending"
        )
        .toLowerCase()
        .trim();


    if (
        value === "paid" ||
        value === "placed"
    ) {

        return "pending";

    }


    if (
        value === "preparing" ||
        value === "ready"
    ) {

        return "processing";

    }


    if (
        value === "delivered"
    ) {

        return "completed";

    }


    if (
        value === "cancelled" ||
        value === "canceled"
    ) {

        return "cancelled";

    }


    return value;

}


function statusClass(status) {

    const value =
        normalizeStatus(status);


    return `status-${value}`;

}


function formatStatus(status) {

    return String(
        status || "Pending"
    )
        .replaceAll(
            "_",
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


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


function formatDate(value) {

    if (!value) {

        return "Date unavailable";

    }


    let date;


    if (
        value &&
        typeof value.toDate === "function"
    ) {

        date =
            value.toDate();

    } else {

        date =
            new Date(value);

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }


    return new Intl.DateTimeFormat(
        "en-KE",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ).format(date);

}


function calculateSubtotal(items) {

    if (!Array.isArray(items)) {

        return 0;

    }


    return items.reduce(
        (
            total,
            item
        ) => {

            const price =
                Number(
                    item.price ||
                    item.unitPrice ||
                    0
                );


            const quantity =
                Number(
                    item.quantity || 1
                );


            return total +
                price * quantity;

        },
        0
    );

}


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


function showError() {

    loading.classList.add(
        "hidden"
    );

    orderContent.classList.add(
        "hidden"
    );

    errorState.classList.remove(
        "hidden"
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
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity || 0
                ),
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


updateCartCount();


document.getElementById(
    "year"
).textContent =
    new Date().getFullYear();