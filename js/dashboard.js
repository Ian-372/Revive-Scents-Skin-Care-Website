import {
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    db,
    auth
} from "./firebase-config.js";


// =====================================================
// ADMIN CONFIG
// =====================================================

const ADMIN_EMAIL = "ianmutuli36@gmail.com";


// =====================================================
// STATE
// =====================================================

let allOrders = [];
let allProducts = [];
let allCustomers = [];

let salesChart = null;


// =====================================================
// ELEMENTS
// =====================================================

const totalSales =
    document.getElementById("totalSales");

const totalOrders =
    document.getElementById("totalOrders");

const totalCustomers =
    document.getElementById("totalCustomers");

const totalProducts =
    document.getElementById("totalProducts");

const pendingOrders =
    document.getElementById("pendingOrders");

const confirmedOrders =
    document.getElementById("confirmedOrders");

const processingOrders =
    document.getElementById("processingOrders");

const completedOrders =
    document.getElementById("completedOrders");

const cancelledOrders =
    document.getElementById("cancelledOrders");

const pendingOrderBadge =
    document.getElementById("pendingOrderBadge");

const recentOrders =
    document.getElementById("recentOrders");

const inventoryList =
    document.getElementById("inventoryList");

const periodSales =
    document.getElementById("periodSales");

const chartEmpty =
    document.getElementById("chartEmpty");

const salesPeriod =
    document.getElementById("salesPeriod");

const adminLogout =
    document.getElementById("adminLogout");


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


        await loadDashboard();

    }
);


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        await Promise.all([
            loadOrders(),
            loadProducts(),
            loadCustomers()
        ]);


        updateDashboardStats();

        renderRecentOrders();

        renderInventory();

        renderSalesChart();


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );


        recentOrders.innerHTML = `

            <div class="dashboard-error">

                Unable to load dashboard data.

                <small>
                    Check your Firebase permissions.
                </small>

            </div>

        `;

    }

}


// =====================================================
// LOAD ORDERS
// =====================================================

async function loadOrders() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "orders"
                )
            );


        allOrders =
            snapshot.docs.map(
                documentSnapshot => ({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                })
            );


    } catch (error) {

        console.error(
            "Failed to load orders:",
            error
        );

        allOrders = [];

    }

}


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        allProducts =
            snapshot.docs.map(
                documentSnapshot => ({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                })
            );


    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );

        allProducts = [];

    }

}


// =====================================================
// LOAD CUSTOMERS
// =====================================================

async function loadCustomers() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        allCustomers =
            snapshot.docs.map(
                documentSnapshot => ({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                })
            )
            .filter(
                user =>
                    user.role !== "admin"
            );


    } catch (error) {

        console.error(
            "Failed to load customers:",
            error
        );

        allCustomers = [];

    }

}


// =====================================================
// DASHBOARD STATISTICS
// =====================================================

function updateDashboardStats() {

    const revenue =
        allOrders.reduce(
            (total, order) => {

                const status =
                    normalizeStatus(
                        order.status
                    );


                if (
                    status === "cancelled"
                ) {

                    return total;

                }


                return total +
                    getOrderTotal(order);

            },
            0
        );


    totalSales.textContent =
        formatCurrency(revenue);


    totalOrders.textContent =
        allOrders.length;


    totalCustomers.textContent =
        allCustomers.length;


    const activeProducts =
        allProducts.filter(
            product =>
                product.active !== false
        );


    totalProducts.textContent =
        activeProducts.length;


    // ORDER STATUS

    const statusCounts =
        getOrderStatusCounts();


    pendingOrders.textContent =
        statusCounts.pending;


    confirmedOrders.textContent =
        statusCounts.confirmed;


    processingOrders.textContent =
        statusCounts.processing;


    completedOrders.textContent =
        statusCounts.completed;


    cancelledOrders.textContent =
        statusCounts.cancelled;


    pendingOrderBadge.textContent =
        statusCounts.pending;


    // INVENTORY ALERT

    const lowStock =
        allProducts.filter(
            product =>
                Number(product.stock) <= 5
        ).length;


    if (lowStock > 0) {

        document.getElementById(
            "stockAlert"
        ).textContent =
            `${lowStock} low stock`;

    } else {

        document.getElementById(
            "stockAlert"
        ).textContent =
            "Stock healthy";

    }

}


// =====================================================
// ORDER STATUS COUNTS
// =====================================================

