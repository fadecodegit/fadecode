// Envía un formulario al PHP sin salir de la página (registro, inicio de
// sesión, sugerencias). Las validaciones las hace el PHP; acá solo se
// muestra lo que responde:
//  - Si responde bien: se carga la ventana emergente de html/Modals/
//    que indica data-modal en el <form>.
//  - Si responde con error: se muestra su mensaje en el elemento que
//    indica data-mensaje en el <form>.
//  - Si no responde (servidor caído, etc.): se lleva a Error.html.

const formulario = document.querySelector("form[data-modal]");
const mensaje = document.getElementById(formulario.dataset.mensaje);

function mostrarError(texto) {
    // Usa la clase propia de cada página: auth-form-message--error, sug-form-message--error...
    const claseBase = mensaje.classList[0];
    mensaje.textContent = texto;
    mensaje.className = `${claseBase} ${claseBase}--error`;

    // El reCAPTCHA sirve para un solo intento: se reinicia para el siguiente
    if (window.grecaptcha) {
        grecaptcha.reset();
    }
}

async function mostrarModal() {
    try {
        const respuesta = await fetch(formulario.dataset.modal);
        document.body.insertAdjacentHTML("beforeend", await respuesta.text());
    } catch {
        // Si no se pudo cargar la ventana, se pasa directo a la página siguiente
        window.location.href = "Institucional.html";
        return;
    }

    // La página de atrás se puede seguir scrolleando, pero no se puede
    // tocar nada (ni con el mouse ni con Tab) salvo el botón OK
    document.querySelectorAll("header, main, footer").forEach((parte) => {
        parte.inert = true;
    });
    document.querySelector(".modal-exito__btn").focus();
}

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensaje.textContent = "";

    let datos;
    try {
        const respuesta = await fetch(formulario.action, {
            method: "POST",
            body: new FormData(formulario)
        });
        datos = await respuesta.json();
    } catch {
        // No llegó una respuesta en JSON (Apache apagado, página abierta
        // como archivo, un error de programación en el PHP...): los datos
        // no se enviaron, así que se lleva a la página de error
        window.location.href = "Error.html";
        return;
    }

    if (datos.exito) {
        mostrarModal();
    } else {
        mostrarError(datos.mensaje || "No se pudo completar la operación.");
    }
});
