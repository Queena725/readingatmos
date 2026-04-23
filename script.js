window.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#heroStickySection");
  const rightPanel = document.querySelector(".hero-right");
  const microBar = document.querySelector(".micro-bar");
  const path = document.querySelector(".draw-path");
  const fills = document.querySelectorAll(".logo-fill");
  const logoGroup = document.querySelector(".logo-group");

  if (!section || !rightPanel || !path) return;

  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;

  function updateHero() {
    const scrollY = window.scrollY;
    const sectionTop = section.offsetTop;
    const total = Math.max(section.offsetHeight - window.innerHeight, 1);
    const passed = Math.min(Math.max(scrollY - sectionTop, 0), total);
    const progress = passed / total;

    // black bar가 보이기 "직전" 오른쪽 fixed 해제
    if (window.innerWidth > 1200 && microBar) {
      const microBarTop = microBar.getBoundingClientRect().top;
      const releaseEarly = 80; // 더 빨리 풀고 싶으면 120~160으로 올려
      const releasePoint = window.innerHeight + releaseEarly;

      if (microBarTop <= releasePoint) {
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
      fill.style.opacity = mapped;
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