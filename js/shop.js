import { products } from "../data/products.js";

const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const filters = document.querySelectorAll(".shop-filter");


function formatPrice(price) {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0
    }).format(price);
}


function renderProducts(category = "all") {

    const filteredProducts =
        category === "all"
            ? products
            : products.filter(
                product => product.category === category
            );


    if (productCount) {
        productCount.textContent =
            `${filteredProducts.length} product${filteredProducts.length === 1 ? "" : "s"}`;
    }


    if (!filteredProducts.length) {

        productGrid.innerHTML = `
            <div class="empty-shop">
                <h3>No products here yet.</h3>
                <p>We're preparing this collection for you.</p>
            </div>
        `;

        return;
    }


    productGrid.innerHTML = filteredProducts.map(product => `

        <article class="product-card">

            <a
                href="product.html?id=${product.id}"
                class="product-image"
            >

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                ${
                    product.featured
                    ? `<span class="product-badge">FEATURED</span>`
                    : ""
                }

            </a>


            <div class="product-info">

                <span class="product-category">
                    ${product.category}
                </span>

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ${product.description}
                </p>


                <div class="product-meta">

                    <strong>
                        ${formatPrice(product.price)}
                    </strong>

                    <span>
                        ${
                            product.stock > 0
                            ? `${product.stock} available`
                            : "Out of stock"
                        }
                    </span>

                </div>


                <a
                    href="product.html?id=${product.id}"
                    class="product-button"
                >
                    View Product
                    <span>↗</span>
                </a>

            </div>

        </article>

    `).join("");
}


filters.forEach(filter => {

    filter.addEventListener("click", () => {

        filters.forEach(button =>
            button.classList.remove("active")
        );

        filter.classList.add("active");

        renderProducts(
            filter.dataset.filter
        );

    });

});


renderProducts();