import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


// =====================================================
// ADMIN CONFIGURATION
// =====================================================

const ADMIN_EMAIL =
    "ianmutuli36@gmail.com";


// =====================================================
// ELEMENTS
// =====================================================

const ordersTable =
    document.getElementById("ordersTable");

const mobileOrders =
    document.getElementById("mobileOrders");

const orderSearch =
    document.getElementById("orderSearch");

const statusFilter =
    document.getElementById("statusFilter");

const paymentFilter =
    document.getElementById("paymentFilter");

const dateFilter =
    document.getElementById("dateFilter");

const refreshOrders =
    document.getElementById("refreshOrders");

const resultCount =
    document.getElementById("resultCount");

const pendingOrderBadge =
    document.getElementById("pendingOrderBadge");

const ordersMessage =
    document.getElementById("ordersMessage");


// =====================================================
// STAT ELEMENTS
// =====================================================

const totalOrders =
    document.getElementById("totalOrders");

const pendingOrders =
    document.getElementById("pendingOrders");

const confirmedOrders =
    document.getElementById("confirmedOrders");

const completedOrders =
    document.getElementById("completedOrders");

const totalRevenue =
    document.getElementById("totalRevenue");


// =====================================================
// MODAL ELEMENTS
// =====================================================

const orderModal =
    document.getElementById("orderModal");

const modalOverlay =
    document.getElementById("modalOverlay");

const closeOrderModal =
    document.getElementById("closeOrderModal");

const orderModalTitle =
    document.getElementById("orderModalTitle");

const orderModalDate =
    document.getElementById("orderModalDate");

const detailCustomerName =
    document.getElementById(
        "detailCustomerName"
    );

const detailCustomerEmail =
    document.getElementById(
        "detailCustomerEmail"
    );

const detailCustomerPhone =
    document.getElementById(
        "detailCustomerPhone"
    );

const detailOrderId =
    document.getElementById(
        "detailOrderId"
    );

const detailItems =
    document.getElementById(
        "detailItems"
    );

const detailDelivery =
    document.getElementById(
        "detailDelivery"
    );

const detailPayment =
    document.getElementById(
        "detailPayment"
    );

const detailTotal =
    document.getElementById(
        "detailTotal"
    );

const orderStatus =
    document.getElementById(
        "orderStatus"
    );

const saveOrderStatus =
    document.getElementById(
        "saveOrderStatus"
    );

const statusMessage =
    document.getElementById(
        "statusMessage"
    );

const adminLogout =
    document.getElementById(
        "adminLogout"
    );


// =====================================================
// STATE
// =====================================================

let allOrders = [];

let currentOrder = null;


// =====================================================
// YEAR
// =====================================================

document.getElementById(
    "adminYear"
).textContent =
    new Date().getFullYear();


// =====================================================
// DATE
// =====================================================

document.getElementById(
    "currentDate"
).textContent =
    new Date().toLocaleDateString(
        "en-KE",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );


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


        if (
            user.email?.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            alert(
                "You are not authorised to access the admin area."
            );

            window.location.href =
                "../index.html";

            return;
        }


        if (!user.emailVerified) {

            window.location.href =
                "../auth/verify-email.html";

            return;
        }


        await loadOrders();

    }
);


// =====================================================
// LOAD ORDERS
// =====================================================

async function loadOrders() {

    renderLoading();

    clearMessage();


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "orders"
                )
            );


        allOrders = [];


        snapshot.forEach(
            (orderDocument) => {

                const data =
                    orderDocument.data();


                allOrders.push({

                    id:
                        orderDocument.id,

                    ...data

                });

            }
        );


        /*
         * Newest orders first.
         */

        allOrders.sort(
            (a, b) =>
                getTimestamp(
                    b.createdAt
                ) -
                getTimestamp(
                    a.createdAt
                )
        );


        updateStatistics();

        applyFilters();


    } catch (error) {

        console.error(
            "Failed to load orders:",
            error
        );


        renderError();

        showMessage(
            "Unable to load orders. Check your Firestore permissions.",
            "error"
        );

    }

}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics() {

    const total =
        allOrders.length;


    const pending =
        allOrders.filter(
            order =>
                normalizeStatus(
                    order.status
                ) === "pending"
        ).length;


    const confirmed =
        allOrders.filter(
            order =>
                normalizeStatus(
                    order.status
                ) === "confirmed"
        ).length;


    const completed =
        allOrders.filter(
            order =>
                normalizeStatus(
                    order.status
                ) === "completed"
        ).length;


    const revenue =
        allOrders.reduce(
            (
                totalAmount,
                order
            ) => {

                const status =
                    normalizeStatus(
                        order.status
                    );


                if (
                    status ===
                    "cancelled"
                ) {

                    return totalAmount;

                }


                return (
                    totalAmount +
                    getOrderTotal(
                        order
                    )
                );

            },
            0
        );


    totalOrders.textContent =
        total;


    pendingOrders.textContent =
        pending;


    confirmedOrders.textContent =
        confirmed;


    completedOrders.textContent =
        completed;


    totalRevenue.textContent =
        formatCurrency(
            revenue
        );


    pendingOrderBadge.textContent =
        pending;

}


