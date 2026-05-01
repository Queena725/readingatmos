import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
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

let articlesData = [];
const logoCache = {};

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
      keywords = article.keywords.join(" • ");
    } else if (typeof article.keywords === "string") {
      keywords = article.keywords;
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
    <p class="article-category">${article.category || ""}</p>
    <h2>${article.title || "Untitled Article"}</h2>
    <p class="article-date">${article.date || ""}</p>
    <p class="article-summary">${article.summary || ""}</p>
    <p class="article-keywords">${keywords}</p>
    <a href="${article.url || "#"}" target="_blank">Read article</a>
  </div>
`;

card.addEventListener("pointerenter", () => {
  updateArchiveLogo(article);
});

card.addEventListener("pointerleave", () => {
  resetArchiveLogo();
});

card.addEventListener("click", () => {
  updateArchiveLogo(article);
});

allArticles.appendChild(card);


  });
}

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

if (searchInput) {
  searchInput.addEventListener("input", searchArticles);
}

if (searchButton && searchInput) {
  searchButton.addEventListener("click", () => {
    searchInput.classList.toggle("is-open");

    if (searchInput.classList.contains("is-open")) {
      searchButton.style.display = "none";
      searchInput.focus();
    }
  });
}

if (searchInput) {
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      searchInput.classList.remove("is-open");
      searchInput.value = "";
      searchButton.style.display = "inline";
      renderArticles(articlesData);
    }
  });
}



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

async function updateArchiveLogo(article) {
  const logoText = document.querySelector("#archiveLogoText");
  const logoImage = document.querySelector("#archiveLogoImage");

  if (!logoText || !logoImage) return;

  const logoId = article.logoId || analyzeArticleForLogo(article);
  const logoData = await getLogoData(logoId);

  console.log("Hovered article:", article.title);
  console.log("Using logoId:", logoId);
  console.log("Logo data:", logoData);

  if (!logoData || !logoData.file) {
    console.warn("Missing logo file for:", logoId);
    return;
  }

  logoText.style.display = "none";
  logoImage.style.display = "block";
  logoImage.src = `./${logoData.file}`;
}

function resetArchiveLogo() {
  const logoText = document.querySelector("#archiveLogoText");
  const logoImage = document.querySelector("#archiveLogoImage");

  if (!logoText || !logoImage) return;

  logoImage.style.display = "none";
  logoImage.src = "";
  logoText.style.display = "inline";
}

fetchArticles();

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