const WHATSAPP = "254701743478";

const productDatabase = {

    face: {

        title: "Face Care",
        eyebrow: "THE FACE EDIT",
        description:
            "Build a face-care ritual that feels good, looks good and works with your skin's needs.",
        hero: "FACE · GLOW · CARE",

        filters: ["All", "Cleansers", "Serums", "Moisturisers", "Treatment", "SPF"],

        products: [

            {
                name: "Gentle Face Cleanser",
                type: "Cleansers",
                description: "A soft everyday cleanse for a fresh, comfortable feeling.",
                tag: "EVERYDAY"
            },

            {
                name: "Foaming Face Wash",
                type: "Cleansers",
                description: "A refreshing wash for removing everyday oil and buildup.",
                tag: "FRESH"
            },

            {
                name: "Hydrating Face Wash",
                type: "Cleansers",
                description: "A moisture-focused cleanser for skin that often feels dry.",
                tag: "HYDRATION"
            },

            {
                name: "Vitamin C Serum",
                type: "Serums",
                description: "A brightening-focused serum for a fresh-looking complexion.",
                tag: "GLOW"
            },

            {
                name: "Niacinamide Serum",
                type: "Serums",
                description: "A simple addition to routines focused on balanced-looking skin.",
                tag: "BALANCE"
            },

            {
                name: "Hyaluronic Acid Serum",
                type: "Serums",
                description: "A hydration-focused serum for skin that needs extra moisture.",
                tag: "HYDRATION"
            },

            {
                name: "Daily Face Moisturiser",
                type: "Moisturisers",
                description: "An everyday moisturising step for soft, comfortable skin.",
                tag: "DAILY"
            },

            {
                name: "Light Gel Moisturiser",
                type: "Moisturisers",
                description: "A lightweight moisturising option for a fresh finish.",
                tag: "LIGHTWEIGHT"
            },

            {
                name: "Face Toner",
                type: "Treatment",
                description: "A refreshing step to complement your cleansing routine.",
                tag: "REFRESH"
            },

            {
                name: "Face Exfoliating Scrub",
                type: "Treatment",
                description: "A polishing step for a smoother-feeling skin routine.",
                tag: "POLISH"
            },

            {
                name: "Daily Sunscreen",
                type: "SPF",
                description: "Daily sun protection for routines that don't skip the essentials.",
                tag: "ESSENTIAL"
            },

            {
                name: "Under-Eye Care",
                type: "Treatment",
                description: "A dedicated addition to a gentle, complete face-care ritual.",
                tag: "CARE"
            }

        ]

    },


    body: {

        title: "Body Care",
        eyebrow: "THE BODY EDIT",
        description:
            "Soft skin is an everyday ritual. Discover washes, scrubs, lotions and oils for head-to-toe care.",
        hero: "BODY · SOFTNESS · RITUAL",

        filters: ["All", "Cleansing", "Exfoliation", "Moisturising", "Oils", "Targeted"],

        products: [

            {
                name: "Daily Body Wash",
                type: "Cleansing",
                description: "A refreshing everyday body-cleansing essential.",
                tag: "DAILY"
            },

            {
                name: "Refreshing Shower Gel",
                type: "Cleansing",
                description: "A fragrant shower ritual designed to leave you feeling refreshed.",
                tag: "REFRESH"
            },

            {
                name: "Body Scrub",
                type: "Exfoliation",
                description: "A polishing body-care step for smoother-feeling skin.",
                tag: "POLISH"
            },

            {
                name: "Coffee Body Scrub",
                type: "Exfoliation",
                description: "A rich exfoliating ritual for your weekly body-care routine.",
                tag: "RITUAL"
            },

            {
                name: "Daily Body Lotion",
                type: "Moisturising",
                description: "An everyday moisturising essential for soft skin.",
                tag: "DAILY"
            },

            {
                name: "Rich Body Butter",
                type: "Moisturising",
                description: "A richer moisturising ritual for skin that craves comfort.",
                tag: "RICH CARE"
            },

            {
                name: "Body Oil",
                type: "Oils",
                description: "A nourishing-feeling oil for a beautiful post-shower ritual.",
                tag: "GLOW"
            },

            {
                name: "Glow Body Oil",
                type: "Oils",
                description: "A body-care finishing step for a radiant-looking finish.",
                tag: "GLOW"
            },

            {
                name: "Hand Cream",
                type: "Targeted",
                description: "Dedicated moisture for hands that need a little extra care.",
                tag: "HANDS"
            },

            {
                name: "Heel & Foot Care",
                type: "Targeted",
                description: "A focused ritual for dry-feeling feet and heels.",
                tag: "FEET"
            },

            {
                name: "Elbow & Knee Care",
                type: "Targeted",
                description: "A dedicated body-care step for areas that tend to feel rough.",
                tag: "TARGETED"
            },

            {
                name: "Complete Body Care Set",
                type: "Targeted",
                description: "A curated combination for a full body-care ritual.",
                tag: "SET"
            }

        ]

    },


    targeted: {

        title: "Targeted Care",
        eyebrow: "CARE WITH A FOCUS",
        description:
            "For the little things that can affect how you feel in your skin — from breakouts to uneven tone and shaving concerns.",
        hero: "FOCUS · CARE · CONFIDENCE",

        filters: ["All", "Face", "Underarms", "Shaving", "Body", "Sensitive"],

        products: [

            {
                name: "Breakout Care",
                type: "Face",
                description: "A targeted routine starter for blemish-prone skin.",
                tag: "FOCUS"
            },

            {
                name: "Dark Spot Care",
                type: "Face",
                description: "A care-focused option for routines targeting uneven-looking tone.",
                tag: "TONE"
            },

            {
                name: "Uneven Tone Routine",
                type: "Face",
                description: "A collection concept for creating a more consistent skin-care routine.",
                tag: "ROUTINE"
            },

            {
                name: "Underarm Care",
                type: "Underarms",
                description: "A gentle care routine for fresh, comfortable underarms.",
                tag: "CARE"
            },

            {
                name: "Ingrown Hair Care",
                type: "Shaving",
                description: "A focused routine for skin affected by shaving and ingrown hairs.",
                tag: "SHAVE CARE"
            },

            {
                name: "Razor Bump Care",
                type: "Shaving",
                description: "A post-shaving care option for bump-prone skin.",
                tag: "SHAVING"
            },

            {
                name: "External Bikini Care",
                type: "Body",
                description: "Gentle external skin care for a comfortable personal-care routine.",
                tag: "GENTLE"
            },

            {
                name: "Dark Knee Care",
                type: "Body",
                description: "A targeted body-care routine for knees and other rough areas.",
                tag: "TARGETED"
            },

            {
                name: "Dark Elbow Care",
                type: "Body",
                description: "Focused care for elbows that need extra attention.",
                tag: "TARGETED"
            },

            {
                name: "Heel Repair Care",
                type: "Body",
                description: "A focused routine for dry, rough-feeling heels.",
                tag: "FOOT CARE"
            },

            {
                name: "Sensitive Skin Essentials",
                type: "Sensitive",
                description: "A simple-care concept for people who prefer gentle routines.",
                tag: "GENTLE"
            },

            {
                name: "Post-Shave Skin Care",
                type: "Shaving",
                description: "A calming-feeling addition to a shaving routine.",
                tag: "AFTERCARE"
            }

        ]

    },


    scents: {

        title: "Scents",
        eyebrow: "THE REVIVE SCENT EDIT",
        description:
            "Find a scent that feels like you — soft, sweet, fresh, bold, mysterious or unforgettable.",
        hero: "SCENT · MEMORY · MOOD",

        filters: ["All", "Women's", "Men's", "Unisex", "Body Mist", "Oils"],

        products: [

            {
                name: "Signature Women's Perfume",
                type: "Women's",
                description: "A feminine fragrance concept for everyday confidence.",
                tag: "SIGNATURE"
            },

            {
                name: "Soft Floral Perfume",
                type: "Women's",
                description: "A delicate fragrance direction for softer moods.",
                tag: "FLORAL"
            },

            {
                name: "Sweet & Warm Perfume",
                type: "Women's",
                description: "A warmer scent direction for evenings and special moments.",
                tag: "WARM"
            },

            {
                name: "Signature Men's Fragrance",
                type: "Men's",
                description: "A confident fragrance option for everyday wear.",
                tag: "MEN"
            },

            {
                name: "Fresh Men's Fragrance",
                type: "Men's",
                description: "A clean, fresh scent direction for daytime wear.",
                tag: "FRESH"
            },

            {
                name: "Unisex Everyday Fragrance",
                type: "Unisex",
                description: "A versatile scent designed for anyone who loves it.",
                tag: "UNISEX"
            },

            {
                name: "Body Mist",
                type: "Body Mist",
                description: "A lighter fragrance option for refreshing throughout the day.",
                tag: "LIGHT"
            },

            {
                name: "Sweet Body Mist",
                type: "Body Mist",
                description: "A playful fragrance layer for your everyday routine.",
                tag: "SWEET"
            },

            {
                name: "Fragrance Oil",
                type: "Oils",
                description: "A concentrated-feeling fragrance option for scent layering.",
                tag: "OIL"
            },

            {
                name: "Roll-On Perfume",
                type: "Oils",
                description: "A convenient fragrance format for carrying with you.",
                tag: "ON-THE-GO"
            },

            {
                name: "Perfume Layering Set",
                type: "Unisex",
                description: "A curated scent concept for creating your own fragrance combination.",
                tag: "LAYER"
            },

            {
                name: "Revive Fragrance Gift Set",
                type: "Unisex",
                description: "A beautiful fragrance idea for gifting someone special.",
                tag: "GIFT"
            }

        ]

    },


    men: {

        title: "Men's Care",
        eyebrow: "THE GENTLEMEN'S EDIT",
        description:
            "Simple, effective grooming essentials for face, beard, body, shaving and everyday confidence.",
        hero: "MEN · GROOMING · CONFIDENCE",

        filters: ["All", "Face", "Beard", "Shaving", "Body", "Fragrance"],

        products: [

            {
                name: "Men's Face Wash",
                type: "Face",
                description: "A straightforward cleansing step for everyday men's grooming.",
                tag: "FACE"
            },

            {
                name: "Men's Moisturiser",
                type: "Face",
                description: "An everyday moisturising essential for comfortable skin.",
                tag: "FACE"
            },

            {
                name: "Beard Oil",
                type: "Beard",
                description: "A grooming essential for a softer-feeling, well-kept beard.",
                tag: "BEARD"
            },

            {
                name: "Beard Balm",
                type: "Beard",
                description: "A styling and grooming addition for keeping the beard looking neat.",
                tag: "BEARD"
            },

            {
                name: "Beard Wash",
                type: "Beard",
                description: "A dedicated cleansing step for beard-care routines.",
                tag: "BEARD"
            },

            {
                name: "Aftershave Care",
                type: "Shaving",
                description: "A post-shave addition to help complete a grooming ritual.",
                tag: "SHAVE"
            },

            {
                name: "Shaving Cream",
                type: "Shaving",
                description: "A smoother-feeling shaving routine essential.",
                tag: "SHAVE"
            },

            {
                name: "Razor Bump Care",
                type: "Shaving",
                description: "Targeted care for skin affected by frequent shaving.",
                tag: "CARE"
            },

            {
                name: "Men's Body Wash",
                type: "Body",
                description: "A fresh everyday body-cleansing essential.",
                tag: "BODY"
            },

            {
                name: "Men's Body Lotion",
                type: "Body",
                description: "Everyday moisture for comfortable body skin.",
                tag: "BODY"
            },

            {
                name: "Men's Signature Fragrance",
                type: "Fragrance",
                description: "A confident scent concept for everyday and evening wear.",
                tag: "SCENT"
            },

            {
                name: "Men's Grooming Set",
                type: "Fragrance",
                description: "A curated combination for a complete grooming routine.",
                tag: "SET"
            }

        ]

    },


    hair: {

        title: "Hair & Style",
        eyebrow: "THE CROWN EDIT",
        description:
            "Protect your crown and make your everyday hair ritual feel a little more beautiful.",
        hero: "HAIR · STYLE · PROTECTION",

        filters: ["All", "Bonnets", "Hair Care", "Scalp", "Styling", "Sets"],

        products: [

            {
                name: "Satin Bonnet",
                type: "Bonnets",
                description: "A satin-style sleep essential designed to help protect your hairstyle.",
                tag: "PROTECT"
            },

            {
                name: "Extra-Large Bonnet",
                type: "Bonnets",
                description: "More room for larger hairstyles and protective styles.",
                tag: "PROTECT"
            },

            {
                name: "Satin Hair Scarf",
                type: "Bonnets",
                description: "A versatile hair-protection accessory for everyday styling.",
                tag: "STYLE"
            },

            {
                name: "Nourishing Hair Oil",
                type: "Hair Care",
                description: "A simple addition to a moisture-focused hair routine.",
                tag: "CARE"
            },

            {
                name: "Hair Moisturiser",
                type: "Hair Care",
                description: "A moisture-focused product concept for dry-feeling hair.",
                tag: "MOISTURE"
            },

            {
                name: "Scalp Care Oil",
                type: "Scalp",
                description: "A scalp-care addition for massage and regular hair routines.",
                tag: "SCALP"
            },

            {
                name: "Edge Care",
                type: "Styling",
                description: "A styling essential for neat-looking edges.",
                tag: "STYLE"
            },

            {
                name: "Protective Style Care",
                type: "Styling",
                description: "A routine concept for caring for hair while wearing protective styles.",
                tag: "PROTECT"
            },

            {
                name: "Hair Treatment",
                type: "Hair Care",
                description: "A deeper-care option for your regular hair routine.",
                tag: "TREATMENT"
            },

            {
                name: "Detangling Care",
                type: "Hair Care",
                description: "A care-focused addition to make wash-day routines easier.",
                tag: "CARE"
            },

            {
                name: "Dera Collection",
                type: "Styling",
                description: "Beautiful dera styles for adding personality to your wardrobe.",
                tag: "STYLE"
            },

            {
                name: "Hair & Bonnet Gift Set",
                type: "Sets",
                description: "A thoughtful combination for someone who loves caring for their crown.",
                tag: "GIFT"
            }

        ]

    }

};


