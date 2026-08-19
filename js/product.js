import { products } from "../data/products.js";

const container = document.getElementById("productContainer");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const product = products.find(
    item => item.id === productId
);


function formatPrice(price) {

    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0
    }).format(price);

}


function renderProduct() {

    if (!product) {

        container.innerHTML = `
            <div class="product-not-found">

                <h1>Product not found</h1>

                <p>
                    Sorry, we couldn't find that Revive product.
                </p>

                <a href="shop.html" class="btn btn-primary">
                    Return to Shop
                </a>

            </div>
        `;

        return;
    }


    document.title = `${product.name} | REVIVE`;


    container.innerHTML = `

        <div class="product-detail">

            <div class="product-detail-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

            </div>


            <div class="product-detail-info">

                <span class="eyebrow">
                    ${product.category}
                </span>

                <h1>
                    ${product.name}
                </h1>

                <strong class="product-price">
                    ${formatPrice(product.price)}
                </strong>

                <p class="product-description">
                    ${product.description}
                </p>


                <div class="product-stock">

                    ${
                        product.stock > 0
                        ? `✓ ${product.stock} available`
                        : `Out of stock`
                    }

                </div>


                <div class="quantity-control">

                    <button
                        type="button"
                        id="decreaseQuantity"
                    >
                        −
                    </button>

                    <span id="quantity">
                        1
                    </span>

                    <button
                        type="button"
                        id="increaseQuantity"
                    >
                        +
                    </button>

                </div>


                <button
                    type="button"
                    class="btn btn-primary add-to-cart"
                    id="addToCart"
                    ${product.stock <= 0 ? "disabled" : ""}
                >
                    Add to Cart →
                </button>


                <div
                    class="product-message"
                    id="productMessage"
                ></div>


                <div class="product-details">

                    <div>
                        <strong>Category</strong>
                        <span>${product.category}</span>
                    </div>

                    <div>
                        <strong>Availability</strong>
                        <span>
                            ${product.stock > 0 ? "In stock" : "Out of stock"}
                        </span>
                    </div>

                </div>

            </div>

        </div>
    `;


    setupCart();
}


function setupCart() {

    let quantity = 1;

    const quantityDisplay =
        document.getElementById("quantity");

    const decrease =
        document.getElementById("decreaseQuantity");

    const increase =
        document.getElementById("increaseQuantity");

    const addButton =
        document.getElementById("addToCart");

    const message =
        document.getElementById("productMessage");


    decrease.addEventListener("click", () => {

        if (quantity > 1) {
            quantity--;
            quantityDisplay.textContent = quantity;
        }

    });


    increase.addEventListener("click", () => {

        if (quantity < product.stock) {
            quantity++;
            quantityDisplay.textContent = quantity;
        }

    });


    addButton.addEventListener("click", () => {

        let cart =
            JSON.parse(localStorage.getItem("reviveCart")) || [];


        const existing =
            cart.find(item => item.id === product.id);


        if (existing) {

            existing.quantity += quantity;

        } else {

            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
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

    });

}


function updateCartCount() {

    const cart =
        JSON.parse(localStorage.getItem("reviveCart")) || [];

    const count =
        cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

    const cartCount =
        document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = count;
    }

}


const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}


renderProduct();
updateCartCount();