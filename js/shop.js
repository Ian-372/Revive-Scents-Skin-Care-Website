import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "./firebase-config.js";


const productGrid =
    document.getElementById("productGrid");

const productCount =
    document.getElementById("productCount");

const filters =
    document.querySelectorAll(".shop-filter");


let products = [];
let activeCategory = "all";


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
// LOAD PRODUCTS FROM FIRESTORE
// =====================================================

async function loadProducts() {

    if (!productGrid) return;


    productGrid.innerHTML = Array.from({ length: 4 }, () => `
        <div class="product-skeleton" aria-hidden="true">
            <span></span><span></span><span></span>
        </div>
    `).join("");


    try {
        const snapshot = await getDocs(
            collection(db, "products")
        );


        products = snapshot.docs.map(
            documentSnapshot => ({

                id: documentSnapshot.id,

                ...documentSnapshot.data()

            })
        ).filter(product => product.active !== false);


        console.log(
            "REVIVE products loaded:",
            products
        );


        renderProducts(activeCategory);


    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );


        productGrid.innerHTML = `
            <div class="empty-shop">

                <h3>
                    We couldn't load our products.
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>
        `;


        if (productCount) {

            productCount.textContent =
                "Unable to load products";

        }

    }

}


// =====================================================
// RENDER PRODUCTS
// =====================================================

function renderProducts(category = "all") {

    activeCategory = category;

    const filteredProducts =
        category === "all"

            ? products

            : products.filter(
                product =>
                String(product.category || "")
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "-") === category
            );


    if (productCount) {

        productCount.textContent =
            `${filteredProducts.length} product${filteredProducts.length === 1
                ? ""
                : "s"
            }`;

    }


    if (!filteredProducts.length) {

        productGrid.innerHTML = `

            <div class="empty-shop">

                <h3>
                    No products here yet.
                </h3>

                <p>
                    We're preparing this collection
                    for you.
                </p>

            </div>

        `;

        return;

    }


    productGrid.innerHTML =
        filteredProducts.map(product => `

        <article class="product-card">


            <!-- PRODUCT IMAGE -->

            <a
                href="product.html?id=${encodeURIComponent(product.id)}"
                class="product-image"
            >

                ${product.image

                ? `
                            <img
                                src="${escapeHTML(product.image)}"
                                alt="${escapeHTML(product.name)}"
                                loading="lazy"
                            >
                          `

                : `
                            <div class="product-image-placeholder">
                                REVIVE
                            </div>
                          `
            }


                ${product.featured

                ? `
                            <span class="product-badge">
                                FEATURED
                            </span>
                          `

                : ""
            }

            </a>


            <!-- PRODUCT INFORMATION -->

            <div class="product-info">


                <span class="product-category">

                    ${escapeHTML(
                product.category
                    ?.replace(
                        /^./,
                        letter =>
                            letter.toUpperCase()
                    ) || "REVIVE"
            )}

                </span>


                <h3>

                    ${escapeHTML(
                product.name ||
                "Unnamed Product"
            )}

                </h3>


                <p>

                    ${escapeHTML(
                product.description ||
                "A Revive care solution."
            )}

                </p>


                <div class="product-meta">


                    <strong>

                        ${formatPrice(
                product.price
            )}

                    </strong>


                    <span>

                        ${Number(product.stock) > 0

                ? `${Number(product.stock)} available`

                : "Out of stock"
            }

                    </span>


                </div>


                <a
                    href="product.html?id=${encodeURIComponent(product.id)}"
                    class="product-button"
                >

                    View Product

                    <span>↗</span>

                </a>


            </div>

        </article>

    `).join("");

}


// =====================================================
// CATEGORY FILTERS
// =====================================================

filters.forEach(filter => {

    filter.addEventListener(
        "click",
        () => {


            filters.forEach(button => {

                button.classList.remove(
                    "active"
                );

            });


            filter.classList.add(
                "active"
            );

            filters.forEach(button => {
                button.setAttribute(
                    "aria-selected",
                    String(button === filter)
                );
            });


            renderProducts(
                filter.dataset.filter
            );

        }
    );

});


// =====================================================
// START SHOP
// =====================================================

loadProducts();