let currentCategory = "face";
let currentFilter = "All";


function getCategory() {

    const params = new URLSearchParams(window.location.search);

    const requested = params.get("category");

    if (requested && productDatabase[requested]) {
        return requested;
    }

    return "face";
}


function setupCategory() {

    currentCategory = getCategory();

    const category = productDatabase[currentCategory];

    document.title =
        `${category.title} | Revive Scents & Skin Care Solutions`;

    document.getElementById("collectionEyebrow").textContent =
        category.eyebrow;

    document.getElementById("collectionTitle").innerHTML =
        `Find your <em>${category.title.toLowerCase()} ritual.</em>`;

    document.getElementById("collectionDescription").textContent =
        category.description;

    document.getElementById("heroCategory").textContent =
        category.hero;

    document.getElementById("productsHeading").innerHTML =
        `${category.title}, <em>your way.</em>`;

    document
        .querySelectorAll("[data-category-link]")
        .forEach(link => {

            link.classList.toggle(
                "active",
                link.dataset.categoryLink === currentCategory
            );

        });

    buildFilters(category);

    renderProducts(category.products);

}


function buildFilters(category) {

    const container =
        document.getElementById("productFilters");

    container.innerHTML = "";

    category.filters.forEach(filter => {

        const button = document.createElement("button");

        button.textContent = filter;

        button.className =
            filter === "All"
                ? "active"
                : "";

        button.addEventListener("click", () => {

            currentFilter = filter;

            document
                .querySelectorAll(".product-filter")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            renderProducts(category.products);

        });

        button.classList.add("product-filter");

        container.appendChild(button);

    });

}


