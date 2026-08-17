/* =========================================================
   REVIVE SHOP JAVASCRIPT
========================================================= */

const whatsappNumber = "254701743478";


/* =========================================================
   LOADER
========================================================= */

window.addEventListener("load", () => {

  setTimeout(() => {

    const loader = document.getElementById("shopLoader");

    if (loader) {
      loader.classList.add("loaded");
    }

  }, 900);

});


/* =========================================================
   WHATSAPP
========================================================= */

function openWhatsApp(message) {

  const url =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener");

}


/* =========================================================
   PRODUCT WHATSAPP BUTTONS
========================================================= */

document.querySelectorAll(".ask-product").forEach(button => {

  button.addEventListener("click", () => {

    const message =
      button.dataset.message ||
      "Hi Revive! I'd like to ask about your products.";

    openWhatsApp(message);

  });

});


/* =========================================================
   CATEGORY FILTER
========================================================= */

const filters =
  document.querySelectorAll(".shop-filter");

const cards =
  document.querySelectorAll(".product-card");

const catalogueStatus =
  document.getElementById("catalogueStatus");


function filterShop(category) {

  filters.forEach(filter => {

    filter.classList.toggle(
      "active",
      filter.dataset.filter === category
    );

  });


  cards.forEach(card => {

    const matches =
      category === "all" ||
      card.dataset.category === category;

    card.classList.toggle(
      "hidden",
      !matches
    );

  });


  const labels = {

    all: "all Revive collections",

    face: "face care",

    body: "body care",

    targeted: "targeted skin care",

    scent: "scents",

    men: "men's care",

    hair: "hair & style",

    feminine: "feminine wellness",

    hands: "hands & feet care"

  };


  catalogueStatus.textContent =
    `Showing ${labels[category] || "Revive collections"}`;

}


/* FILTER BUTTON EVENTS */

filters.forEach(filter => {

  filter.addEventListener("click", () => {

    filterShop(filter.dataset.filter);

    document
      .getElementById("catalogue")
      .scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

  });

});


/* =========================================================
   CATEGORY CARDS
========================================================= */

document
  .querySelectorAll("[data-category-link]")
  .forEach(card => {

    card.addEventListener("click", event => {

      event.preventDefault();

      const category =
        card.dataset.categoryLink;

      filterShop(category);

      document
        .getElementById("catalogue")
        .scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

    });

  });


/* =========================================================
   CONCERN BUTTONS
========================================================= */

document
  .querySelectorAll(".concern")
  .forEach(button => {

    button.addEventListener("click", () => {

      const category =
        button.dataset.category;

      filterShop(category);

      document
        .getElementById("catalogue")
        .scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

    });

  });


/* =========================================================
   SEARCH
========================================================= */

const searchToggle =
  document.getElementById("searchToggle");

const searchPanel =
  document.getElementById("searchPanel");

const closeSearch =
  document.getElementById("closeSearch");

const shopSearch =
  document.getElementById("shopSearch");


if (searchToggle) {

  searchToggle.addEventListener("click", () => {

    searchPanel.classList.add("open");

    setTimeout(() => {
      shopSearch.focus();
    }, 300);

  });

}


if (closeSearch) {

  closeSearch.addEventListener("click", () => {

    searchPanel.classList.remove("open");

    shopSearch.value = "";

    cards.forEach(card => {
      card.classList.remove("hidden");
    });

  });

}


/* PRODUCT SEARCH */

if (shopSearch) {

  shopSearch.addEventListener("input", () => {

    const query =
      shopSearch.value.trim().toLowerCase();

    cards.forEach(card => {

      const text =
        card.innerText.toLowerCase();

      const match =
        !query || text.includes(query);

      card.classList.toggle(
        "hidden",
        !match
      );

    });

  });

}


/* =========================================================
   SKIN TYPE QUIZ
========================================================= */

const startQuiz =
  document.getElementById("startQuiz");

const closeQuiz =
  document.getElementById("closeQuiz");

const quizModal =
  document.getElementById("quizModal");

const quizContent =
  document.getElementById("quizContent");

const quizProgress =
  document.getElementById("quizProgress");


