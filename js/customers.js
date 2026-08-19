import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    auth,
    db
} from "./firebase-config.js";


// =====================================================
// ADMIN CONFIGURATION
// =====================================================

const ADMIN_EMAIL = "ianmutuli36@gmail.com";


// =====================================================
// ELEMENTS
// =====================================================

const customersTable =
    document.getElementById("customersTable");

const customersEmpty =
    document.getElementById("customersEmpty");

const customerSearch =
    document.getElementById("customerSearch");

const customerFilter =
    document.getElementById("customerFilter");

const customerMessage =
    document.getElementById("customerMessage");


// STATISTICS

const totalCustomers =
    document.getElementById("totalCustomers");

const newCustomers =
    document.getElementById("newCustomers");

const orderingCustomers =
    document.getElementById("orderingCustomers");

const activeCustomers =
    document.getElementById("activeCustomers");


// MODAL

const customerModal =
    document.getElementById("customerModal");

const closeCustomerModal =
    document.getElementById("closeCustomerModal");

const customerModalOverlay =
    document.getElementById("customerModalOverlay");

const customerModalTitle =
    document.getElementById("customerModalTitle");

const customerModalEmail =
    document.getElementById("customerModalEmail");

const customerDetailAvatar =
    document.getElementById("customerDetailAvatar");

const customerDetailPhone =
    document.getElementById("customerDetailPhone");

const customerDetailJoined =
    document.getElementById("customerDetailJoined");

const customerDetailOrders =
    document.getElementById("customerDetailOrders");

const customerDetailStatus =
    document.getElementById("customerDetailStatus");

const customerOrders =
    document.getElementById("customerOrders");

const customerOrdersLink =
    document.getElementById("customerOrdersLink");


// =====================================================
// STATE
// =====================================================

let customers = [];
let orders = [];


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


        updateDate();

        await loadCustomers();

    }
);


// =====================================================
// LOAD CUSTOMERS
// =====================================================

