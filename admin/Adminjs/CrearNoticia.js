// Pantalla de Noticias: crea noticias con vista previa.
// Antes de subir pregunta si está seguro y después avisa que se subió.

vincularImagen("noticiaImagen", "noticiaThumb", "previewNoticiaImageWrap", "previewNoticiaImage");
vincularTexto("noticiaFecha", "previewNoticiaDate");
vincularTexto("noticiaSubtitulo", "previewNoticiaTitle");
vincularTexto("noticiaTexto", "previewNoticiaSummary");

const formNoticia = document.getElementById("formNoticia");
const modalConfirmar = document.getElementById("modalConfirmarNoticia");
const modalSubida = document.getElementById("modalNoticiaSubida");
const errorNoticia = document.getElementById("noticiaError");
const botonSubir = formNoticia.querySelector('button[type="submit"]');

function mostrarError(texto) {
    errorNoticia.textContent = texto;
    errorNoticia.hidden = !texto;
}

// Al tocar "Subir" primero pregunta si está seguro
formNoticia.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mostrarError("");
    modalConfirmar.returnValue = "";
    modalConfirmar.showModal();
});

async function subirNoticia() {
    const datos = new FormData(formNoticia);
    datos.append("accion", "crear");
    botonSubir.disabled = true;

    try {
        const respuesta = await fetch(formNoticia.action, { method: "POST", body: datos });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            modalSubida.showModal();
        } else {
            mostrarError(resultado.mensaje || "No se pudo subir la noticia.");
        }
    } catch {
        // Si el servidor no responde, se avisa que no se subió
        mostrarError("No se pudo conectar con el servidor. La noticia no se subió.");
    } finally {
        botonSubir.disabled = false;
    }
}

// Si tocó "Sí", se envía
modalConfirmar.addEventListener("close", () => {
    if (modalConfirmar.returnValue === "si") subirNoticia();
});

// Después del aviso, el formulario queda vacío para otra noticia
modalSubida.addEventListener("close", () => formNoticia.reset());

// Botón Editar: lo maneja editar-tarjetas.js, igual que en Logros
iniciarEdicionTarjetas({
    boton: document.getElementById("noticiasEditarBtn"),
    modal: document.getElementById("modalEditarNoticias"),
    modalConfirmar: document.getElementById("modalConfirmarEdicionNoticias"),
    modalCambios: document.getElementById("modalCambiosNoticias"),
    direccion: formNoticia.action,
    paginaPublica: "../html/Noticias.html",
    clave: "noticias",
    nombre: "esta noticia",
    normalizar: (noticia) => ({
        id: noticia.id_noticia,
        fecha: noticia.fecha_texto || "",
        titulo: noticia.titulo_noticia || "Sin título",
        texto: noticia.descrip_noticia || "",
        imagen: noticia.imagen_noticia ? `../${noticia.imagen_noticia}` : ""
    })
});

[modalConfirmar, modalSubida].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});
