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


async function loadArticles() {
  const articleList = document.querySelector("#articleList");

  if (!articleList) {
    console.log("No #articleList found in HTML");
    return;
  }

  const querySnapshot = await getDocs(collection(db, "articles"));

  querySnapshot.forEach((doc) => {
    const article = doc.data();

    const card = document.createElement("div");
    card.classList.add("article-card");

    card.innerHTML = `
      <h3>${article.title}</h3>
      <p>${article.category}</p>
      <p>${article.summary || ""}</p>
      <p>${article.keywords ? article.keywords.join(", ") : ""}</p>
      <a href="${article.url}" target="_blank">Read article</a>
    `;

    card.addEventListener("click", () => {
      console.log("Logo mood:", article.logoMood);
      console.log("Logo motion:", article.logoMotion);
      console.log("Logo scale:", article.logoScale);
    });

    articleList.appendChild(card);
  });
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