async function loadCustomers() {

    showLoading();


    try {

        const usersSnapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        const ordersSnapshot =
            await getDocs(
                collection(
                    db,
                    "orders"
                )
            );


        customers = [];

        orders = [];


        ordersSnapshot.forEach(
            orderDoc => {

                orders.push({
                    id: orderDoc.id,
                    ...orderDoc.data()
                });

            }
        );


        usersSnapshot.forEach(
            userDoc => {

                const data =
                    userDoc.data();


                const customerOrders =
                    orders.filter(
                        order =>
                            order.userId ===
                            userDoc.id
                    );


                customers.push({

                    id: userDoc.id,

                    ...data,

                    orderCount:
                        customerOrders.length,

                    customerOrders

                });

            }
        );


        /*
         * Sort newest customers first.
         */

        customers.sort(
            (a, b) => {

                const dateA =
                    getTimestampValue(
                        a.createdAt
                    );

                const dateB =
                    getTimestampValue(
                        b.createdAt
                    );

                return dateB - dateA;

            }
        );


        updateStatistics();

        renderCustomers();


    } catch (error) {

        console.error(
            "Failed to load customers:",
            error
        );


        customersTable.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="table-loading"
                >

                    <strong>
                        Unable to load customers.
                    </strong>

                    <p style="
                        margin-top:8px;
                        color:#aaa19a;
                        font-size:10px;
                    ">
                        Check your Firebase permissions
                        and try again.
                    </p>

                </td>

            </tr>

        `;


        showMessage(
            "Unable to load customer data.",
            "error"
        );

    }

}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics() {

    totalCustomers.textContent =
        customers.length;


    const now =
        new Date();


    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();


    const newCount =
        customers.filter(
            customer => {

                const date =
                    timestampToDate(
                        customer.createdAt
                    );


                if (!date) return false;


                return (
                    date.getMonth() ===
                    currentMonth &&
                    date.getFullYear() ===
                    currentYear
                );

            }
        ).length;


    newCustomers.textContent =
        newCount;


    const orderingCount =
        customers.filter(
            customer =>
                customer.orderCount > 0
        ).length;


    orderingCustomers.textContent =
        orderingCount;


    const activeCount =
        customers.filter(
            customer =>
                customer.emailVerified !== false
        ).length;


    activeCustomers.textContent =
        activeCount;

}


// =====================================================
// RENDER CUSTOMERS
// =====================================================

function renderCustomers() {

    const searchTerm =
        customerSearch.value
            .trim()
            .toLowerCase();


    const filter =
        customerFilter.value;


    let filtered =
        customers.filter(
            customer => {

                const firstName =
                    customer.firstName || "";

                const lastName =
                    customer.lastName || "";

                const email =
                    customer.email || "";

                const phone =
                    customer.phone || "";


                const fullName =
                    `${firstName} ${lastName}`
                        .trim();


                const searchable =
                    `
                        ${fullName}
                        ${email}
                        ${phone}
                    `
                    .toLowerCase();


                if (
                    searchTerm &&
                    !searchable.includes(
                        searchTerm
                    )
                ) {

                    return false;

                }


                if (
                    filter === "recent"
                ) {

                    const date =
                        timestampToDate(
                            customer.createdAt
                        );


                    if (!date) return false;


                    const days =
                        (
                            Date.now() -
                            date.getTime()
                        ) /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        );


                    if (days > 30) {
                        return false;
                    }

                }


                if (
                    filter === "orders" &&
                    customer.orderCount === 0
                ) {

                    return false;

                }


                if (
                    filter === "no-orders" &&
                    customer.orderCount > 0
                ) {

                    return false;

                }


                return true;

            }
        );


    if (!filtered.length) {

        customersTable.innerHTML = "";

        customersEmpty.hidden = false;

        return;

    }


    customersEmpty.hidden = true;


    customersTable.innerHTML =
        filtered
            .map(
                customer =>
                    createCustomerRow(
                        customer
                    )
            )
            .join("");


    attachCustomerActions();

}


// =====================================================
// CUSTOMER ROW
// =====================================================

function createCustomerRow(customer) {

    const firstName =
        customer.firstName || "";

    const lastName =
        customer.lastName || "";


    const fullName =
        `${firstName} ${lastName}`
            .trim() ||
        "Unnamed customer";


    const initial =
        (
            firstName ||
            fullName.charAt(0) ||
            "R"
        )
        .charAt(0)
        .toUpperCase();


    const joined =
        formatDate(
            customer.createdAt
        );


    const phone =
        customer.phone ||
        "No phone number";


    const email =
        customer.email ||
        "No email";


    const status =
        customer.emailVerified === false
            ? "Inactive"
            : "Active";


    const statusClass =
        customer.emailVerified === false
            ? "inactive"
            : "";


    return `

        <tr>

            <td>

                <div class="customer-cell">

                    <div class="customer-table-avatar">
                        ${initial}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(fullName)}
                        </strong>

                        <span>
                            Customer
                        </span>

                    </div>

                </div>

            </td>


            <td>

                <div class="contact-cell">

                    <strong>
                        ${escapeHTML(email)}
                    </strong>

                    <span>
                        ${escapeHTML(phone)}
                    </span>

                </div>

            </td>


            <td>
                ${escapeHTML(joined)}
            </td>


            <td>

                <span class="order-count">
                    ${customer.orderCount || 0}
                </span>

            </td>


            <td>

                <span
                    class="customer-status ${statusClass}"
                >
                    ${status}
                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="view-customer"
                    data-id="${escapeHTML(customer.id)}"
                >
                    View
                </button>

            </td>

        </tr>

    `;

}


// =====================================================
// CUSTOMER ACTIONS
// =====================================================

function attachCustomerActions() {

    document
        .querySelectorAll(".view-customer")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openCustomerModal(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


// =====================================================
// OPEN CUSTOMER MODAL
// =====================================================

function openCustomerModal(id) {

    const customer =
        customers.find(
            item =>
                item.id === id
        );


    if (!customer) return;


    const firstName =
        customer.firstName || "";

    const lastName =
        customer.lastName || "";


    const fullName =
        `${firstName} ${lastName}`
            .trim() ||
        "REVIVE Customer";


    const initial =
        (
            firstName ||
            fullName.charAt(0) ||
            "R"
        )
        .charAt(0)
        .toUpperCase();


    customerModalTitle.textContent =
        fullName;


    customerModalEmail.textContent =
        customer.email ||
        "No email address";


    customerDetailAvatar.textContent =
        initial;


    customerDetailPhone.textContent =
        customer.phone ||
        "Not provided";


    customerDetailJoined.textContent =
        formatDate(
            customer.createdAt
        );


    customerDetailOrders.textContent =
        customer.orderCount || 0;


    customerDetailStatus.textContent =
        customer.emailVerified === false
            ? "Inactive"
            : "Active";


    customerOrdersLink.href =
        `orders.html?customer=${encodeURIComponent(
            customer.id
        )}`;


    renderCustomerOrders(
        customer.customerOrders || []
    );


    customerModal.classList.add(
        "open"
    );


    customerModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


// =====================================================
// CUSTOMER ORDERS
// =====================================================

function renderCustomerOrders(
    customerOrders
) {

    const sortedOrders =
        [...customerOrders]
            .sort(
                (a, b) =>
                    getTimestampValue(
                        b.createdAt
                    ) -
                    getTimestampValue(
                        a.createdAt
                    )
            )
            .slice(0, 5);


    if (!sortedOrders.length) {

        customerOrders.innerHTML = `

            <div class="detail-loading">

                ♡

                <p style="margin-top:6px;">
                    This customer has not placed
                    any orders yet.
                </p>

            </div>

        `;

        return;

    }


    customerOrders.innerHTML =
        sortedOrders
            .map(
                order => {

                    const orderId =
                        order.id
                            ? order.id.slice(0, 8)
                            : "—";


                    const amount =
                        Number(
                            order.total ||
                            order.totalAmount ||
                            order.amount ||
                            0
                        );


                    const status =
                        normalizeStatus(
                            order.status
                        );


                    return `

                        <div class="customer-order-row">

                            <div class="customer-order-info">

                                <strong>
                                    #${escapeHTML(orderId)}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        formatDate(
                                            order.createdAt
                                        )
                                    )}
                                </span>

                            </div>


                            <div class="customer-order-right">

                                <strong>
                                    KSh ${amount.toLocaleString()}
                                </strong>

                                <span>
                                    ${escapeHTML(status)}
                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeCustomerDetails() {

    customerModal.classList.remove(
        "open"
    );


    customerModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


closeCustomerModal.addEventListener(
    "click",
    closeCustomerDetails
);


customerModalOverlay.addEventListener(
    "click",
    closeCustomerDetails
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            customerModal.classList.contains(
                "open"
            )
        ) {

            closeCustomerDetails();

        }

    }
);