const quizQuestions = [

  {
    question: "How does your skin usually feel after cleansing?",
    options: [
      {
        text: "Tight or uncomfortable",
        type: "dry"
      },
      {
        text: "Comfortable and balanced",
        type: "normal"
      },
      {
        text: "Shiny, especially around my forehead and nose",
        type: "oily"
      },
      {
        text: "Some areas feel dry while others get oily",
        type: "combination"
      }
    ]
  },

  {
    question: "How often do you experience breakouts?",
    options: [
      {
        text: "Rarely",
        type: "normal"
      },
      {
        text: "Sometimes",
        type: "combination"
      },
      {
        text: "Quite often",
        type: "oily"
      },
      {
        text: "My skin is often dry and irritated",
        type: "dry"
      }
    ]
  },

  {
    question: "What would you most like to improve?",
    options: [
      {
        text: "Hydration and softness",
        type: "dry"
      },
      {
        text: "Oiliness and breakouts",
        type: "oily"
      },
      {
        text: "Unevenness and combination areas",
        type: "combination"
      },
      {
        text: "Just maintaining healthy skin",
        type: "normal"
      }
    ]
  }

];


let currentQuestion = 0;

let skinAnswers = [];


function renderQuestion() {

  const question =
    quizQuestions[currentQuestion];

  const progress =
    ((currentQuestion) /
      quizQuestions.length) * 100;

  quizProgress.style.width =
    `${progress}%`;


  quizContent.innerHTML = `

    <h3 class="quiz-question">
      ${question.question}
    </h3>

    <div class="quiz-options">

      ${question.options.map((option, index) => `

        <button
          class="quiz-option"
          data-type="${option.type}"
        >
          ${option.text}
        </button>

      `).join("")}

    </div>

  `;


  document
    .querySelectorAll(".quiz-option")
    .forEach(option => {

      option.addEventListener("click", () => {

        skinAnswers.push(
          option.dataset.type
        );

        currentQuestion++;

        if (
          currentQuestion >=
          quizQuestions.length
        ) {

          showQuizResult();

        } else {

          renderQuestion();

        }

      });

    });

}


function showQuizResult() {

  quizProgress.style.width = "100%";


  const counts = {};

  skinAnswers.forEach(type => {

    counts[type] =
      (counts[type] || 0) + 1;

  });


  const result =
    Object.keys(counts)
      .sort((a,b) => counts[b] - counts[a])[0];


  const results = {

    dry: {
      title: "Your skin may lean dry.",
      text:
        "Your skin may appreciate gentle cleansing, rich hydration and nourishing moisturisers. Avoid over-cleansing and focus on keeping your skin comfortable."
    },

    oily: {
      title: "Your skin may lean oily.",
      text:
        "Your routine may benefit from lightweight hydration, gentle cleansing and products that help you care for excess oil without stripping your skin."
    },

    combination: {
      title: "Your skin may be combination.",
      text:
        "You may have areas that need different kinds of attention. A balanced routine can help you care for oily areas while keeping drier areas comfortable."
    },

    normal: {
      title: "Your skin may be balanced.",
      text:
        "Your main goal may be maintaining what is already working: gentle cleansing, hydration, sun protection and consistency."
    }

  };


  const resultData =
    results[result] || results.normal;


  quizContent.innerHTML = `

    <div class="quiz-result">

      <span class="eyebrow">
        YOUR REVIVE STARTING POINT
      </span>

      <h3>
        ${resultData.title}
      </h3>

      <p>
        ${resultData.text}
      </p>

      <br>

      <button
        class="btn btn-dark"
        id="quizWhatsApp"
      >
        Talk to Revive
        <span>↗</span>
      </button>

    </div>

  `;


  document
    .getElementById("quizWhatsApp")
    .addEventListener("click", () => {

      openWhatsApp(
        `Hi Revive! I just took the skin check on your website and my skin may lean ${result}. I'd like some guidance on products and a routine.`
      );

    });

}


if (startQuiz) {

  startQuiz.addEventListener("click", () => {

    currentQuestion = 0;

    skinAnswers = [];

    quizModal.classList.add("open");

    renderQuestion();

  });

}


if (closeQuiz) {

  closeQuiz.addEventListener("click", () => {

    quizModal.classList.remove("open");

  });

}


if (quizModal) {

  quizModal.addEventListener("click", event => {

    if (event.target === quizModal) {

      quizModal.classList.remove("open");

    }

  });

}


/* =========================================================
   URL CATEGORY SUPPORT
   Example:
   shop.html?category=face
========================================================= */

const requestedCategory =
  new URLSearchParams(
    window.location.search
  ).get("category");


const allowedCategories = [
  "face",
  "body",
  "targeted",
  "scent",
  "men",
  "hair",
  "feminine",
  "hands"
];


if (
  requestedCategory &&
  allowedCategories.includes(requestedCategory)
) {

  filterShop(requestedCategory);

  setTimeout(() => {

    document
      .getElementById("catalogue")
      .scrollIntoView({
        behavior: "smooth"
      });

  }, 1000);

}


/* =========================================================
   YEAR
========================================================= */

const year =
  document.getElementById("year");

if (year) {

  year.textContent =
    new Date().getFullYear();

}