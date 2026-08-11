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
    const termsBlock = form.querySelector(".auth-terms");
    if (termsBlock) termsBlock.classList.remove("is-invalid");

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
    } else if (fieldId === "pre-terminos") {
      const termsBlock = document.querySelector(".auth-terms");
      if (termsBlock) termsBlock.classList.add("is-invalid");
      const checkbox = document.getElementById("pre-terminos");
      if (checkbox) checkbox.focus();
    }
  }

  function showGeneralMessage(message, type) {
    const el = document.getElementById("auth-form-message");
    if (!el) return;
    el.textContent = message;
    el.classList.add(type === "success" ? "auth-form-message--success" : "auth-form-message--error");
  }

  /**
   * Valida los campos del lado del cliente.
   */
  function validateAndCollect() {
    const cedula = getValue("pre-cedula");
    if (!cedula) {
      throw new FormError("pre-cedula", "Ingresá tu cédula.");
    }

    const password = getValue("pre-password");
    if (!password) {
      throw new FormError("pre-password", "Creá una contraseña.");
    }

    const curso = getValue("pre-curso");
    if (!curso) {
      throw new FormError("pre-curso", "Seleccioná el curso al que te querés preinscribir.");
    }

    const paisCiudad = getValue("pre-pais-ciudad");
    if (!paisCiudad) {
      throw new FormError("pre-pais-ciudad", "Ingresá tu país y ciudad de residencia.");
    }

    const conexion = getValue("pre-conexion");
    if (!conexion) {
      throw new FormError("pre-conexion", "Seleccioná la calidad de tu conexión a internet.");
    }

    // El comprobante es opcional
    const comprobanteInput = document.getElementById("pre-comprobante");
    const comprobante = comprobanteInput && comprobanteInput.files.length > 0
      ? comprobanteInput.files[0].name
      : null;

    const terminosEl = document.getElementById("pre-terminos");
    if (!terminosEl || !terminosEl.checked) {
      throw new FormError("pre-terminos", "Tenés que aceptar las normas y la política de privacidad para continuar.");
    }

    return { cedula, password, curso, paisCiudad, conexion, comprobante };
  }

  function openModal() {
    const overlay = document.getElementById("preModalOverlay");
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    const closeBtn = document.getElementById("preModalCloseBtn");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    const overlay = document.getElementById("preModalOverlay");
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  function initModalControls() {
    const overlay = document.getElementById("preModalOverlay");
    const closeBtn = document.getElementById("preModalCloseBtn");
    if (!overlay || !closeBtn) return;

    closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !overlay.hidden) closeModal();
    });
  }

  function initPreinscribirseForm() {
    const form = document.getElementById("preForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors(form);

      try {
        const datos = validateAndCollect();

        console.log("Preinscripción lista para enviar:", datos);

        form.reset();
        openModal();
      } catch (err) {
        if (err instanceof FormError) {
          showFieldError(err.fieldId, err.message);
          showGeneralMessage("Revisá los datos marcados en rojo.", "error");
        } else {
          console.error("Error inesperado en el formulario de preinscripción:", err);
          showGeneralMessage("Ocurrió un error inesperado. Intentá nuevamente.", "error");
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initPreinscribirseForm();
    initModalControls();
  });
})();