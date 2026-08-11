const WHATSAPP_NUMBER = "254701743478";

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const backTop = document.getElementById("backTop");
  const year = document.getElementById("year");
  const toast = document.getElementById("toast");

  // Beautiful entrance loader.
  window.setTimeout(() => loader.classList.add("hide"), 1150);

  // Mobile menu.
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
  });

  document.querySelectorAll(".main-nav a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
    });
  });

  // Scroll reveal.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  // Back to top.
  window.addEventListener("scroll", () => {
    backTop.classList.toggle("show", window.scrollY > 700);
  });
  backTop.addEventListener("click", () => window.scrollTo({top: 0, behavior: "smooth"}));

  year.textContent = new Date().getFullYear();

  // WhatsApp links.
  const baseMessage = "Hi Revive Scents and Skin Care Solutions! I'd like to ask about your products and services.";
  document.querySelectorAll(".whatsapp-link").forEach(link => {
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(baseMessage)}`;
  });

  // Concern cards: give the visitor useful context without pretending stock exists.
  document.querySelectorAll(".concern-card").forEach(card => {
    card.addEventListener("click", () => {
      showToast(card.dataset.message);
    });
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.reviveToastTimer);
    window.reviveToastTimer = setTimeout(() => toast.classList.remove("show"), 4200);
  }

  // Skin quiz.
  const quiz = document.getElementById("skinQuiz");
  const questions = [...document.querySelectorAll(".quiz-question")];
  const next = document.getElementById("quizNext");
  const back = document.getElementById("quizBack");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const result = document.getElementById("quizResult");
  const quizWhatsapp = document.getElementById("quizWhatsapp");
  const restart = document.getElementById("quizRestart");

  let step = 1;

  function updateQuiz() {
    questions.forEach(q => q.classList.toggle("active", Number(q.dataset.step) === step));
    progressText.textContent = `Question ${step} of ${questions.length}`;
    progressBar.style.width = `${(step / questions.length) * 100}%`;
    back.disabled = step === 1;
    next.innerHTML = step === questions.length ? "See My Result <span>→</span>" : "Next <span>→</span>";
  }

  function selectedValue(name) {
    const checked = quiz.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : null;
  }

  next.addEventListener("click", () => {
    const current = selectedValue(`q${step}`);
    if (!current) {
      showToast("Pick the answer that feels closest to you first ♡");
      return;
    }
    if (step < questions.length) {
      step++;
      updateQuiz();
    } else {
      showQuizResult();
    }
  });

  back.addEventListener("click", () => {
    if (step > 1) {
      step--;
      updateQuiz();
    }
  });

  function showQuizResult() {
    const values = questions.map((_, i) => selectedValue(`q${i + 1}`)).filter(Boolean);
    const counts = {dry:0, oily:0, combination:0, normal:0, sensitive:0};
    values.forEach(v => { if (counts[v] !== undefined) counts[v]++; });

    let type = Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0];

    const q4 = selectedValue("q4");
    const concernMap = {
      breakouts: "breakout-conscious care",
      tone: "uneven-tone support",
      hydration: "hydration & barrier-friendly care",
      maintenance: "simple maintenance"
    };

    const profiles = {
      dry: {
        title: "Dry-leaning skin",
        text: "Your answers lean toward skin that may need more gentle cleansing, consistent moisturising and a routine that protects comfort instead of stripping it.",
        tags: ["Gentle cleanse", "Moisturise", "Daily SPF"]
      },
      oily: {
        title: "Oily-leaning skin",
        text: "Your answers lean toward skin that gets shiny easily. A simple routine that cleanses without over-stripping and keeps hydration in the picture is a better starting point than piling on harsh products.",
        tags: ["Gentle cleanse", "Light hydration", "Daily SPF"]
      },
      combination: {
        title: "Combination-leaning skin",
        text: "Your answers suggest different areas of your face behave differently. Think balanced care rather than treating your entire face as if it has one personality.",
        tags: ["Balance", "Targeted care", "Daily SPF"]
      },
      sensitive: {
        title: "Sensitivity-aware routine",
        text: "Your answers suggest your skin may be easily irritated. Keep things simple, introduce products slowly and pay attention to how your skin responds.",
        tags: ["Simple routine", "Patch test", "Gentle care"]
      },
      normal: {
        title: "Balanced-looking skin",
        text: "Your answers lean toward a comfortable, fairly balanced skin profile. The win here is maintenance: gentle cleansing, moisturising and consistent sun protection.",
        tags: ["Maintain", "Hydrate", "Daily SPF"]
      }
    };

    // If sensitivity appears, favour the sensitivity-aware result.
    if (counts.sensitive >= 2) type = "sensitive";

    const profile = profiles[type] || profiles.normal;
    document.querySelector("#resultTitle").textContent = profile.title;
    document.querySelector("#resultText").textContent =
      profile.text + (q4 && concernMap[q4] ? ` Your main focus right now: ${concernMap[q4]}.` : "");

    document.querySelector("#resultTags").innerHTML = profile.tags.map(tag => `<span>${tag}</span>`).join("");

    const resultMessage =
      `Hi Revive Scents and Skin Care Solutions! I took the Revive Skin Check. ` +
      `My starting point is "${profile.title}" and my main concern is "${concernMap[q4] || "general skin care"}". ` +
      `I'd like help choosing a suitable routine.`;

    quizWhatsapp.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(resultMessage)}`;

    quiz.hidden = true;
    result.hidden = false;
    document.querySelector(".quiz-intro").style.display = "none";
    document.querySelector(".quiz-panel").scrollIntoView({behavior:"smooth", block:"center"});
  }

  restart.addEventListener("click", () => {
    quiz.reset();
    step = 1;
    quiz.hidden = false;
    result.hidden = true;
    document.querySelector(".quiz-intro").style.display = "";
    updateQuiz();
  });

  // Prevent placeholder "more" links from jumping to the top.
  document.querySelectorAll('.more-card a[href="#"]').forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Send Revive a WhatsApp message to ask what is currently available ♡");
    });
  });

  updateQuiz();
});