// =====================================================
// FILTERING
// =====================================================

function applyFilters() {

    const search =
        orderSearch.value
            .trim()
            .toLowerCase();


    const status =
        statusFilter.value;


    const payment =
        paymentFilter.value;


    const date =
        dateFilter.value;


    const filtered =
        allOrders.filter(
            order => {

                // -----------------------------------------
                // SEARCH
                // -----------------------------------------

                if (search) {

                    const searchable =
                        [

                            order.id,

                            order.orderNumber,

                            order.customerName,

                            order.name,

                            order.email,

                            order.customerEmail,

                            order.phone,

                            order.customerPhone

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                    if (
                        !searchable.includes(
                            search
                        )
                    ) {

                        return false;

                    }

                }


                // -----------------------------------------
                // STATUS
                // -----------------------------------------

                if (
                    status !== "all" &&
                    normalizeStatus(
                        order.status
                    ) !== status
                ) {

                    return false;

                }


                // -----------------------------------------
                // PAYMENT
                // -----------------------------------------

                if (
                    payment !== "all" &&
                    getPaymentStatus(
                        order
                    ) !== payment
                ) {

                    return false;

                }


                // -----------------------------------------
                // DATE
                // -----------------------------------------

                if (
                    date !== "all" &&
                    !matchesDateFilter(
                        order,
                        date
                    )
                ) {

                    return false;

                }


                return true;

            }
        );


    renderOrders(
        filtered
    );

}


// =====================================================
// SEARCH / FILTER EVENTS
// =====================================================

orderSearch.addEventListener(
    "input",
    applyFilters
);

statusFilter.addEventListener(
    "change",
    applyFilters
);

paymentFilter.addEventListener(
    "change",
    applyFilters
);

dateFilter.addEventListener(
    "change",
    applyFilters
);


refreshOrders.addEventListener(
    "click",
    async () => {

        refreshOrders.disabled =
            true;

        refreshOrders.textContent =
            "…";


        await loadOrders();


        refreshOrders.disabled =
            false;

        refreshOrders.textContent =
            "↻";

    }
);


// =====================================================
// RENDER ORDERS
// =====================================================

function renderOrders(
    orders
) {

    resultCount.textContent =
        `${orders.length} ${
            orders.length === 1
                ? "order"
                : "orders"
        }`;


    if (!orders.length) {

        ordersTable.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="empty-orders">

                        <div class="empty-orders-icon">
                            ▤
                        </div>

                        <h3>
                            No orders found
                        </h3>

                        <p>
                            There are no orders matching
                            your current search and filters.
                        </p>

                    </div>

                </td>

            </tr>

        `;


        mobileOrders.innerHTML = "";

        return;

    }


    ordersTable.innerHTML =
        orders
            .map(
                createOrderRow
            )
            .join("");


    mobileOrders.innerHTML =
        orders
            .map(
                createMobileOrderCard
            )
            .join("");

}


// =====================================================
// DESKTOP ROW
// =====================================================

function createOrderRow(
    order
) {

    const customer =
        getCustomerName(
            order
        );


    const email =
        getCustomerEmail(
            order
        );


    const status =
        normalizeStatus(
            order.status
        );


    const payment =
        getPaymentStatus(
            order
        );


    const date =
        formatDate(
            order.createdAt
        );


    const total =
        getOrderTotal(
            order
        );


    return `

        <tr>

            <td>

                <div class="order-number">

                    <strong>
                        #${escapeHTML(
                            getOrderNumber(
                                order
                            )
                        )}
                    </strong>

                    <span>
                        ${getItemCount(
                            order
                        )}
                        ${
                            getItemCount(order) === 1
                                ? "item"
                                : "items"
                        }
                    </span>

                </div>

            </td>


            <td>

                <div class="customer-cell">

                    <div class="customer-avatar">

                        ${escapeHTML(
                            getInitial(
                                customer
                            )
                        )}

                    </div>

                    <div class="customer-info">

                        <strong>
                            ${escapeHTML(
                                customer
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                email || "No email"
                            )}
                        </span>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHTML(date)}
            </td>


            <td>

                <span class="order-price">

                    ${formatCurrency(
                        total
                    )}

                </span>

            </td>


            <td>

                <span
                    class="
                        order-badge
                        payment-${payment}
                    "
                >
                    ${formatPaymentLabel(
                        payment
                    )}
                </span>

            </td>


            <td>

                <span
                    class="
                        order-badge
                        status-${status}
                    "
                >
                    ${formatStatusLabel(
                        status
                    )}
                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="view-order-button"
                    data-order-id="${escapeHTML(
                        order.id
                    )}"
                >
                    View
                </button>

            </td>

        </tr>

    `;

}


// =====================================================
// MOBILE CARD
// =====================================================

function createMobileOrderCard(
    order
) {

    const customer =
        getCustomerName(
            order
        );


    const status =
        normalizeStatus(
            order.status
        );


    const payment =
        getPaymentStatus(
            order
        );


    return `

        <article class="mobile-order-card">

            <div class="mobile-order-top">

                <div class="mobile-order-customer">

                    <div class="customer-avatar">

                        ${escapeHTML(
                            getInitial(
                                customer
                            )
                        )}

                    </div>

                    <div class="customer-info">

                        <strong>
                            ${escapeHTML(
                                customer
                            )}
                        </strong>

                        <span>
                            #${escapeHTML(
                                getOrderNumber(
                                    order
                                )
                            )}
                        </span>

                    </div>

                </div>


                <span
                    class="
                        order-badge
                        status-${status}
                    "
                >
                    ${formatStatusLabel(
                        status
                    )}
                </span>

            </div>


            <div class="mobile-order-details">

                <div>

                    <span>
                        DATE
                    </span>

                    <strong>
                        ${escapeHTML(
                            formatDate(
                                order.createdAt
                            )
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        TOTAL
                    </span>

                    <strong>
                        ${formatCurrency(
                            getOrderTotal(
                                order
                            )
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        PAYMENT
                    </span>

                    <strong>
                        ${formatPaymentLabel(
                            payment
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        ITEMS
                    </span>

                    <strong>
                        ${getItemCount(
                            order
                        )}
                    </strong>

                </div>

            </div>


            <button
                type="button"
                class="view-order-button"
                data-order-id="${escapeHTML(
                    order.id
                )}"
                style="
                    width:100%;
                    margin-top:12px;
                "
            >
                View order details →
            </button>

        </article>

    `;

}


// =====================================================
// VIEW ORDER
// =====================================================

function openOrderDetails(
    id
) {

    const order =
        allOrders.find(
            item =>
                item.id === id
        );


    if (!order) {

        return;

    }


    currentOrder =
        order;


    const customer =
        getCustomerName(
            order
        );


    const email =
        getCustomerEmail(
            order
        );


    const phone =
        getCustomerPhone(
            order
        );


    const status =
        normalizeStatus(
            order.status
        );


    const payment =
        getPaymentStatus(
            order
        );


    orderModalTitle.textContent =
        `#${getOrderNumber(order)}`;


    orderModalDate.textContent =
        formatDate(
            order.createdAt,
            true
        );


    detailCustomerName.textContent =
        customer;


    detailCustomerEmail.textContent =
        email || "Not provided";


    detailCustomerPhone.textContent =
        phone || "Not provided";


    detailOrderId.textContent =
        order.id;


    detailPayment.textContent =
        formatPaymentLabel(
            payment
        );


    detailTotal.textContent =
        formatCurrency(
            getOrderTotal(
                order
            )
        );


    orderStatus.value =
        validStatus(
            status
        )
            ? status
            : "pending";


    renderDetailItems(
        order
    );


    renderDelivery(
        order
    );


    statusMessage.textContent =
        "";


    statusMessage.className =
        "status-message";


    orderModal.classList.add(
        "open"
    );


    orderModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


// =====================================================
// DETAIL ITEMS
// =====================================================

function renderDetailItems(
    order
) {

    const items =
        getOrderItems(
            order
        );


    if (!items.length) {

        detailItems.innerHTML = `

            <div class="delivery-detail">
                No item details were recorded for this order.
            </div>

        `;

        return;

    }


    detailItems.innerHTML =
        items
            .map(
                item => {

                    const name =
                        item.name ||
                        item.productName ||
                        "Product";


                    const quantity =
                        Number(
                            item.quantity
                        ) || 1;


                    const price =
                        Number(
                            item.price ??
                            item.unitPrice ??
                            0
                        );


                    const image =
                        item.image ||
                        item.productImage ||
                        "";


                    const itemTotal =
                        price *
                        quantity;


                    return `

                        <div class="detail-item">

                            <div class="detail-item-info">

                                ${
                                    image

                                        ? `

                                            <img
                                                class="detail-item-image"
                                                src="${escapeHTML(image)}"
                                                alt="${escapeHTML(name)}"
                                            >

                                          `

                                        : `

                                            <div class="detail-item-image">
                                            </div>

                                          `
                                }


                                <div class="detail-item-name">

                                    <strong>
                                        ${escapeHTML(
                                            name
                                        )}
                                    </strong>

                                    <span>
                                        Qty: ${quantity}
                                    </span>

                                </div>

                            </div>


                            <strong class="detail-item-price">

                                ${formatCurrency(
                                    itemTotal
                                )}

                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}


// =====================================================
// DELIVERY
// =====================================================

function renderDelivery(
    order
) {

    const address =
        order.deliveryAddress ||
        order.address;


    if (
        typeof address ===
        "object"
    ) {

        const parts = [

            address.recipientFirstName,
            address.recipientLastName,
            address.area,
            address.building,
            address.town,
            address.county,
            address.phone ||
                address.recipientPhone

        ]
            .filter(Boolean);


        detailDelivery.textContent =
            parts.join(", ");

        return;

    }


    if (address) {

        detailDelivery.textContent =
            String(address);

        return;

    }


    const parts = [

        order.area,
        order.town,
        order.county

    ]
        .filter(Boolean);


    detailDelivery.textContent =
        parts.length
            ? parts.join(", ")
            : "No delivery address recorded.";

}


// =====================================================
// MODAL EVENTS
// =====================================================

ordersTable.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                ".view-order-button"
            );


        if (!button) return;


        openOrderDetails(
            button.dataset.orderId
        );

    }
);


mobileOrders.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                ".view-order-button"
            );


        if (!button) return;


        openOrderDetails(
            button.dataset.orderId
        );

    }
);


function closeModal() {

    orderModal.classList.remove(
        "open"
    );


    orderModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );


    currentOrder = null;

}


closeOrderModal.addEventListener(
    "click",
    closeModal
);


modalOverlay.addEventListener(
    "click",
    closeModal
);


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            orderModal.classList.contains(
                "open"
            )
        ) {

            closeModal();

        }

    }
);


// =====================================================
// UPDATE STATUS
// =====================================================

saveOrderStatus.addEventListener(
    "click",
    async () => {

        if (!currentOrder) {

            return;

        }


        const newStatus =
            orderStatus.value;


        try {

            saveOrderStatus.disabled =
                true;

            saveOrderStatus.textContent =
                "Updating...";


            await updateDoc(
                doc(
                    db,
                    "orders",
                    currentOrder.id
                ),
                {

                    status:
                        newStatus,

                    updatedAt:
                        serverTimestamp()

                }
            );


            /*
             * Update local copy immediately.
             */

            currentOrder.status =
                newStatus;


            const index =
                allOrders.findIndex(
                    order =>
                        order.id ===
                        currentOrder.id
                );


            if (index !== -1) {

                allOrders[index].status =
                    newStatus;

            }


            updateStatistics();

            applyFilters();


            showStatusMessage(
                "Order status updated successfully.",
                "success"
            );


            showMessage(
                "Order status updated.",
                "success"
            );


        } catch (error) {

            console.error(
                "Failed to update order status:",
                error
            );


            showStatusMessage(
                "Unable to update the order status.",
                "error"
            );

        } finally {

            saveOrderStatus.disabled =
                false;

            saveOrderStatus.textContent =
                "Update status";

        }

    }
);


// =====================================================
// LOGOUT
// =====================================================

adminLogout.addEventListener(
    "click",
    async () => {

        try {

            adminLogout.disabled =
                true;

            adminLogout.textContent =
                "Signing out...";


            await signOut(
                auth
            );


            window.location.href =
                "../auth/login.html";


        } catch (error) {

            console.error(
                "Logout failed:",
                error
            );


            adminLogout.disabled =
                false;

            adminLogout.innerHTML =
                "↪ Sign out";

        }

    }
);


// =====================================================
// STATUS MESSAGE
// =====================================================

function showStatusMessage(
    text,
    type
) {

    statusMessage.textContent =
        text;

    statusMessage.className =
        `status-message ${type}`;

}


// =====================================================
// GENERAL MESSAGE
// =====================================================

function showMessage(
    text,
    type
) {

    ordersMessage.textContent =
        text;

    ordersMessage.className =
        `orders-message ${type}`;


    setTimeout(
        () => {

            clearMessage();

        },
        4000
    );

}


function clearMessage() {

    ordersMessage.textContent =
        "";

    ordersMessage.className =
        "orders-message";

}


// =====================================================
// LOADING
// =====================================================

function renderLoading() {

    ordersTable.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="loading-cell"
            >

                <div class="loading-spinner"></div>

                <span>
                    Loading orders...
                </span>

            </td>

        </tr>

    `;


    mobileOrders.innerHTML = "";

}


// =====================================================
// ERROR
// =====================================================

function renderError() {

    ordersTable.innerHTML = `

        <tr>

            <td colspan="7">

                <div class="empty-orders">

                    <div class="empty-orders-icon">
                        !
                    </div>

                    <h3>
                        Couldn't load orders
                    </h3>

                    <p>
                        Check your connection and
                        Firestore permissions, then refresh.
                    </p>

                </div>

            </td>

        </tr>

    `;

}


// =====================================================
// HELPERS — STATUS
// =====================================================

function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            "pending"
        )
            .toLowerCase()
            .trim();


    if (
        value === "processing" ||
        value === "in progress" ||
        value === "shipped"
    ) {

        return "processing";

    }


    if (
        value === "complete" ||
        value === "completed" ||
        value === "delivered"
    ) {

        return "completed";

    }


    if (
        value === "cancel" ||
        value === "cancelled" ||
        value === "canceled"
    ) {

        return "cancelled";

    }


    if (
        value === "confirm" ||
        value === "confirmed"
    ) {

        return "confirmed";

    }


    return "pending";

}


function validStatus(
    status
) {

    return [

        "pending",
        "confirmed",
        "processing",
        "completed",
        "cancelled"

    ].includes(
        status
    );

}


function formatStatusLabel(
    status
) {

    const labels = {

        pending:
            "Pending",

        confirmed:
            "Confirmed",

        processing:
            "Processing",

        completed:
            "Completed",

        cancelled:
            "Cancelled"

    };


    return (
        labels[status] ||
        "Pending"
    );

}


// =====================================================
// HELPERS — PAYMENT
// =====================================================

function getPaymentStatus(
    order
) {

    const value =
        String(

            order.paymentStatus ||

            order.payment_status ||

            order.payment?.status ||

            order.paymentState ||

            ""

        )
            .toLowerCase()
            .trim();


    if (
        value.includes("fail") ||
        value.includes("declin")
    ) {

        return "failed";

    }


    if (
        value.includes("paid") ||
        value.includes("success") ||
        value.includes("complete") ||
        order.paid === true ||
        order.paymentCompleted === true
    ) {

        return "paid";

    }


    return "pending";

}


function formatPaymentLabel(
    payment
) {

    const labels = {

        paid:
            "Paid",

        pending:
            "Pending",

        failed:
            "Failed"

    };


    return (
        labels[payment] ||
        "Pending"
    );

}


// =====================================================
// HELPERS — CUSTOMER
// =====================================================

function getCustomerName(
    order
) {

    if (
        order.customerName
    ) {

        return String(
            order.customerName
        );

    }


    if (
        order.name
    ) {

        return String(
            order.name
        );

    }


    const first =
        order.firstName ||
        order.customerFirstName ||
        "";


    const last =
        order.lastName ||
        order.customerLastName ||
        "";


    const full =
        `${first} ${last}`
            .trim();


    return (
        full ||
        "Customer"
    );

}


function getCustomerEmail(
    order
) {

    return (
        order.customerEmail ||
        order.email ||
        ""
    );

}


function getCustomerPhone(
    order
) {

    return (
        order.customerPhone ||
        order.phone ||
        order.recipientPhone ||
        ""
    );

}


function getInitial(
    name
) {

    const value =
        String(
            name ||
            "C"
        )
            .trim();


    return (
        value.charAt(0)
            .toUpperCase() ||
        "C"
    );

}


// =====================================================
// HELPERS — ORDER
// =====================================================

function getOrderNumber(
    order
) {

    return (
        order.orderNumber ||
        order.orderId ||
        order.id.slice(0, 8).toUpperCase()
    );

}


function getOrderItems(
    order
) {

    if (
        Array.isArray(
            order.items
        )
    ) {

        return order.items;

    }


    if (
        Array.isArray(
            order.products
        )
    ) {

        return order.products;

    }


    if (
        Array.isArray(
            order.orderItems
        )
    ) {

        return order.orderItems;

    }


    return [];

}


function getItemCount(
    order
) {

    const items =
        getOrderItems(
            order
        );


    if (!items.length) {

        return (
            Number(
                order.itemCount
            ) || 0
        );

    }


    return items.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                (
                    Number(
                        item.quantity
                    ) || 1
                )
            );

        },
        0
    );

}


function getOrderTotal(
    order
) {

    const possibleTotals = [

        order.total,

        order.grandTotal,

        order.orderTotal,

        order.amount,

        order.totalAmount,

        order.finalTotal

    ];


    for (
        const value of possibleTotals
    ) {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {

            const number =
                Number(
                    value
                );


            if (
                Number.isFinite(
                    number
                )
            ) {

                return number;

            }

        }

    }


    const items =
        getOrderItems(
            order
        );


    return items.reduce(
        (
            total,
            item
        ) => {

            const price =
                Number(
                    item.price ??
                    item.unitPrice ??
                    0
                );


            const quantity =
                Number(
                    item.quantity
                ) || 1;


            return (
                total +
                price *
                quantity
            );

        },
        0
    );

}


// =====================================================
// HELPERS — DATE
// =====================================================

function getTimestamp(
    timestamp
) {

    if (!timestamp) {

        return 0;

    }


    if (
        typeof timestamp.toMillis ===
        "function"
    ) {

        return timestamp.toMillis();

    }


    if (
        timestamp.seconds !== undefined
    ) {

        return (
            Number(
                timestamp.seconds
            ) * 1000
        );

    }


    const date =
        new Date(
            timestamp
        );


    return (
        Number.isNaN(
            date.getTime()
        )
            ? 0
            : date.getTime()
    );

}


function formatDate(
    timestamp,
    detailed = false
) {

    const milliseconds =
        getTimestamp(
            timestamp
        );


    if (!milliseconds) {

        return "Unknown date";

    }


    return new Date(
        milliseconds
    ).toLocaleDateString(
        "en-KE",
        detailed
            ? {

                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"

            }
            : {

                day: "numeric",
                month: "short",
                year: "numeric"

            }
    );

}


function matchesDateFilter(
    order,
    filter
) {

    const timestamp =
        getTimestamp(
            order.createdAt
        );


    if (!timestamp) {

        return false;

    }


    const date =
        new Date(
            timestamp
        );


    const now =
        new Date();


    if (
        filter === "today"
    ) {

        return (

            date.getDate() ===
            now.getDate() &&

            date.getMonth() ===
            now.getMonth() &&

            date.getFullYear() ===
            now.getFullYear()

        );

    }


    const days =
        Number(
            filter
        );


    if (
        Number.isFinite(days)
    ) {

        const cutoff =
            Date.now() -
            (
                days *
                24 *
                60 *
                60 *
                1000
            );


        return (
            timestamp >=
            cutoff
        );

    }


    return true;

}


// =====================================================
// HELPERS — CURRENCY
// =====================================================

function formatCurrency(
    amount
) {

    return `KSh ${(
        Number(
            amount
        ) || 0
    ).toLocaleString(
        "en-KE",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    )}`;

}


// =====================================================
// HTML ESCAPING
// =====================================================

function escapeHTML(
    value
) {

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