function renderProducts(products) {

    const grid =
        document.getElementById("productsGrid");

    const filtered =
        currentFilter === "All"
            ? products
            : products.filter(
                product =>
                    product.type === currentFilter
            );

    document.getElementById("productCount").textContent =
        filtered.length;

    grid.innerHTML = "";

    filtered.forEach((product, index) => {

        const card = document.createElement("article");

        card.className = "product-card";

        card.innerHTML = `

            <div class="product-image">

                <div class="product-placeholder">

                    <span>RS</span>

                    <small>
                        ${product.tag}
                    </small>

                </div>

                <div class="product-number">
                    ${String(index + 1).padStart(2, "0")}
                </div>

                <div class="availability">
                    STOCK UPDATE SOON
                </div>

            </div>

            <div class="product-information">

                <span class="product-type">
                    ${product.type}
                </span>

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ${product.description}
                </p>

                <div class="product-bottom">

                    <span class="price">
                        Price on request
                    </span>

                    <a
                        href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                            `Hi Revive! I'm interested in the ${product.name}. Please let me know if it is currently available and the price.`
                        )}"
                        target="_blank"
                        rel="noopener"
                        class="order-button">

                        Ask / Order
                        <span>↗</span>

                    </a>

                </div>

            </div>
        `;

        grid.appendChild(card);

    });

}


document.addEventListener("DOMContentLoaded", () => {

    setupCategory();

    document.getElementById("year").textContent =
        new Date().getFullYear();

    setTimeout(() => {

        document
            .getElementById("pageLoader")
            .classList.add("loaded");

    }, 700);

});