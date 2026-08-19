import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    db,
    auth
} from "./firebase-config.js";


// =====================================================
// ELEMENTS
// =====================================================

const productForm =
    document.getElementById("productForm");

const productModal =
    document.getElementById("productModal");

const productsTable =
    document.getElementById("productsTable");

const addProductButton =
    document.getElementById("addProductButton");

const closeProductModal =
    document.getElementById("closeProductModal");

const modalTitle =
    document.getElementById("modalTitle");

const productMessage =
    document.getElementById("productMessage");

const productId =
    document.getElementById("productId");

const productName =
    document.getElementById("productName");

const productCategory =
    document.getElementById("productCategory");

const productPrice =
    document.getElementById("productPrice");

const productStock =
    document.getElementById("productStock");

const productImage =
    document.getElementById("productImage");

const productDescription =
    document.getElementById("productDescription");

const productActive =
    document.getElementById("productActive");

const imagePreview =
    document.getElementById("imagePreview");


// =====================================================
// ADMIN CONFIGURATION
// =====================================================

const ADMIN_EMAIL = "ianmutuli36@gmail.com";


// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

auth.onAuthStateChanged((user) => {

    if (!user) {

        window.location.href =
            "../auth/login.html";

        return;
    }


    if (user.email !== ADMIN_EMAIL) {

        alert(
            "You are not authorised to access the admin area."
        );

        window.location.href =
            "../index.html";

        return;
    }

});


// =====================================================
// IMAGE COMPRESSION
// =====================================================

function compressImage(file) {

    return new Promise((resolve, reject) => {

        if (!file) {
            resolve("");
            return;
        }


        if (!file.type.startsWith("image/")) {

            reject(
                new Error("Please select a valid image.")
            );

            return;
        }


        const reader =
            new FileReader();


        reader.onload = (event) => {

            const image =
                new Image();


            image.onload = () => {

                const MAX_WIDTH = 900;
                const MAX_HEIGHT = 900;

                let width = image.width;
                let height = image.height;


                // Keep original proportions

                if (
                    width > MAX_WIDTH ||
                    height > MAX_HEIGHT
                ) {

                    const ratio =
                        Math.min(
                            MAX_WIDTH / width,
                            MAX_HEIGHT / height
                        );

                    width =
                        Math.round(
                            width * ratio
                        );

                    height =
                        Math.round(
                            height * ratio
                        );

                }


                const canvas =
                    document.createElement(
                        "canvas"
                    );


                canvas.width = width;
                canvas.height = height;


                const context =
                    canvas.getContext(
                        "2d"
                    );


                context.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );


                // JPEG compression

                const compressedImage =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.78
                    );


                resolve(
                    compressedImage
                );

            };


            image.onerror = () => {

                reject(
                    new Error(
                        "Unable to process image."
                    )
                );

            };


            image.src =
                event.target.result;

        };


        reader.onerror = () => {

            reject(
                new Error(
                    "Unable to read image."
                )
            );

        };


        reader.readAsDataURL(file);

    });

}


// =====================================================
// IMAGE PREVIEW
// =====================================================

productImage.addEventListener(
    "change",
    () => {

        const file =
            productImage.files[0];


        if (!file) {

            return;

        }


        if (!file.type.startsWith("image/")) {

            showMessage(
                "Please select an image file.",
                "error"
            );

            productImage.value = "";

            return;

        }


        const reader =
            new FileReader();


        reader.onload = (event) => {

            imagePreview.innerHTML = `

                <img
                    src="${event.target.result}"
                    alt="Product preview"
                >

            `;

        };


        reader.readAsDataURL(file);

    }
);


// =====================================================
// OPEN ADD PRODUCT MODAL
// =====================================================

addProductButton.addEventListener(
    "click",
    () => {

        productForm.reset();

        productId.value = "";

        productActive.checked = true;

        imagePreview.innerHTML = "";

        modalTitle.textContent =
            "Add Product";

        productModal.classList.add(
            "active"
        );

    }
);


// =====================================================
// CLOSE PRODUCT MODAL
// =====================================================

closeProductModal.addEventListener(
    "click",
    () => {

        productModal.classList.remove(
            "active"
        );

    }
);


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

    productsTable.innerHTML = `

        <tr>

            <td colspan="6">
                Loading products...
            </td>

        </tr>

    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        if (snapshot.empty) {

            productsTable.innerHTML = `

                <tr>

                    <td colspan="6">

                        No products yet.
                        Click "+ Add Product"
                        to create one.

                    </td>

                </tr>

            `;

            return;

        }


        productsTable.innerHTML = "";


        snapshot.forEach(
            (documentSnapshot) => {

                const product =
                    documentSnapshot.data();


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        <div class="admin-product-name">

                            ${
                                product.image
                                    ? `

                                        <img
                                            src="${escapeHTML(product.image)}"
                                            alt="${escapeHTML(
                                                product.name ||
                                                "Product"
                                            )}"
                                        >

                                    `
                                    : ""
                            }

                            <strong>

                                ${escapeHTML(
                                    product.name ||
                                    "Unnamed"
                                )}

                            </strong>

                        </div>

                    </td>


                    <td>

                        ${escapeHTML(
                            product.category ||
                            "-"
                        )}

                    </td>


                    <td>

                        KSh ${
                            (
                                Number(
                                    product.price
                                ) || 0
                            ).toLocaleString()
                        }

                    </td>


                    <td>

                        ${
                            Number(
                                product.stock
                            ) || 0
                        }

                    </td>


                    <td>

                        ${
                            product.active

                                ? `

                                    <span class="status active">
                                        Active
                                    </span>

                                  `

                                : `

                                    <span class="status inactive">
                                        Inactive
                                    </span>

                                  `
                        }

                    </td>


                    <td>

                        <button
                            class="edit-product"
                            data-id="${documentSnapshot.id}"
                            type="button"
                        >
                            Edit
                        </button>


                        <button
                            class="delete-product"
                            data-id="${documentSnapshot.id}"
                            type="button"
                        >
                            Delete
                        </button>

                    </td>

                `;


                productsTable.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );


        productsTable.innerHTML = `

            <tr>

                <td colspan="6">

                    Unable to load products.

                </td>

            </tr>

        `;

    }

}


