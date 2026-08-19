import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
    collection,
    doc,
    onSnapshot,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const orderCount = document.getElementById("orderCount");
const wishlistCount = document.getElementById("wishlistCount");
const addressCount = document.getElementById("addressCount");
const recentOrders = document.getElementById("recentOrders");

const formatCurrency = value => new Intl.NumberFormat("en-KE", {
    style: "currency", currency: "KES", maximumFractionDigits: 0
}).format(Number(value) || 0);

const dateValue = value => value?.toDate ? value.toDate() : new Date(0);

function renderRecentOrders(orders) {
    if (!recentOrders) return;
    if (!orders.length) {
        recentOrders.innerHTML = `
            <div class="empty-account-state"><div class="empty-account-icon">♡</div>
            <h3>No orders yet</h3><p>Your REVIVE purchases will appear here.</p>
            <a href="../shop.html" class="account-button">Explore the shop</a></div>`;
        return;
    }

    recentOrders.innerHTML = `<div class="account-order-list">${orders.slice(0, 3).map(order => {
        const reference = order.orderNumber || order.reference || order.id.slice(0, 8).toUpperCase();
        const total = order.total ?? order.grandTotal ?? order.totalAmount ?? 0;
        const status = String(order.orderStatus || order.status || "pending").replace(/(^|\s)\S/g, letter => letter.toUpperCase());
        const date = dateValue(order.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
        return `<a class="account-order-row" href="order-details.html?id=${encodeURIComponent(order.id)}">
            <span><strong>#${reference}</strong><small>${date}</small></span>
            <span class="account-order-status">${status}</span>
            <strong>${formatCurrency(total)}</strong></a>`;
    }).join("")}</div>`;
}

onAuthStateChanged(auth, user => {
    if (!user || !user.emailVerified) return;

    onSnapshot(query(collection(db, "orders"), where("userId", "==", user.uid)), snapshot => {
        const orders = snapshot.docs.map(item => ({ id: item.id, ...item.data() }))
            .sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt));
        if (orderCount) orderCount.textContent = String(orders.length);
        renderRecentOrders(orders);
    }, error => console.error("Unable to load dashboard orders:", error));

    onSnapshot(query(collection(db, "addresses"), where("userId", "==", user.uid)), snapshot => {
        if (addressCount) addressCount.textContent = String(snapshot.size);
    }, error => console.error("Unable to load dashboard addresses:", error));

    onSnapshot(doc(db, "wishlists", user.uid), snapshot => {
        const items = snapshot.exists() && Array.isArray(snapshot.data().items)
            ? snapshot.data().items : [];
        if (wishlistCount) wishlistCount.textContent = String(items.length);
    }, error => console.error("Unable to load dashboard wishlist:", error));
});
