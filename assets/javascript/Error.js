(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.querySelector("[data-error-back]");
    if (!backBtn) return;

    backBtn.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "index.html";
      }
    });
  });
})();