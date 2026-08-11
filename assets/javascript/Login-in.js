(function () {
  "use strict";

  /** Error a medida: además del mensaje, guarda a qué campo pertenece */
  function FormError(fieldId, message) {
    this.name = "FormError";
    this.fieldId = fieldId;
    this.message = message;
  }
  FormError.prototype = Object.create(Error.prototype);

  function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function clearErrors(form) {
    form.querySelectorAll(".auth-field__error").forEach((el) => {
      el.textContent = "";
    });
    form.querySelectorAll(".auth-field__input").forEach((el) => {
      el.classList.remove("is-invalid");
    });
    const generalMessage = document.getElementById("auth-form-message");
    if (generalMessage) {
      generalMessage.textContent = "";
      generalMessage.classList.remove("auth-form-message--success", "auth-form-message--error");
    }
  }

  function showFieldError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + "-error");
    const inputEl = document.getElementById(fieldId);

    if (errorEl) errorEl.textContent = message;
    if (inputEl) {
      inputEl.classList.add("is-invalid");
      inputEl.focus();
    }
  }

  function showGeneralMessage(message, type) {
    const el = document.getElementById("auth-form-message");
    if (!el) return;
    el.textContent = message;
    el.classList.add(type === "success" ? "auth-form-message--success" : "auth-form-message--error");
  }

  function validateAndCollect() {
    const cedula = getValue("login-cedula");
    if (!cedula) {
      throw new FormError("login-cedula", "Ingresá tu cédula.");
    }

    const password = getValue("login-password");
    if (!password) {
      throw new FormError("login-password", "Ingresá tu contraseña.");
    }

    return { cedula, password };
  }

  function initLoginForm() {
    const form = document.querySelector(".auth-card");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors(form);

      try {
        const datos = validateAndCollect();

        console.log("Formulario de login listo para enviar:", datos);

        showGeneralMessage("Verificando datos…", "success");
      } catch (err) {
        if (err instanceof FormError) {
          showFieldError(err.fieldId, err.message);
          showGeneralMessage("Revisá los datos marcados en rojo.", "error");
        } else {
          console.error("Error inesperado en el formulario de login:", err);
          showGeneralMessage("Ocurrió un error inesperado. Intentá nuevamente.", "error");
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initLoginForm);
})();