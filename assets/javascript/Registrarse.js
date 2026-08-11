/**
 * Registrarse.js — validación del formulario de registro
 */
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

  function isValidEmail(value) {
    // Chequeo simple: algo@algo.algo
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function clearErrors(form) {
    form.querySelectorAll(".auth-field__error").forEach((el) => {
      el.textContent = "";
    });
    form.querySelectorAll(".auth-field__input, .auth-terms").forEach((el) => {
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
    } else if (fieldId === "reg-terminos") {
      // el checkbox de términos marca todo el bloque, no solo el input
      const termsBlock = document.querySelector(".auth-terms");
      if (termsBlock) termsBlock.classList.add("is-invalid");
      document.getElementById("reg-terminos").focus();
    }
  }

  function showGeneralMessage(message, type) {
    const el = document.getElementById("auth-form-message");
    if (!el) return;
    el.textContent = message;
    el.classList.add(type === "success" ? "auth-form-message--success" : "auth-form-message--error");
  }

  function validateAndCollect() {
    const nombre = getValue("reg-nombre");
    if (!nombre) {
      throw new FormError("reg-nombre", "Ingresá tu nombre y apellido.");
    }

    const cedula = getValue("reg-cedula");
    if (!cedula) {
      throw new FormError("reg-cedula", "Ingresá tu cédula.");
    }

    const correo = getValue("reg-correo");
    if (!correo) {
      throw new FormError("reg-correo", "Ingresá tu correo electrónico.");
    }
    if (!isValidEmail(correo)) {
      throw new FormError("reg-correo", "El correo electrónico no es válido.");
    }

    const password = getValue("reg-password");
    if (!password) {
      throw new FormError("reg-password", "Creá una contraseña.");
    }
    if (password.length < 6) {
      throw new FormError("reg-password", "La contraseña debe tener al menos 6 caracteres.");
    }

    const confirmPassword = getValue("reg-confirm-password");
    if (!confirmPassword) {
      throw new FormError("reg-confirm-password", "Confirmá tu contraseña.");
    }
    if (confirmPassword !== password) {
      throw new FormError("reg-confirm-password", "Las contraseñas no coinciden.");
    }

    const edad = getValue("reg-edad");
    if (!edad) {
      throw new FormError("reg-edad", "Ingresá tu edad.");
    }
    if (Number(edad) < 0 || Number(edad) > 120) {
      throw new FormError("reg-edad", "Ingresá una edad válida.");
    }

    const terminosEl = document.getElementById("reg-terminos");
    if (!terminosEl || !terminosEl.checked) {
      throw new FormError("reg-terminos", "Tenés que aceptar los Términos y Condiciones para continuar.");
    }

    return { nombre, cedula, correo, password, edad };
  }

  function initRegistroForm() {
    const form = document.querySelector(".auth-card");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors(form);

      try {
        const datos = validateAndCollect();

        // ETIQUETA PARA VOS: acá es donde iría el envío real de "datos"
        // a tu backend (fetch/AJAX) cuando tengas el endpoint listo.
        console.log("Formulario válido:", datos);

        showGeneralMessage("¡Registro completado correctamente!", "success");
        form.reset();
      } catch (err) {
        if (err instanceof FormError) {
          showFieldError(err.fieldId, err.message);
          showGeneralMessage("Revisá los datos marcados en rojo.", "error");
        } else {
          // Cualquier error inesperado (no previsto por las validaciones de arriba)
          console.error("Error inesperado en el formulario de registro:", err);
          showGeneralMessage("Ocurrió un error inesperado. Intentá nuevamente.", "error");
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initRegistroForm);
})();