// Pantalla de Logros: crea logros con vista previa.
// Antes de subir pregunta si está seguro y después avisa que se subió.

vincularImagen("logroImagen", "logroThumb", "previewLogroImageWrap", "previewLogroImage");
vincularTexto("logroFecha", "previewLogroDate");
vincularTexto("logroTitulo", "previewLogroTitle");
vincularTexto("logroTexto", "previewLogroSummary");

const formLogro = document.getElementById("formLogro");
const modalConfirmar = document.getElementById("modalConfirmarLogro");
const modalSubido = document.getElementById("modalLogroSubido");
const errorLogro = document.getElementById("logroError");
const botonSubir = formLogro.querySelector('button[type="submit"]');

function mostrarError(texto) {
    errorLogro.textContent = texto;
    errorLogro.hidden = !texto;
}

// Al tocar "Subir" primero pregunta si está seguro
formLogro.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mostrarError("");
    modalConfirmar.returnValue = "";
    modalConfirmar.showModal();
});

async function subirLogro() {
    const datos = new FormData(formLogro);
    datos.append("accion", "crear");
    botonSubir.disabled = true;

    try {
        const respuesta = await fetch(formLogro.action, { method: "POST", body: datos });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            modalSubido.showModal();
        } else {
            mostrarError(resultado.mensaje || "No se pudo subir el logro.");
        }
    } catch {
        // Si el servidor no responde, se avisa que no se subió
        mostrarError("No se pudo conectar con el servidor. El logro no se subió.");
    } finally {
        botonSubir.disabled = false;
    }
}

// Si tocó "Sí", se envía
modalConfirmar.addEventListener("close", () => {
    if (modalConfirmar.returnValue === "si") subirLogro();
});

// Después del aviso, el formulario queda vacío para otro logro
modalSubido.addEventListener("close", () => formLogro.reset());

// Botón Editar: lo maneja editar-tarjetas.js, igual que en Noticias
iniciarEdicionTarjetas({
    boton: document.getElementById("logrosEditarBtn"),
    modal: document.getElementById("modalEditarLogros"),
    modalConfirmar: document.getElementById("modalConfirmarEdicionLogros"),
    modalCambios: document.getElementById("modalCambiosLogros"),
    direccion: formLogro.action,
    paginaPublica: "../html/Logros.html",
    clave: "logros",
    nombre: "este logro",
    normalizar: (logro) => ({
        id: logro.id_logro,
        fecha: logro.fecha_texto,
        titulo: logro.titulo_logro,
        texto: logro.descrip_logro,
        imagen: logro.imagen_logro ? `../${logro.imagen_logro}` : ""
    })
});

[modalConfirmar, modalSubido].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});
