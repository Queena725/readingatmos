import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPCccXfpfufLnzEFqFBdFdUAQbG0Qkr6w",
  authDomain: "currents-a4b7d.firebaseapp.com",
  projectId: "currents-a4b7d",
  storageBucket: "currents-a4b7d.firebasestorage.app",
  messagingSenderId: "313458595372",
  appId: "1:313458595372:web:b450cdef59794491cbe389",
  measurementId: "G-FYYLPTH7NH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ARTICLE_LOADING_DELAY = 3000;
let isArticleTransitioning = false;
const DEFAULT_LOGO = "data:image/svg+xml,%3Csvg viewBox='0 0 318 303' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M258.737 243.684C248.931 166.791 229.591.501 172.983.5 116.374.499 96.231 141.984 74.659 237.941 53.086 333.898-30.091 308.403 29.281 231.917 88.653 155.432 258.737 160.696 303.844 237.941 348.951 315.186 268.543 320.578 258.737 243.684Z' fill='none' stroke='black' stroke-width='4'/%3E%3Cpath d='M103.805 106.472C181.432-57.303 237.164 110.325 237.164 110.325S218 3 173.746.5C129.558-1.996 108.095 88.404 103.824 106.39Z' fill='black'/%3E%3Cpath d='M260 248.5C273.5 334.5 350.5 309.5 302 236c35.301 58.835-26 68.5-42 12.5Z' fill='black'/%3E%3Cpath d='M68.775 256.196C41.319 332.681-33.477 300.558 37.125 224.073-6.021 275.063 43.28 309.147 68.775 256.196Z' fill='black'/%3E%3C/svg%3E";
const fallbackArticles = [
  {
    title: "The Overview",
    keywords: ["climate", "earth", "visual"],
    image: "images/0410_theoverview.jpg",
    url: "https://atmos.earth/"
  },
  {
    title: "As The Crow Flies",
    keywords: ["migration", "landscape"],
    image: "images/as-the-crow-flies.jpg",
    url: "https://atmos.earth/"
  },
  {
    title: "Climate Disasters Are Not Natural",
    keywords: ["climate", "disaster"],
    image: "images/0401_fema_climatedisasters.jpg",
    url: "https://atmos.earth/"
  },
  {
    title: "Border Wall Big Bend",
    keywords: ["border", "ecology"],
    image: "images/0408_borderwall_bigbend.jpg",
    url: "https://atmos.earth/"
  },
  {
    title: "National Security Drilling",
    keywords: ["energy", "politics"],
    image: "images/0415_nationalsecurity_drilling.jpg",
    url: "https://atmos.earth/"
  }
];

const fallbackImages = [
  "images/0410_theoverview.jpg",
  "images/as-the-crow-flies.jpg",
  "images/0401_fema_climatedisasters.jpg",
  "images/0408_borderwall_bigbend.jpg",
  "images/0415_nationalsecurity_drilling.jpg",
  "images/0422_earthday_science.jpg",
  "images/0429_gunmakers_fossilfuel.jpg",
  "images/mimicry-flower-main.jpg",
  "images/processual-biology.jpg",
  "images/rainbow.jpg"
];

const wallPositions = [
  [270],
  [300],
  [210],
  [320],
  [250],
  [285],
  [230],
  [310],
  [205],
  [265],
  [295],
  [235]
];

