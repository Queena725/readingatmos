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

let articlesData = [];

async function fetchArticles() {
  const querySnapshot = await getDocs(collection(db, "articles"));

  articlesData = querySnapshot.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data()
    };
  });

  renderPageArticles(articlesData);
}

function renderPageArticles(articles) {
  const featuredContainer = document.querySelector("#featuredArticles");
  const allContainer = document.querySelector("#allArticles");

  // Homepage: show only 3 articles
  if (featuredContainer) {
    featuredContainer.innerHTML = "";

    const featuredArticles = articles.slice(0, 3);

    featuredArticles.forEach((article) => {
      featuredContainer.appendChild(createArticleCard(article));
    });
  }

  // Articles page: show all articles
  if (allContainer) {
    allContainer.innerHTML = "";

    articles.forEach((article) => {
      allContainer.appendChild(createArticleCard(article));
    });
  }
}

function createArticleCard(article) {
  const card = document.createElement("div");
  card.classList.add("project-card", "article-card");

  const keywords = Array.isArray(article.keywords)
    ? article.keywords.join(" • ")
    : "";

card.innerHTML = `
  <div class="project-image-wrap article-image-wrap">
    <img src="${article.image || ""}" alt="${article.title || "Article image"}" />
  </div>

  <div class="project-meta">
    <span>${article.title || "Untitled Article"}</span>
    <span>${article.category || ""} ${keywords ? "• " + keywords : ""}</span>
  </div>

  <p class="article-summary">${article.summary || ""}</p>
`;
  card.addEventListener("click", () => {
    if (article.url) {
      window.open(article.url, "_blank");
    }

    applyLogoMood(article);
  });

  return card;
}

function setupArticleSearch() {
  const searchInput = document.querySelector("#articleSearch");
  const searchButton = document.querySelector("#searchButton");

  if (!searchInput) return;

  function runSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredArticles = articlesData.filter((article) => {
      const title = article.title?.toLowerCase() || "";
      const category = article.category?.toLowerCase() || "";
      const summary = article.summary?.toLowerCase() || "";
      const keywords = Array.isArray(article.keywords)
        ? article.keywords.join(" ").toLowerCase()
        : "";

      return (
        title.includes(searchTerm) ||
        category.includes(searchTerm) ||
        summary.includes(searchTerm) ||
        keywords.includes(searchTerm)
      );
    });

    renderPageArticles(filteredArticles);
  }

  searchInput.addEventListener("input", runSearch);

  if (searchButton) {
    searchButton.addEventListener("click", runSearch);
  }
}

function applyLogoMood(article) {
  const logoGroup = document.querySelector(".logo-group");

  if (!logoGroup) return;

  const scale = Number(article.logoScale) || 1;

  logoGroup.setAttribute("transform", `translate(0 0) scale(${scale})`);

  console.log("Article clicked:", article.title);
  console.log("Logo mood:", article.logoMood);
  console.log("Logo motion:", article.logoMotion);
}

fetchArticles().then(() => {
  setupArticleSearch();
});