// Pantalla de Ubicación UTU y de los anexos Tomás Gomensoro y Baltasar Brum.
// El formulario abre con los datos que se ven hoy en la página.
// "Guardar cambios" los cambia y "Restaurar original" vuelve a los de siempre.
// Los cambios se borran solos al reiniciar el servidor.

const formAnexo = porId("formAnexoEditor");
const DIRECCION_ANEXO = formAnexo.getAttribute("action");
const CLAVE_ANEXO = formAnexo.dataset.pagina;
const avisoAnexo = porId("anexoAviso");
const errorAnexo = porId("anexoError");
const campoImagen = porId("anexoImagen");
const botonRestaurar = porId("anexoRestaurar");
const modalRestaurar = porId("modalAnexoRestaurar");
const modalCambios = porId("modalAnexoCambios");

// Qué parte de la vista previa muestra cada campo
const VISTA = {
    titulo: "previewAnexoTitulo",
    subtitulo: "previewAnexoSubtitulo",
    texto: "previewAnexoTexto",
    localizacion: "previewAnexoLocalizacion",
    telefono: "previewAnexoTelefono",
    correo: "previewAnexoCorreo",
    director: "previewAnexoDirector"
};

let actuales = null;      // los datos que se ven hoy, para la vista previa
let tieneSubtitulo = false;

const limpiarTexto = (elemento) => (elemento ? elemento.textContent.replace(/\s+/g, " ").trim() : "");

function mostrarError(texto) {
    errorAnexo.textContent = texto;
    errorAnexo.hidden = !texto;
}

// Lee los datos originales de la página pública
async function leerOriginales() {
    const respuesta = await fetch(formAnexo.dataset.html);
    const pagina = new DOMParser().parseFromString(await respuesta.text(), "text/html");
    const [localizacion, telefono, correo, director] = [...pagina.querySelectorAll(".ubi-list__text")].map(limpiarTexto);
    const subtitulo = pagina.querySelector(".ubi-info__subtitle");

    return {
        tieneSubtitulo: Boolean(subtitulo),
        titulo: limpiarTexto(pagina.querySelector(".ubi-title__text")),
        subtitulo: limpiarTexto(subtitulo),
        texto: limpiarTexto(pagina.querySelector(".ubi-info__text")),
        imagen: pagina.querySelector(".ubi-map").getAttribute("src"),
        localizacion, telefono, correo, director
    };
}

// Actualiza la vista previa; si un campo está vacío, muestra el dato actual
function pintarVistaPrevia() {
    if (!actuales) return;
    Object.entries(VISTA).forEach(([campo, id]) => {
        porId(id).textContent = formAnexo.elements[campo].value.trim() || actuales[campo];
    });
    porId("previewAnexoSubtitulo").hidden = !tieneSubtitulo;
    ponerImagen(porId("previewAnexoImage"), urlImagen(campoImagen) || actuales.imagen);
}

function llenarFormulario() {
    Object.keys(VISTA).forEach((campo) => {
        formAnexo.elements[campo].value = actuales[campo] || "";
    });
    campoImagen.value = "";
    ponerImagen(porId("anexoImagenThumb").querySelector("img"), actuales.imagen);
    porId("previewAnexoImageWrap").classList.add("has-image");
    pintarVistaPrevia();
}

async function cargar() {
    try {
        const [originales, respuesta] = await Promise.all([
            leerOriginales(),
            fetch(`${DIRECCION_ANEXO}?accion=leer&pagina=${encodeURIComponent(CLAVE_ANEXO)}`)
        ]);
        const datos = await respuesta.json();
        if (!datos.exito) throw new Error(datos.mensaje);

        tieneSubtitulo = originales.tieneSubtitulo;
        porId("anexoSubtituloCampo").hidden = !tieneSubtitulo;
        formAnexo.elements.subtitulo.required = tieneSubtitulo;

        const cambios = datos.cambios;
        actuales = cambios
            ? {
                titulo: cambios.titulo_pagina,
                subtitulo: cambios.subtitulo_pagina || originales.subtitulo,
                texto: cambios.texto_pagina,
                imagen: cambios.imagen_pagina ? `../${cambios.imagen_pagina}` : originales.imagen,
                localizacion: cambios.localizacion,
                telefono: cambios.telefono,
                correo: cambios.correo,
                director: cambios.director
            }
            : originales;
        botonRestaurar.hidden = !cambios;
        avisoAnexo.hidden = true;
        llenarFormulario();
    } catch {
        avisoAnexo.textContent = "No se pudieron cargar los datos actuales. Recargá la página para intentar de nuevo.";
        avisoAnexo.hidden = false;
    }
}

formAnexo.addEventListener("input", pintarVistaPrevia);

campoImagen.addEventListener("change", () => {
    const url = urlImagen(campoImagen);
    if (url) ponerImagen(porId("anexoImagenThumb").querySelector("img"), url);
    pintarVistaPrevia();
});

async function enviar(datos) {
    const respuesta = await fetch(DIRECCION_ANEXO, { method: "POST", body: datos });
    return respuesta.json();
}

function avisarCambio(texto) {
    porId("modalAnexoCambiosTexto").textContent = texto;
    modalCambios.showModal();
    cargar();
}

formAnexo.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (!actuales) return;
    mostrarError("");
    const boton = formAnexo.querySelector('button[type="submit"]');
    boton.disabled = true;

    const datos = new FormData(formAnexo);
    datos.append("accion", "editar");
    if (!campoImagen.files[0]) datos.delete("imagen");

    try {
        const resultado = await enviar(datos);
        if (resultado.exito) {
            avisarCambio("Se guardaron los cambios correctamente");
        } else {
            mostrarError(resultado.mensaje || "No se pudo guardar el cambio.");
        }
    } catch {
        mostrarError("No se pudo conectar con el servidor. Los cambios no se guardaron.");
    } finally {
        boton.disabled = false;
    }
});

botonRestaurar.addEventListener("click", () => {
    modalRestaurar.returnValue = "";
    modalRestaurar.showModal();
});

modalRestaurar.addEventListener("close", async () => {
    if (modalRestaurar.returnValue !== "si") return;
    mostrarError("");
    const datos = new FormData();
    datos.append("accion", "restaurar");
    datos.append("pagina", CLAVE_ANEXO);
    try {
        const resultado = await enviar(datos);
        if (resultado.exito) {
            avisarCambio("Se restauró la página original");
        } else {
            mostrarError(resultado.mensaje || "No se pudo restaurar la página.");
        }
    } catch {
        mostrarError("No se pudo conectar con el servidor. No se cambió nada.");
    }
});

[modalRestaurar, modalCambios].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});

cargar();
