function initTraceGlossary() {
  const filterButtons = document.querySelectorAll(".trace-glossary-filter[data-trace-filter]");
  const traceItems = document.querySelectorAll("[data-trace-item]");
  const traceSections = document.querySelectorAll("[data-trace-section]");

  if (!filterButtons.length || !traceItems.length) return;

  function updateVisibleSections() {
    traceSections.forEach((section) => {
      const visibleItems = section.querySelectorAll("[data-trace-item]:not([hidden])");

      section.hidden = visibleItems.length === 0;
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.traceFilter;

      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      traceItems.forEach((item) => {
        const section = item.closest("[data-trace-section]");
        const isVisible =
          selectedFilter === "All" || section?.dataset.traceGroup === selectedFilter;

        item.hidden = !isVisible;
      });

      updateVisibleSections();
    });
  });

  updateVisibleSections();
}

window.addEventListener("DOMContentLoaded", initTraceGlossary);