function getOrderStatusCounts() {

    const counts = {

        pending: 0,

        confirmed: 0,

        processing: 0,

        completed: 0,

        cancelled: 0

    };


    allOrders.forEach(
        order => {

            const status =
                normalizeStatus(
                    order.status
                );


            if (
                status.includes(
                    "pending"
                )
            ) {

                counts.pending++;

            } else if (
                status.includes(
                    "confirm"
                )
            ) {

                counts.confirmed++;

            } else if (
                status.includes(
                    "process"
                )
            ) {

                counts.processing++;

            } else if (
                status.includes(
                    "complete"
                ) ||
                status.includes(
                    "delivered"
                )
            ) {

                counts.completed++;

            } else if (
                status.includes(
                    "cancel"
                )
            ) {

                counts.cancelled++;

            }

        }
    );


    return counts;

}


// =====================================================
// RECENT ORDERS
// =====================================================

function renderRecentOrders() {

    if (!allOrders.length) {

        recentOrders.innerHTML = `

            <div class="dashboard-empty">

                <span>
                    ♡
                </span>

                <h3>
                    No orders yet
                </h3>

                <p>
                    New REVIVE orders will appear here.
                </p>

            </div>

        `;

        return;

    }


    const sorted =
        [...allOrders]
            .sort(
                (
                    a,
                    b
                ) =>
                    getTimestamp(
                        b.createdAt
                    ) -
                    getTimestamp(
                        a.createdAt
                    )
            )
            .slice(
                0,
                6
            );


    recentOrders.innerHTML =
        sorted
            .map(
                order =>
                    createOrderRow(order)
            )
            .join("");

}


// =====================================================
// ORDER ROW
// =====================================================

function createOrderRow(order) {

    const customer =
        order.customerName ||
        order.name ||
        order.customer?.name ||
        order.email ||
        "Customer";


    const status =
        normalizeStatus(
            order.status
        );


    const date =
        formatDate(
            order.createdAt
        );


    return `

        <a
            href="orders.html"
            class="recent-order-row"
        >

            <div class="order-number">

                <strong>
                    #${escapeHTML(
                        order.id
                            .slice(0, 8)
                            .toUpperCase()
                    )}
                </strong>

                <span>
                    ${escapeHTML(date)}
                </span>

            </div>


            <div class="order-customer">

                <strong>
                    ${escapeHTML(customer)}
                </strong>

                <span>
                    ${getItemCount(order)}
                    item${getItemCount(order) === 1 ? "" : "s"}
                </span>

            </div>


            <strong class="order-total">
                ${formatCurrency(
                    getOrderTotal(order)
                )}
            </strong>


            <span
                class="
                    dashboard-status
                    ${getStatusClass(status)}
                "
            >
                ${escapeHTML(
                    capitalizeStatus(status)
                )}
            </span>


            <span class="row-arrow">
                →
            </span>

        </a>

    `;

}


// =====================================================
// INVENTORY
// =====================================================

function renderInventory() {

    if (!allProducts.length) {

        inventoryList.innerHTML = `

            <div class="dashboard-empty">

                <span>
                    ✦
                </span>

                <p>
                    No products in your catalogue.
                </p>

            </div>

        `;

        return;

    }


    const products =
        [...allProducts]
            .filter(
                product =>
                    product.active !== false
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    Number(a.stock || 0) -
                    Number(b.stock || 0)
            )
            .slice(
                0,
                6
            );


    inventoryList.innerHTML =
        products
            .map(
                product =>
                    createInventoryRow(
                        product
                    )
            )
            .join("");

}


// =====================================================
// INVENTORY ROW
// =====================================================

function createInventoryRow(product) {

    const stock =
        Number(
            product.stock
        ) || 0;


    let stockClass =
        "healthy";


    let stockText =
        "In stock";


    if (stock === 0) {

        stockClass =
            "out";

        stockText =
            "Out of stock";

    } else if (
        stock <= 5
    ) {

        stockClass =
            "low";

        stockText =
            "Low stock";

    }


    return `

        <a
            href="products.html"
            class="inventory-row"
        >

            <div class="inventory-product">

                ${
                    product.image

                        ? `

                            <img
                                src="${escapeHTML(
                                    product.image
                                )}"
                                alt=""
                            >

                          `

                        : `

                            <div class="inventory-placeholder">
                                ✦
                            </div>

                          `
                }


                <div>

                    <strong>
                        ${escapeHTML(
                            product.name ||
                            "Unnamed product"
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            product.category ||
                            "Product"
                        )}
                    </span>

                </div>

            </div>


            <div
                class="
                    inventory-stock
                    ${stockClass}
                "
            >

                <strong>
                    ${stock}
                </strong>

                <span>
                    ${stockText}
                </span>

            </div>

        </a>

    `;

}


// =====================================================
// SALES CHART
// =====================================================

