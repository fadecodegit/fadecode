/**
 * UTU Frontend — interacciones globales (mobile-first)
 */
(function () {
  "use strict";

  const NAV_COLLAPSE_ID = "siteNavCollapse";

  /** Cierra el menú móvil al elegir un enlace */
  function initMobileNavAutoClose() {
    const collapseEl = document.getElementById(NAV_COLLAPSE_ID);
    if (!collapseEl || typeof bootstrap === "undefined") return;

    const collapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, {
      toggle: false,
    });

    collapseEl.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 767.98px)").matches && collapseEl.classList.contains("show")) {
          collapse.hide();
        }
      });
    });
  }

  /** Feedback táctil en tarjetas de acción */
  function initPressFeedback() {
    const pressables = document.querySelectorAll(".hero-action, .btn-nav, .btn-footer-cta, .social-link, .offer-item");

    pressables.forEach((el) => {
      el.addEventListener("touchstart", () => el.classList.add("is-pressed"), { passive: true });
      el.addEventListener("touchend", () => el.classList.remove("is-pressed"), { passive: true });
      el.addEventListener("touchcancel", () => el.classList.remove("is-pressed"), { passive: true });
    });
  }

  function initChartsIfPresent() {
    const canvas = document.querySelector("[data-chart]");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // eslint-disable-next-line no-new
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Ene", "Feb", "Mar", "Abr", "May"],
        datasets: [
          {
            label: "Estadísticas",
            data: [12, 19, 8, 15, 11],
            backgroundColor: "#B88B5C",
            borderColor: "#181818",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#181818" },
          },
        },
        scales: {
          x: {
            ticks: { color: "#181818" },
            grid: { color: "rgba(24, 24, 24, 0.08)" },
          },
          y: {
            ticks: { color: "#181818" },
            grid: { color: "rgba(24, 24, 24, 0.08)" },
          },
        },
      },
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMobileNavAutoClose();
    initPressFeedback();
    initChartsIfPresent();
  });
})();