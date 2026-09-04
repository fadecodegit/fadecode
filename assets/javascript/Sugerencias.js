(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("sugForm");
    const textarea = document.getElementById("sug-texto");
    const textoError = document.getElementById("sug-texto-error");
    const formMessage = document.getElementById("sug-form-message");
    const deleteBtn = document.getElementById("sugDeleteBtn");

    if (!form || !textarea) return;

    function limpiarMensajes() {
      textoError.textContent = "";
      textarea.classList.remove("is-invalid");
      formMessage.textContent = "";
      formMessage.classList.remove("sug-form-message--success", "sug-form-message--error");
    }

    // Limpia el texto de la sugerencia.
    deleteBtn.addEventListener("click", () => {
      textarea.value = "";
      limpiarMensajes();
      textarea.focus();
    });

    // Envío del formulario
    form.addEventListener("submit", (event) => {
      event.preventDefault(); // evita que recargue la página

      const texto = textarea.value.trim();

      limpiarMensajes();

      if (texto === "") {
        textoError.textContent = "Por favor, escribí una sugerencia antes de enviar.";
        textarea.classList.add("is-invalid");
        textarea.focus();
        return;
      }

      formMessage.textContent = "¡Tu sugerencia fue enviada correctamente!";
      formMessage.classList.add("sug-form-message--success");

      form.reset();
    });
  });
})();