function renderSalesChart() {

    const days =
        Number(
            salesPeriod.value
        ) || 7;


    const today =
        new Date();


    const labels = [];

    const values = [];


    for (
        let i = days - 1;
        i >= 0;
        i--
    ) {

        const date =
            new Date(today);


        date.setHours(
            0,
            0,
            0,
            0
        );


        date.setDate(
            today.getDate() - i
        );


        labels.push(
            date.toLocaleDateString(
                "en-KE",
                {
                    day: "numeric",
                    month: "short"
                }
            )
        );


        const dayStart =
            date.getTime();


        const dayEnd =
            dayStart +
            86400000;


        const revenue =
            allOrders
                .filter(
                    order => {

                        const timestamp =
                            getTimestamp(
                                order.createdAt
                            );


                        const status =
                            normalizeStatus(
                                order.status
                            );


                        return (
                            timestamp >= dayStart &&
                            timestamp < dayEnd &&
                            status !== "cancelled"
                        );

                    }
                )
                .reduce(
                    (
                        total,
                        order
                    ) =>
                        total +
                        getOrderTotal(order),
                    0
                );


        values.push(
            revenue
        );

    }


    const total =
        values.reduce(
            (
                sum,
                value
            ) =>
                sum + value,
            0
        );


    periodSales.textContent =
        formatCurrency(total);


    if (
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const canvas =
        document.getElementById(
            "salesChart"
        );


    if (!canvas) return;


    if (salesChart) {

        salesChart.destroy();

    }


    salesChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {

                            label:
                                "Sales",

                            data:
                                values,

                            borderWidth:
                                2,

                            tension:
                                0.4,

                            fill:
                                true,

                            pointRadius:
                                3,

                            pointHoverRadius:
                                6

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display:
                                false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                callback:
                                    value =>
                                        "KSh " +
                                        Number(
                                            value
                                        ).toLocaleString()

                            }

                        }

                    }

                }

            }
        );

}


// =====================================================
// PERIOD CHANGE
// =====================================================

salesPeriod.addEventListener(
    "change",
    renderSalesChart
);


// =====================================================
// LOGOUT
// =====================================================

adminLogout.addEventListener(
    "click",
    async () => {

        const confirmed =
            confirm(
                "Sign out of the REVIVE admin panel?"
            );


        if (!confirmed) return;


        try {

            await signOut(
                auth
            );


            window.location.href =
                "../auth/login.html";


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }
);


// =====================================================
// DATE
// =====================================================

document.getElementById(
    "currentDate"
).textContent =
    new Date().toLocaleDateString(
        "en-KE",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );


document.getElementById(
    "adminYear"
).textContent =
    new Date().getFullYear();


// =====================================================
// HELPERS
// =====================================================

function getOrderTotal(order) {

    return Number(
        order.total ??
        order.totalAmount ??
        order.amount ??
        order.grandTotal ??
        0
    ) || 0;

}


function getItemCount(order) {

    if (
        Array.isArray(
            order.items
        )
    ) {

        return order.items.reduce(
            (
                total,
                item
            ) =>
                total +
                (
                    Number(
                        item.quantity
                    ) || 1
                ),
            0
        );

    }


    return Number(
        order.itemCount
    ) || 1;

}


function normalizeStatus(status) {

    return String(
        status ||
        "pending"
    )
        .trim()
        .toLowerCase()
        .replaceAll(
            "_",
            " "
        );

}


function getStatusClass(status) {

    if (
        status.includes(
            "cancel"
        )
    ) {

        return "cancelled";

    }


    if (
        status.includes(
            "complete"
        ) ||
        status.includes(
            "deliver"
        )
    ) {

        return "completed";

    }


    if (
        status.includes(
            "process"
        )
    ) {

        return "processing";

    }


    if (
        status.includes(
            "confirm"
        )
    ) {

        return "confirmed";

    }


    return "pending";

}


function capitalizeStatus(status) {

    return status
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


function getTimestamp(value) {

    if (!value) return 0;


    if (
        typeof value.toMillis ===
        "function"
    ) {

        return value.toMillis();

    }


    if (
        value.seconds
    ) {

        return (
            value.seconds *
            1000
        );

    }


    const date =
        new Date(value);


    return isNaN(
        date.getTime()
    )
        ? 0
        : date.getTime();

}


function formatDate(value) {

    const timestamp =
        getTimestamp(value);


    if (!timestamp) {

        return "No date";

    }


    return new Date(
        timestamp
    ).toLocaleDateString(
        "en-KE",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


function formatCurrency(value) {

    return (
        "KSh " +
        Number(
            value || 0
        ).toLocaleString(
            "en-KE",
            {
                minimumFractionDigits:
                    0,
                maximumFractionDigits:
                    2
            }
        )
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