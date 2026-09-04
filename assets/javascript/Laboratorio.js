(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.querySelector("[data-carousel]");
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
    const dotsContainer = carousel.querySelector("[data-carousel-dots]");
    const prevBtn = carousel.querySelector("[data-carousel-prev]");
    const nextBtn = carousel.querySelector("[data-carousel-next]");

    if (slides.length === 0) return;

    let currentIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
    if (currentIndex === -1) currentIndex = 0;

    function renderDots() {
      dotsContainer.innerHTML = "";
      slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "lab-carousel__dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", `Ir a la imagen ${index + 1}`);
        dot.addEventListener("click", () => goToSlide(index));
        dotsContainer.appendChild(dot);
      });
    }

    function updateView() {
      slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === currentIndex);
      });

      const dots = dotsContainer.querySelectorAll(".lab-carousel__dot");
      dots.forEach((dot, index) => {
        dot.setAttribute("aria-current", String(index === currentIndex));
      });
    }

    function goToSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      updateView();
    }

    prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));

    renderDots();
    updateView();
  });
})();