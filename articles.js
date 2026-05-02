import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  serverTimestamp
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

const allArticles = document.querySelector("#allArticles");
const searchInput = document.querySelector("#articleSearch");
const searchButton = document.querySelector("#topSearchButton");
const searchWrap = document.querySelector("#archiveSearchWrap");
const searchHistoryPanel = document.querySelector("#searchHistoryPanel");
const searchHistoryList = document.querySelector("#searchHistoryList");
const logoText = document.querySelector("#archiveLogoText");
const logoImage = document.querySelector("#archiveLogoImage");

let articlesData = [];
const logoCache = {};
const SEARCH_HISTORY_KEY = "readingAtmosSearchHistory";
const SEARCH_HISTORY_LIMIT = 5;
const SESSION_ID_KEY = "readingAtmosSessionId";

/* Fetch articles */

async function fetchArticles() {
  try {
    const querySnapshot = await getDocs(collection(db, "articles"));

    articlesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("Firebase articles loaded:", articlesData);
    renderArticles(articlesData);
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
}

function getSessionId() {
  const existingSessionId = localStorage.getItem(SESSION_ID_KEY);

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId =
    globalThis.crypto?.randomUUID?.() ||
    `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  localStorage.setItem(SESSION_ID_KEY, sessionId);
  return sessionId;
}

async function saveSearchInteraction(query) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return;

  try {
    await addDoc(collection(db, "searchHistory"), {
      query: normalizedQuery,
      action: "search",
      sessionId: getSessionId(),
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving search history:", error);
  }
}

async function saveArticleViewInteraction(article) {
  try {
    await addDoc(collection(db, "userHistory"), {
      articleId: article.id || "",
      articleTitle: article.title || "",
      category: article.category || "",
      keywords: Array.isArray(article.keywords)
        ? article.keywords
        : article.keywords
          ? [article.keywords]
          : [],
      logoId: article.logoId || analyzeArticleForLogo(article),
      action: "article_view",
      sessionId: getSessionId(),
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving article view history:", error);
  }
}

function setLastOpenedCard(activeCard) {
  document.querySelectorAll(".article-card").forEach((item) => {
    item.classList.remove("is-last-opened");
  });

  activeCard.classList.add("is-last-opened");
}

/* Fetch logo data from Firebase collection: logo */

async function getLogoData(logoId) {
  if (!logoId) return null;

  if (logoCache[logoId]) {
    return logoCache[logoId];
  }

  const logoRef = doc(db, "logo", logoId);
  const logoSnap = await getDoc(logoRef);

  if (!logoSnap.exists()) {
    console.warn("No logo found for:", logoId);
    return null;
  }

  const logoData = logoSnap.data();
  logoCache[logoId] = logoData;

  return logoData;
}

/* Render articles */

function renderArticles(articles) {
  if (!allArticles) {
    console.error("No #allArticles found in HTML");
    return;
  }

  allArticles.innerHTML = "";

  if (articles.length === 0) {
    allArticles.innerHTML = `<p class="no-results">No articles found.</p>`;
    return;
  }

  articles.forEach((article) => {
    const card = document.createElement("article");
    card.classList.add("article-card");




    let keywords = "";

if (Array.isArray(article.keywords)) {
  keywords = article.keywords
    .map((keyword) => `<span class="keyword-pill">${keyword}</span>`)
    .join("");
} else if (typeof article.keywords === "string") {
  keywords = `<span class="keyword-pill">${article.keywords}</span>`;
}




    const imagePath = article.images || article.image || "";
    const fixedImagePath = imagePath.startsWith("http")
      ? imagePath
      : `./${imagePath}`;

    card.innerHTML = `
      <div class="article-image-wrap">
        <img src="${fixedImagePath}" alt="${article.title || "Article image"}" />
      </div>

      <div class="article-content">
        <p class="article-last-opened-label">Last opened</p>
        <p class="article-category">${article.category || ""}</p>
        <h2>${article.title || "Untitled Article"}</h2>
        <p class="article-date">${article.date || ""}</p>
        <p class="article-summary">${article.summary || ""}</p>
        <p class="article-keywords">${keywords}</p>
        <a href="${article.url || "#"}" target="_blank">Read article</a>
      </div>
    `;

    const readArticleLink = card.querySelector("a");

    if (readArticleLink) {
      readArticleLink.addEventListener("click", () => {
        setLastOpenedCard(card);
        saveArticleViewInteraction(article);
      });
    }

    card.addEventListener("click", () => {
      setLastOpenedCard(card);
      updateArchiveLogo(article);
    });
    allArticles.appendChild(card);
  });
}

/* Search */

function searchArticles() {
  if (!searchInput) return;

  const searchTerm = searchInput.value.toLowerCase().trim();

  const filteredArticles = articlesData.filter((article) => {
    const title = article.title?.toLowerCase() || "";
    const category = article.category?.toLowerCase() || "";
    const summary = article.summary?.toLowerCase() || "";
    const date = article.date?.toLowerCase() || "";
    const author = article.author?.toLowerCase() || "";
    const photographer = article.photographer?.toLowerCase() || "";

    let keywords = "";

    if (Array.isArray(article.keywords)) {
      keywords = article.keywords.join(" ").toLowerCase();
    } else if (typeof article.keywords === "string") {
      keywords = article.keywords.toLowerCase();
    }

    return (
      title.includes(searchTerm) ||
      category.includes(searchTerm) ||
      summary.includes(searchTerm) ||
      date.includes(searchTerm) ||
      author.includes(searchTerm) ||
      photographer.includes(searchTerm) ||
      keywords.includes(searchTerm)
    );
  });

  renderArticles(filteredArticles);
}

function getSearchHistory() {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to read search history:", error);
    return [];
  }
}

function setSearchHistory(history) {
  localStorage.setItem(
    SEARCH_HISTORY_KEY,
    JSON.stringify(history.slice(0, SEARCH_HISTORY_LIMIT))
  );
}

function renderSearchHistory() {
  if (!searchHistoryList) return;

  const history = getSearchHistory();
  searchHistoryList.innerHTML = "";

  history.forEach((term) => {
    const item = document.createElement("li");
    item.className = "archive-search-history-item";

    const termButton = document.createElement("button");
    termButton.type = "button";
    termButton.className = "archive-search-history-term";
    termButton.textContent = term;
    termButton.addEventListener("click", () => {
      if (!searchInput) return;
      searchInput.value = term;
      searchArticles();
      saveSearchTerm(term);
      openSearchHistory();
      searchInput.focus();
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "archive-search-history-remove";
    removeButton.setAttribute("aria-label", `Remove ${term}`);
    removeButton.textContent = "X";
    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      removeSearchTerm(term);
    });

    item.append(termButton, removeButton);
    searchHistoryList.appendChild(item);
  });
}

function openSearchHistory() {
  if (!searchHistoryPanel) return;
  renderSearchHistory();
  searchHistoryPanel.hidden = getSearchHistory().length === 0;
}

function closeSearchHistory() {
  if (!searchHistoryPanel) return;
  searchHistoryPanel.hidden = true;
}

function saveSearchTerm(term) {
  const normalizedTerm = term.trim();
  if (!normalizedTerm) return;

  const nextHistory = [
    normalizedTerm,
    ...getSearchHistory().filter(
      (item) => item.toLowerCase() !== normalizedTerm.toLowerCase()
    )
  ];

  setSearchHistory(nextHistory);
  renderSearchHistory();
}

function removeSearchTerm(term) {
  const nextHistory = getSearchHistory().filter((item) => item !== term);
  setSearchHistory(nextHistory);
  renderSearchHistory();

  if (nextHistory.length === 0) {
    closeSearchHistory();
  }
}

function commitCurrentSearch() {
  if (!searchInput) return;
  const term = searchInput.value.trim();
  if (!term) return;
  saveSearchTerm(term);
  saveSearchInteraction(term);
  searchArticles();
  openSearchHistory();
}

/* Logo selection */

function analyzeArticleForLogo(article) {
  if (article.logoId) {
    return article.logoId;
  }

  const keywords = Array.isArray(article.keywords)
    ? article.keywords.join(" ").toLowerCase()
    : "";

  const text = `
    ${article.title || ""}
    ${article.category || ""}
    ${article.summary || ""}
    ${keywords}
  `.toLowerCase();

  if (
    text.includes("chance") ||
    text.includes("origin") ||
    text.includes("improbable") ||
    text.includes("unknown") ||
    text.includes("possibility")
  ) {
    return "logo1";
  }

  if (
    text.includes("void") ||
    text.includes("loss") ||
    text.includes("grief") ||
    text.includes("mourning") ||
    text.includes("fragile")
  ) {
    return "logo3";
  }

  if (
    text.includes("memory") ||
    text.includes("love") ||
    text.includes("healing") ||
    text.includes("kinship") ||
    text.includes("care")
  ) {
    return "logo4";
  }

  if (
    text.includes("process") ||
    text.includes("biology") ||
    text.includes("evolution") ||
    text.includes("transformation") ||
    text.includes("becoming")
  ) {
    return "logo5";
  }

  if (
    text.includes("mimicry") ||
    text.includes("imitation") ||
    text.includes("adaptation")
  ) {
    return "logo6";
  }

  if (
    text.includes("science") ||
    text.includes("poetry") ||
    text.includes("wonder") ||
    text.includes("awe") ||
    text.includes("rainbow")
  ) {
    return "logo7";
  }

  if (
    text.includes("botanical") ||
    text.includes("flower") ||
    text.includes("growth") ||
    text.includes("renewal") ||
    text.includes("life")
  ) {
    return "logo8";
  }

  return "logo2";
}

/* Logo hover behavior */

async function updateArchiveLogo(article) {
  if (!logoText || !logoImage) return;

  const logoId = article.logoId || analyzeArticleForLogo(article);

  console.log("HOVER WORKS:", article.title);
  console.log("Using logoId:", logoId);

  const logoData = await getLogoData(logoId);
  console.log("Logo data:", logoData);

  let logoFile = "";

  if (logoData && logoData.file) {
    logoFile = logoData.file;
  } else {
    logoFile = `images/${logoId}.png`;
  }

 

logoImage.onload = () => {
  logoText.style.display = "none";
  logoImage.style.display = "block";

  logoImage.classList.remove("logo-glow");
  void logoImage.offsetWidth;
  logoImage.classList.add("logo-glow");
};

  logoImage.onerror = () => {
    console.warn("Logo image failed to load:", logoFile);
    logoImage.style.display = "none";
    logoText.style.display = "inline";
  };

  logoImage.src = `./${logoFile}`;
}

function resetArchiveLogo() {
  if (!logoText || !logoImage) return;

  logoImage.style.display = "none";
  logoImage.src = "";
  logoText.style.display = "inline";
}

/* Topbar search behavior */

if (searchInput) {
  searchInput.addEventListener("input", () => {
    searchArticles();
    openSearchHistory();
  });

  searchInput.addEventListener("focus", () => {
    openSearchHistory();
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitCurrentSearch();
      return;
    }

    if (event.key === "Escape") {
      closeSearchHistory();
      searchInput.value = "";
      renderArticles(articlesData);
    }
  });
}

if (searchButton && searchInput) {
  searchButton.addEventListener("click", () => {
    commitCurrentSearch();
    searchInput.focus();
  });
}

document.addEventListener("click", (event) => {
  if (!searchWrap) return;

  if (!searchWrap.contains(event.target)) {
    closeSearchHistory();
  }
});

renderSearchHistory();

fetchArticles();
