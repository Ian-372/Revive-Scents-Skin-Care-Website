import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase-config.js";


const container =
    document.getElementById("ordersContainer");


// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "../auth/login.html";
        return;
    }

    if (!user.emailVerified) {
        window.location.href = "../auth/verify-email.html";
        return;
    }

    await loadOrders(user.uid);

});


// =====================================================
// LOAD ORDERS
// =====================================================

async function loadOrders(userId) {

    try {

        const ordersRef =
            collection(db, "orders");

        const ordersQuery =
            query(
                ordersRef,
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );

        const snapshot =
            await getDocs(ordersQuery);


        if (snapshot.empty) {

            renderEmpty();

            return;

        }


        const orders =
            snapshot.docs.map(documentSnapshot => ({
                id: documentSnapshot.id,
                ...documentSnapshot.data()
            }));


        renderOrders(orders);


    } catch (error) {

        console.error(
            "Failed to load orders:",
            error
        );


        container.innerHTML = `

            <div class="orders-empty">

                <div class="empty-icon">
                    !
                </div>

                <h2>
                    Unable to load orders
                </h2>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }

}


// =====================================================
// EMPTY STATE
// =====================================================

function renderEmpty() {

    container.innerHTML = `

        <div class="orders-empty">

            <div class="empty-icon">
                ♡
            </div>

            <h2>
                No orders yet
            </h2>

            <p>
                Your REVIVE purchases will appear here.
            </p>

            <a
                href="../shop.html"
                class="btn btn-primary"
            >
                Start Shopping →
            </a>

        </div>

    `;

}


// =====================================================
// RENDER ORDERS
// =====================================================

function renderOrders(orders) {

    container.innerHTML = orders.map(order => {

        const date =
            order.createdAt?.toDate
                ? order.createdAt.toDate()
                : null;


        const formattedDate =
            date
                ? date.toLocaleDateString(
                    "en-KE",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                )
                : "Date unavailable";


        const items =
            Array.isArray(order.items)
                ? order.items
                : [];


        return `

            <article class="order-card">

                <div class="order-top">

                    <div>

                        <span class="order-label">
                            ORDER
                        </span>

                        <h2>
                            #${escapeHTML(
                                order.id
                                    .slice(0, 8)
                                    .toUpperCase()
                            )}
                        </h2>

                        <small>
                            ${formattedDate}
                        </small>

                    </div>


                    <span class="order-status ${getStatusClass(order.status)}">

                        ${escapeHTML(
                            formatStatus(order.status)
                        )}

                    </span>

                </div>


                <div class="order-items">

                    ${items.map(item => `

                        <div class="order-item">

                            <div class="order-item-image">

                                ${
                                    item.image
                                    ? `
                                        <img
                                            src="${escapeHTML(item.image)}"
                                            alt="${escapeHTML(
                                                item.name || "Product"
                                            )}"
                                        >
                                      `
                                    : "♡"
                                }

                            </div>


                            <div class="order-item-info">

                                <strong>
                                    ${escapeHTML(
                                        item.name || "Product"
                                    )}
                                </strong>

                                <span>
                                    Qty: ${
                                        Number(item.quantity) || 1
                                    }
                                </span>

                            </div>


                            <strong>
                                KSh ${(
                                    Number(item.price) *
                                    Number(item.quantity)
                                ).toLocaleString()}
                            </strong>

                        </div>

                    `).join("")}

                </div>


                <div class="order-bottom">

                    <span>
                        ${items.length}
                        ${items.length === 1 ? "item" : "items"}
                    </span>


                    <strong>
                        KSh ${(
                            Number(order.total) || 0
                        ).toLocaleString()}
                    </strong>

                </div>

            </article>

        `;

    }).join("");

}


// =====================================================
// STATUS
// =====================================================

function formatStatus(status) {

    if (!status) {
        return "Pending";
    }

    return status.charAt(0).toUpperCase() +
           status.slice(1);

}


function getStatusClass(status) {

    switch (status) {

        case "confirmed":
            return "confirmed";

        case "processing":
            return "processing";

        case "shipped":
            return "shipped";

        case "completed":
            return "completed";

        case "cancelled":
            return "cancelled";

        default:
            return "pending";
    }
}
// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