// =====================================================
// ADD / EDIT PRODUCT
// =====================================================

productForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            productName.value.trim();

        const category =
            productCategory.value;

        const price =
            Number(
                productPrice.value
            );

        const stock =
            Number(
                productStock.value
            );

        const description =
            productDescription.value.trim();

        const active =
            productActive.checked;


        if (!name || !category) {

            showMessage(
                "Please complete the required fields.",
                "error"
            );

            return;

        }


        if (price < 0 || stock < 0) {

            showMessage(
                "Price and stock cannot be negative.",
                "error"
            );

            return;

        }


        const saveButton =
            document.getElementById(
                "saveProductButton"
            );


        saveButton.disabled = true;

        saveButton.textContent =
            "Saving...";


        try {

            let imageData = "";


            // =================================================
            // PROCESS NEW IMAGE
            // =================================================

            const file =
                productImage.files[0];


            if (file) {

                showMessage(
                    "Processing product image...",
                    "success"
                );


                imageData =
                    await compressImage(
                        file
                    );


                /*
                 * Safety check.
                 *
                 * Firestore documents have size limits.
                 * If the compressed image is still too large,
                 * stop before attempting to save.
                 */

                const approximateSize =
                    imageData.length * 0.75;


                const MAX_IMAGE_SIZE =
                    900 * 1024;


                if (
                    approximateSize >
                    MAX_IMAGE_SIZE
                ) {

                    throw new Error(
                        "Image is still too large after compression."
                    );

                }

            }


            // =================================================
            // UPDATE EXISTING PRODUCT
            // =================================================

            if (productId.value) {

                const productRef =
                    doc(
                        db,
                        "products",
                        productId.value
                    );


                const updateData = {

                    name,

                    category,

                    price,

                    stock,

                    description,

                    active,

                    updatedAt:
                        serverTimestamp()

                };


                /*
                 * Only replace the image if
                 * the administrator selected
                 * a new image.
                 */

                if (imageData) {

                    updateData.image =
                        imageData;

                }


                await updateDoc(
                    productRef,
                    updateData
                );


                showMessage(
                    "Product updated successfully.",
                    "success"
                );

            }


            // =================================================
            // CREATE NEW PRODUCT
            // =================================================

            else {

                await addDoc(
                    collection(
                        db,
                        "products"
                    ),
                    {

                        name,

                        category,

                        price,

                        stock,

                        image:
                            imageData || "",

                        description,

                        active,

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }
                );


                showMessage(
                    "Product added successfully.",
                    "success"
                );

            }


            // =================================================
            // RESET
            // =================================================

            productModal.classList.remove(
                "active"
            );

            productForm.reset();

            imagePreview.innerHTML = "";


            await loadProducts();


        } catch (error) {

            console.error(
                "Product save error:",
                error
            );


            if (
                error.message ===
                "Image is still too large after compression."
            ) {

                showMessage(
                    "Image is too large. Please choose a smaller image.",
                    "error"
                );

            } else {

                showMessage(
                    "Unable to save product. Check your Firestore permissions.",
                    "error"
                );

            }

        } finally {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Save Product";

        }

    }
);


// =====================================================
// EDIT / DELETE BUTTONS
// =====================================================

productsTable.addEventListener(
    "click",
    async (event) => {

        const editButton =
            event.target.closest(
                ".edit-product"
            );


        const deleteButton =
            event.target.closest(
                ".delete-product"
            );


        if (editButton) {

            await editProduct(
                editButton.dataset.id
            );

        }


        if (deleteButton) {

            await deleteProduct(
                deleteButton.dataset.id
            );

        }

    }
);


// =====================================================
// EDIT PRODUCT
// =====================================================

async function editProduct(id) {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        const documentSnapshot =
            snapshot.docs.find(
                item =>
                    item.id === id
            );


        if (!documentSnapshot) {

            showMessage(
                "Product could not be found.",
                "error"
            );

            return;

        }


        const product =
            documentSnapshot.data();


        productId.value =
            id;


        productName.value =
            product.name || "";


        productCategory.value =
            product.category || "";


        productPrice.value =
            product.price || 0;


        productStock.value =
            product.stock || 0;


        productDescription.value =
            product.description || "";


        productActive.checked =
            product.active !== false;


        /*
         * File inputs cannot be populated
         * with an existing image.
         */

        productImage.value = "";


        if (product.image) {

            imagePreview.innerHTML = `

                <img
                    src="${escapeHTML(
                        product.image
                    )}"
                    alt="Current product image"
                >

                <small>

                    Current image.
                    Choose a new image to replace it.

                </small>

            `;

        } else {

            imagePreview.innerHTML = "";

        }


        modalTitle.textContent =
            "Edit Product";


        productModal.classList.add(
            "active"
        );


    } catch (error) {

        console.error(
            "Edit product error:",
            error
        );

        showMessage(
            "Unable to open product.",
            "error"
        );

    }

}


// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "products",
                id
            )
        );


        await loadProducts();


        showMessage(
            "Product deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        showMessage(
            "Unable to delete product.",
            "error"
        );

    }

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    message,
    type
) {

    productMessage.textContent =
        message;

    productMessage.className =
        `admin-message ${type}`;

}


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
// START
// =====================================================

loadProducts();