function buildLogoVariant(article, index = 0) {
  const moodSource = [
    article.logoMood,
    article.logoMotion,
    article.logoScale,
    article.category,
    article.title
  ]
    .filter(Boolean)
    .join(" ");
  const moodValue = Array.from(moodSource).reduce((total, char) => total + char.charCodeAt(0), index);
  const strokeWidth = 1 + (moodValue % 5) * 0.52;
  const dashOptions = ["none", "1 8", "4 10", "12 16", "22 12"];
  const dash = dashOptions[moodValue % dashOptions.length];
  const scale = 0.92 + ((moodValue % 7) * 0.018);
  const svg = `<svg viewBox="0 0 318 303" xmlns="http://www.w3.org/2000/svg"><g transform="translate(159 151.5) scale(${scale}) translate(-159 -151.5)"><path d="M258.737 243.684C248.931 166.791 229.591.501 172.983.5 116.374.499 96.231 141.984 74.659 237.941 53.086 333.898-30.091 308.403 29.281 231.917 88.653 155.432 258.737 160.696 303.844 237.941 348.951 315.186 268.543 320.578 258.737 243.684Z" fill="none" stroke="black" stroke-width="${strokeWidth}" stroke-dasharray="${dash}"/><path d="M103.805 106.472C181.432-57.303 237.164 110.325 237.164 110.325S218 3 173.746.5C129.558-1.996 108.095 88.404 103.824 106.39Z" fill="black"/><path d="M260 248.5C273.5 334.5 350.5 309.5 302 236c35.301 58.835-26 68.5-42 12.5Z" fill="black"/><path d="M68.775 256.196C41.319 332.681-33.477 300.558 37.125 224.073-6.021 275.063 43.28 309.147 68.775 256.196Z" fill="black"/></g></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function getArticleLogo(article, index = 0) {
  return article.logoId || article.logo || article.logoImage || buildLogoVariant(article, index);
}

function getImageValue(value) {
  if (Array.isArray(value)) {
    return value[0];
  }

  if (value && typeof value === "object") {
    return value.url || value.src || value.path || value.file;
  }

  return value;
}

function getArticleImage(article, index = 0) {
  const imageValue =
    getImageValue(article.images) ||
    getImageValue(article.image) ||
    getImageValue(article.imageUrl) ||
    getImageValue(article.imageSrc) ||
    getImageValue(article.thumbnail) ||
    getImageValue(article.thumbnailUrl) ||
    getImageValue(article.heroImage) ||
    getImageValue(article.photo);

  return (
    imageValue ||
    article.image?.url ||
    article.image?.src ||
    article.thumbnail?.url ||
    article.heroImage?.url ||
    article.image ||
    article.imageUrl ||
    article.imageSrc ||
    article.thumbnail ||
    article.thumbnailUrl ||
    article.heroImage ||
    fallbackImages[index % fallbackImages.length]
  );
}

function setWallVisual(article, index = 0) {
  const wallLogo = document.querySelector("#wallLogo");
  const wallCenter = document.querySelector(".wall-center");

  if (!wallLogo || !wallCenter) return;

  wallCenter.classList.add("is-changing");

  window.setTimeout(() => {
    wallLogo.onerror = () => {
      wallLogo.onerror = null;
      wallLogo.src = buildLogoVariant(article, index);
    };
    wallLogo.src = article ? getArticleLogo(article, index) : DEFAULT_LOGO;

    wallCenter.classList.remove("is-changing");
  }, 90);
}

function getSearchText(article) {
  return [
    article.title,
    article.category,
    article.summary,
    article.date,
    article.publishedAt,
    article.keywords ? article.keywords.join(" ") : ""
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function applyWallPosition(card, index) {
  const position = wallPositions[index % wallPositions.length];

  card.style.setProperty("--tile-h", `${position[0]}px`);
}

function renderArticles(articles) {
  const articleList = document.querySelector("#articleList");
  const searchInput = document.querySelector("#articleSearch");

  if (!articleList) {
    console.log("No #articleList found in HTML");
    return;
  }

  articleList.innerHTML = "";

  articles.forEach((article, index) => {
    const card = document.createElement("button");
    const title = document.createElement("h3");
    const image = document.createElement("img");

    card.type = "button";
    article._wallIndex = index;
    card.classList.add("article-card");
    card.dataset.index = String(index + 1).padStart(2, "0");
    card.dataset.search = getSearchText(article);
    applyWallPosition(card, index);

    title.textContent = article.title || "Untitled article";
    image.alt = "";
    image.loading = "lazy";
    image.src = getArticleImage(article, index);
    image.onerror = () => {
      image.onerror = null;
      image.src = fallbackImages[index % fallbackImages.length];
    };

    card.appendChild(title);
    card.appendChild(image);

    card.addEventListener("mouseenter", () => setWallVisual(article, index));
    card.addEventListener("focus", () => setWallVisual(article, index));

    card.addEventListener("click", () => {
      console.log("Logo mood:", article.logoMood);
      console.log("Logo motion:", article.logoMotion);
      console.log("Logo scale:", article.logoScale);
      showArticleLoadingTransition(article);
    });

    articleList.appendChild(card);
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();

      articleList.querySelectorAll(".article-card").forEach((card) => {
        card.classList.toggle("is-hidden", query && !card.dataset.search.includes(query));
      });
    });
  }
}

function showArticleLoadingTransition(article) {
  if (!article.url || isArticleTransitioning) return;

  const overlay = document.querySelector("#articleLoadingOverlay");
  const loadingLogo = document.querySelector("#articleLoadingLogo");

  if (!overlay || !loadingLogo) {
    window.location.href = article.url;
    return;
  }

  isArticleTransitioning = true;
  loadingLogo.onerror = () => {
    loadingLogo.onerror = null;
    loadingLogo.src = buildLogoVariant(article, article._wallIndex || 0);
  };
  loadingLogo.src = getArticleLogo(article, article._wallIndex || 0);
  overlay.classList.add("is-visible");
  overlay.setAttribute("aria-hidden", "false");

  window.setTimeout(() => {
    window.location.href = article.url;
  }, ARTICLE_LOADING_DELAY);
}

async function loadArticles() {
  if (!document.querySelector("#articleList")) return;

  try {
    const querySnapshot = await getDocs(collection(db, "articles"));
    const articles = [];

    querySnapshot.forEach((doc) => {
      articles.push(doc.data());
    });

    renderArticles(articles.length ? articles : fallbackArticles);
  } catch (error) {
    console.warn("Could not load articles from Firestore. Showing local wall preview.", error);
    renderArticles(fallbackArticles);
  }
}

loadArticles();

window.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#heroStickySection");
  const rightPanel = document.querySelector(".hero-right");
  const microBar = document.querySelector(".micro-bar");
  const path = document.querySelector(".draw-path");
  const fills = document.querySelectorAll(".logo-fill");
  const logoGroup = document.querySelector(".logo-group");
  const titleSlides = document.querySelectorAll(".hero-title-slide");
  const heroImages = [
    "images/0401_fema_climatedisasters.jpg",
    "images/0408_borderwall_bigbend.jpg",
    "images/0415_nationalsecurity_drilling.jpg",
    "images/0410_theoverview.jpg",
    "images/as-the-crow-flies.jpg"
  ];

  if (!section || !rightPanel || !path) return;

  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;

  if (titleSlides.length) {
    titleSlides.forEach((slide, index) => {
      const image = heroImages[index];

      if (!image) {
        slide.remove();
        return;
      }

      slide.style.backgroundImage = `url("${image}")`;
    });

    let activeSlideIndex = 0;
    const visibleSlides = Array.from(document.querySelectorAll(".hero-title-slide"));

    if (visibleSlides.length > 1) {
      window.setInterval(() => {
        visibleSlides[activeSlideIndex].classList.remove("is-active");
        activeSlideIndex = (activeSlideIndex + 1) % visibleSlides.length;
        visibleSlides[activeSlideIndex].classList.add("is-active");
      }, 4000);
    }
  }

  function updateHero() {
    const scrollY = window.scrollY;
    const sectionTop = section.offsetTop;
    const total = Math.max(section.offsetHeight - window.innerHeight, 1);
    const passed = Math.min(Math.max(scrollY - sectionTop, 0), total);
    const progress = passed / total;

    // Start releasing the right panel as soon as the black bar enters the viewport.
    if (window.innerWidth > 1200 && microBar) {
      const microBarTop = microBar.getBoundingClientRect().top;

      if (microBarTop <= window.innerHeight) {
        rightPanel.classList.add("is-bottom");
      } else {
        rightPanel.classList.remove("is-bottom");
      }
    } else {
      rightPanel.classList.remove("is-bottom");
    }

    // logo draw progress
    const start = 0.02;
    const end = 0.55;
    let mapped = (progress - start) / (end - start);
    mapped = Math.max(0, Math.min(1, mapped));

    path.style.strokeDashoffset = length * (1 - mapped);

    fills.forEach((fill) => {
      fill.style.opacity = 1;
    });

    // 확대/이동 효과 제거
    if (logoGroup) {
      logoGroup.setAttribute("transform", "translate(0 0) scale(1)");
    }
  }

  updateHero();
  window.addEventListener("scroll", updateHero, { passive: true });
  window.addEventListener("resize", updateHero);
});