// =====================================================
// SEARCH / FILTER
// =====================================================

customerSearch.addEventListener(
    "input",
    renderCustomers
);


customerFilter.addEventListener(
    "change",
    renderCustomers
);


// =====================================================
// ADMIN LOGOUT
// =====================================================

document
    .getElementById("adminLogout")
    ?.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "../auth/login.html";

            } catch (error) {

                console.error(
                    "Logout failed:",
                    error
                );

                showMessage(
                    "Unable to sign out.",
                    "error"
                );

            }

        }
    );


// =====================================================
// DATE
// =====================================================

function updateDate() {

    const dateElement =
        document.getElementById(
            "currentDate"
        );


    if (!dateElement) return;


    dateElement.textContent =
        new Date().toLocaleDateString(
            "en-KE",
            {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

}


document.getElementById(
    "adminYear"
).textContent =
    new Date().getFullYear();


// =====================================================
// HELPERS
// =====================================================

function timestampToDate(
    timestamp
) {

    if (!timestamp) return null;


    if (
        typeof timestamp.toDate ===
        "function"
    ) {

        return timestamp.toDate();

    }


    if (
        timestamp instanceof Date
    ) {

        return timestamp;

    }


    if (
        typeof timestamp === "string" ||
        typeof timestamp === "number"
    ) {

        const date =
            new Date(timestamp);


        return isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    if (
        timestamp.seconds !== undefined
    ) {

        return new Date(
            timestamp.seconds * 1000
        );

    }


    return null;

}


function getTimestampValue(
    timestamp
) {

    const date =
        timestampToDate(
            timestamp
        );


    return date
        ? date.getTime()
        : 0;

}


function formatDate(
    timestamp
) {

    const date =
        timestampToDate(
            timestamp
        );


    if (!date) {
        return "—";
    }


    return date.toLocaleDateString(
        "en-KE",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function normalizeStatus(
    status
) {

    if (!status) {
        return "Pending";
    }


    return String(status)
        .charAt(0)
        .toUpperCase() +
        String(status)
            .slice(1)
            .toLowerCase();

}


function showLoading() {

    customersEmpty.hidden = true;


    customersTable.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="table-loading"
            >

                <div class="loading-spinner"></div>

                Loading customers...

            </td>

        </tr>

    `;

}


function showMessage(
    text,
    type
) {

    customerMessage.textContent =
        text;

    customerMessage.className =
        `customer-message ${type}`;


    setTimeout(
        () => {

            customerMessage.textContent =
                "";

            customerMessage.className =
                "customer-message";

        },
        4000
    );

}


function escapeHTML(
    value
) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}