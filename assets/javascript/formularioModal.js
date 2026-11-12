// Envía el formulario sin salir de la página.
// Si sale bien, muestra la ventana de éxito; si no, muestra el error.

const formulario = document.querySelector("form[data-modal]");
const mensaje = document.getElementById(formulario.dataset.mensaje);

function mostrarError(texto) {
    const claseBase = mensaje.classList[0];
    mensaje.textContent = texto;
    mensaje.className = `${claseBase} ${claseBase}--error`;
}

async function mostrarModal() {
    try {
        const respuesta = await fetch(formulario.dataset.modal);
        document.body.insertAdjacentHTML("beforeend", await respuesta.text());
    } catch {
        // Si la ventana no carga, se pasa directo al inicio
        window.location.href = "index.html";
        return;
    }

    // Mientras está la ventana, solo se puede tocar OK
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
        // Si el servidor no responde, se va a la página de error
        window.location.href = "Error.html";
        return;
    }

    if (datos.exito) {
        mostrarModal();
    } else {
        mostrarError(datos.mensaje || "No se pudo completar la operación.");
    }
});
