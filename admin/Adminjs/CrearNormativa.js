// Pantalla de Normativas: arma una normativa con bloques de imagen o texto.
// Antes de subir pregunta si está seguro y después avisa que se subió.

vincularTexto("normativaTitulo", "previewNormativaTitulo");
vincularTexto("normativaTextoIntro", "previewNormativaIntro");
vincularImagen("normImagenArchivo", "normImagenThumb");

const bloqueActivo = interruptor([
    ["normBtnImagen", "normBlockImagen"],
    ["normBtnTexto", "normBlockTexto"]
]);

// Guarda los datos de cada bloque agregado para enviarlos al subir
const datosBloques = new WeakMap();

function agregarBloqueImagen() {
    const campoImagen = porId("normImagenArchivo");
    if (!campoImagen.files[0]) {
        campoImagen.focus();
        return;
    }

    const bloque = crear("div", "admin-normativa-block admin-normativa-block--imagen");
    const quitar = crear("button", "admin-normativa-block__remove");
    const contenedorImagen = crear("div", "admin-normativa-block__image");
    contenedorImagen.appendChild(crearImagen(campoImagen));

    const subtitulo = porId("normImagenSubtitulo").value.trim();
    const texto = porId("normImagenTexto").value.trim();
    const cuerpo = crear("div", "admin-normativa-block__body");
    cuerpo.append(
        crear("h3", "admin-normativa-block__subtitle", subtitulo),
        crear("p", "admin-normativa-block__text", texto)
    );

    bloque.append(quitar, contenedorImagen, cuerpo);
    datosBloques.set(bloque, { tipo: "imagen", subtitulo, texto, archivo: campoImagen.files[0] });
    agregarALista("previewNormativaBlocks", "previewNormativaEmpty", bloque, quitar);
    limpiarCampos("normImagenArchivo", "normImagenSubtitulo", "normImagenTexto");
}

function agregarBloqueTexto() {
    const subtitulo = porId("normTextoSubtitulo").value.trim();
    const texto = porId("normTextoTexto").value.trim();
    if (!subtitulo && !texto) {
        porId("normTextoSubtitulo").focus();
        return;
    }

    const bloque = crear("div", "admin-normativa-block admin-normativa-block--texto");
    const quitar = crear("button", "admin-normativa-block__remove");
    bloque.append(
        quitar,
        crear("h3", "admin-normativa-block__subtitle", subtitulo),
        crear("p", "admin-normativa-block__text", texto)
    );
    datosBloques.set(bloque, { tipo: "texto", subtitulo, texto });

    agregarALista("previewNormativaBlocks", "previewNormativaEmpty", bloque, quitar);
    limpiarCampos("normTextoSubtitulo", "normTextoTexto");
}

porId("normAddBlockBtn").addEventListener("click", () => {
    if (bloqueActivo() === 0) {
        agregarBloqueImagen();
    } else {
        agregarBloqueTexto();
    }
});

const formNormativa = porId("formNormativa");
const modalConfirmar = porId("modalConfirmarNormativa");
const modalSubida = porId("modalNormativaSubida");
const errorNormativa = porId("normativaError");
const botonSubir = formNormativa.querySelector('button[type="submit"]');

function mostrarError(texto) {
    errorNormativa.textContent = texto;
    errorNormativa.hidden = !texto;
}

// Al tocar "Subir" primero pregunta si está seguro
formNormativa.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mostrarError("");
    modalConfirmar.returnValue = "";
    modalConfirmar.showModal();
});

// Junta el encabezado, los bloques y sus imágenes para enviarlos
function datosNormativa() {
    const datos = new FormData();
    datos.append("accion", "crear");
    datos.append("titulo", porId("normativaTitulo").value);
    datos.append("texto", porId("normativaTextoIntro").value);

    const bloques = [];
    porId("previewNormativaBlocks").querySelectorAll(".admin-normativa-block").forEach((tarjeta) => {
        const { tipo, subtitulo, texto, archivo } = datosBloques.get(tarjeta);
        if (archivo) datos.append(`imagen_${bloques.length}`, archivo);
        bloques.push({ tipo, subtitulo, texto });
    });
    datos.append("bloques", JSON.stringify(bloques));
    return datos;
}

async function subirNormativa() {
    botonSubir.disabled = true;
    try {
        const respuesta = await fetch(formNormativa.action, { method: "POST", body: datosNormativa() });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            modalSubida.showModal();
        } else {
            mostrarError(resultado.mensaje || "No se pudo subir la normativa.");
        }
    } catch {
        // Si el servidor no responde, se avisa que no se subió
        mostrarError("No se pudo conectar con el servidor. La normativa no se subió.");
    } finally {
        botonSubir.disabled = false;
    }
}

// Si tocó "Sí", se envía
modalConfirmar.addEventListener("close", () => {
    if (modalConfirmar.returnValue === "si") subirNormativa();
});

// Después del aviso, todo queda vacío para cargar otra normativa
modalSubida.addEventListener("close", () => {
    formNormativa.reset();
    porId("previewNormativaBlocks")
        .querySelectorAll(".admin-normativa-block")
        .forEach((bloque) => bloque.remove());
    porId("previewNormativaEmpty").hidden = false;
});

// Botón Editar: lista Uniforme, que ya trae la página, y las normativas subidas.
// Uniforme se edita, se elimina y se restaura; las subidas se editan o se eliminan.
// De las subidas se cambian textos e imágenes, pero no se agregan ni se quitan bloques.

const modalNormativas = porId("modalNormativas");
const vistaLista = porId("normativasVistaLista");
const listaNormativas = porId("normativasLista");
const avisoNormativas = porId("normativasAviso");
const formEditar = porId("formEditarNormativa");
const contenedorBloques = porId("editarNormativaBloques");
const errorEditar = porId("editarNormativaError");
const modalEliminar = porId("modalEliminarNormativa");
const modalCambios = porId("modalNormativaCambios");
let normativaAEliminar = null;

function mostrarVistaLista() {
    formEditar.hidden = true;
    vistaLista.hidden = false;
}

function avisar(texto) {
    avisoNormativas.textContent = texto;
    avisoNormativas.hidden = !texto;
}

function crearFilaNormativa(normativa) {
    const fila = crear("li", "admin-edicion__item");

    const conImagen = normativa.bloques.find((bloque) => bloque.imagen_bloque);
    const imagen = crear("img", "admin-edicion__imagen");
    imagen.alt = "";
    imagen.src = conImagen ? `../${conImagen.imagen_bloque}` : "../Recursos UTU/Isotipo-UTU-Color-Dorado-PNG.png";

    const datos = crear("div", "admin-edicion__datos");
    datos.append(
        crear("span", "admin-edicion__fecha", `${normativa.bloques.length} ${normativa.bloques.length === 1 ? "bloque" : "bloques"}`),
        crear("p", "admin-edicion__titulo", normativa.titulo_normativa)
    );

    const botonEditar = crear("button", "admin-btn admin-btn--secondary", "Editar");
    botonEditar.type = "button";
    botonEditar.addEventListener("click", () => abrirEdicion(normativa));

    const botonEliminar = crear("button", "admin-btn admin-btn--primary", "Eliminar");
    botonEliminar.type = "button";
    botonEliminar.addEventListener("click", () => {
        normativaAEliminar = normativa;
        modalEliminar.returnValue = "";
        modalEliminar.showModal();
    });

    const acciones = crear("div", "admin-edicion__acciones");
    acciones.append(botonEditar, botonEliminar);

    fila.append(imagen, datos, acciones);
    return fila;
}

async function cargarNormativasSubidas() {
    listaNormativas.replaceChildren();
    avisar("Cargando...");

    try {
        const respuesta = await fetch(`${formNormativa.action}?accion=listar`);
        const datos = await respuesta.json();
        if (!datos.exito) {
            avisar(datos.mensaje || "No se pudieron cargar las normativas.");
            return;
        }
        uniformeActual = await uniformeQueSeVe(datos.uniforme);
        avisar("");
        listaNormativas.replaceChildren(crearFilaUniforme(uniformeActual), ...datos.normativas.map(crearFilaNormativa));
    } catch {
        avisar("No se pudo conectar con el servidor.");
    }
}

// Un recuadro por bloque con sus campos
function crearCamposBloque(bloque, numero) {
    const caja = crear("fieldset", "admin-edicion-bloque");
    caja.dataset.idBloque = bloque.id_bloque;
    caja.append(crear("legend", "admin-edicion-bloque__titulo", `Bloque ${numero} — ${bloque.tipo_bloque === "imagen" ? "Imagen" : "Texto"}`));

    const campo = (etiqueta, elemento) => {
        const grupo = crear("div", "admin-field");
        const id = `editarBloque${bloque.id_bloque}${etiqueta}`;
        const rotulo = crear("label", "admin-field__label", etiqueta);
        rotulo.htmlFor = id;
        elemento.id = id;
        grupo.append(rotulo, elemento);
        caja.append(grupo);
        return elemento;
    };

    if (bloque.tipo_bloque === "imagen") {
        const marco = crear("div", "admin-file-drop");
        const miniatura = crear("div", "admin-file-drop__thumb has-image");
        const imagen = crear("img");
        imagen.alt = "";
        imagen.src = `../${bloque.imagen_bloque}`;
        miniatura.append(imagen);
        const archivo = crear("input");
        archivo.type = "file";
        archivo.accept = "image/jpeg,image/png,image/webp";
        archivo.dataset.campo = "imagen";
        archivo.addEventListener("change", () => {
            const url = urlImagen(archivo);
            if (url) ponerImagen(imagen, url);
        });
        marco.append(miniatura, archivo);
        const grupo = crear("div", "admin-field");
        grupo.append(crear("span", "admin-field__label", "Imagen"), marco);
        caja.append(grupo);
    }

    const subtitulo = crear("input");
    subtitulo.type = "text";
    subtitulo.maxLength = 120;
    subtitulo.value = bloque.subtitulo_bloque || "";
    subtitulo.dataset.campo = "subtitulo";
    campo("Subtítulo", subtitulo);

    const texto = crear("textarea");
    texto.maxLength = 1000;
    texto.value = bloque.texto_bloque || "";
    texto.dataset.campo = "texto";
    campo("Texto", texto);

    return caja;
}

function abrirEdicion(normativa) {
    formEditar.reset();
    errorEditar.hidden = true;
    porId("editarNormativaId").value = normativa.id_normativa;
    porId("editarNormativaTitulo").value = normativa.titulo_normativa;
    porId("editarNormativaTexto").value = normativa.texto_normativa;
    contenedorBloques.replaceChildren(...normativa.bloques.map((bloque, i) => crearCamposBloque(bloque, i + 1)));
    vistaLista.hidden = true;
    formEditar.hidden = false;
}

function avisarCambio(texto) {
    porId("modalNormativaCambiosTexto").textContent = texto;
    modalCambios.showModal();
    mostrarVistaLista();
    cargarNormativasSubidas();
}

// Envía un cambio al servidor y devuelve la respuesta
async function enviarCambio(datos) {
    const respuesta = await fetch(formNormativa.action, { method: "POST", body: datos });
    return respuesta.json();
}

porId("normativasEditarBtn").addEventListener("click", () => {
    mostrarVistaLista();
    modalNormativas.showModal();
    cargarNormativasSubidas();
});

porId("normativasCerrar").addEventListener("click", () => modalNormativas.close());
porId("editarNormativaVolver").addEventListener("click", mostrarVistaLista);

formEditar.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    errorEditar.hidden = true;
    const boton = formEditar.querySelector('button[type="submit"]');
    boton.disabled = true;

    const datos = new FormData(formEditar);
    datos.append("accion", "editar");
    const bloques = [...contenedorBloques.querySelectorAll("[data-id-bloque]")].map((caja) => {
        const idBloque = caja.dataset.idBloque;
        const archivo = caja.querySelector('[data-campo="imagen"]');
        if (archivo && archivo.files[0]) datos.append(`imagen_${idBloque}`, archivo.files[0]);
        return {
            id_bloque: Number(idBloque),
            subtitulo: caja.querySelector('[data-campo="subtitulo"]').value,
            texto: caja.querySelector('[data-campo="texto"]').value
        };
    });
    datos.append("bloques", JSON.stringify(bloques));

    try {
        const resultado = await enviarCambio(datos);
        if (resultado.exito) {
            avisarCambio("Se guardaron los cambios correctamente");
        } else {
            errorEditar.textContent = resultado.mensaje || "No se pudo editar la normativa.";
            errorEditar.hidden = false;
        }
    } catch {
        errorEditar.textContent = "No se pudo conectar con el servidor. Los cambios no se guardaron.";
        errorEditar.hidden = false;
    } finally {
        boton.disabled = false;
    }
});

// Si confirmó, elimina la normativa elegida
modalEliminar.addEventListener("close", async () => {
    if (modalEliminar.returnValue !== "si") return;

    const datos = new FormData();
    datos.append("accion", "eliminar");
    datos.append("id", normativaAEliminar.id_normativa);
    try {
        const resultado = await enviarCambio(datos);
        if (resultado.exito) {
            avisarCambio("Se eliminó la normativa correctamente");
        } else {
            avisar(resultado.mensaje || "No se pudo eliminar la normativa.");
        }
    } catch {
        avisar("No se pudo conectar con el servidor. La normativa no se eliminó.");
    }
});

[modalConfirmar, modalSubida, modalNormativas, modalEliminar, modalCambios].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});

// Uniforme: se lee de la página pública y, si se cambió desde el panel,
// se muestra con el cambio.

const modalUniforme = porId("modalUniforme");
const formUniforme = porId("formUniforme");
const modalConfirmarUniforme = porId("modalConfirmarUniforme");
let uniformeOriginal = null;
let uniformeActual = null;
let accionUniforme = null;    // lo que se hace si se toca "Sí": eliminar o restaurar

const textoLimpio = (elemento) => (elemento ? elemento.textContent.replace(/\s+/g, " ").trim() : "");

async function leerUniformeOriginal() {
    const respuesta = await fetch("../html/Normativas.html");
    const pagina = new DOMParser().parseFromString(await respuesta.text(), "text/html");
    const seccion = pagina.querySelector('[data-normativa-fija="uniforme"]');
    return {
        titulo: textoLimpio(seccion.querySelector(".norm-subtitle")),
        texto: textoLimpio(seccion.querySelector(".norm-text")),
        nota: textoLimpio(seccion.querySelector(".norm-note")),
        tarjetas: [...seccion.querySelectorAll(".norm-uniform-card")].map((tarjeta) => ({
            titulo: textoLimpio(tarjeta.querySelector(".norm-uniform-card__title")),
            etiqueta: textoLimpio(tarjeta.querySelector(".norm-uniform-card__badge")),
            texto: textoLimpio(tarjeta.querySelector(".norm-uniform-card__text")),
            imagen: tarjeta.querySelector(".norm-uniform-card__image").getAttribute("src")
        }))
    };
}

// Junta lo original con lo que se cambió desde el panel
async function uniformeQueSeVe(cambio) {
    if (!uniformeOriginal) uniformeOriginal = await leerUniformeOriginal();
    const eliminada = Boolean(cambio && Number(cambio.eliminada));
    if (!cambio || !cambio.titulo) return { ...uniformeOriginal, editada: false, eliminada };

    const contenido = JSON.parse(cambio.contenido);
    return {
        editada: true,
        eliminada,
        titulo: cambio.titulo,
        texto: contenido.texto,
        nota: contenido.nota,
        tarjetas: uniformeOriginal.tarjetas.map((original, i) => {
            const guardada = contenido.tarjetas[i] || {};
            return { ...original, ...guardada, imagen: guardada.imagen ? `../${guardada.imagen}` : original.imagen };
        })
    };
}

function crearFilaUniforme(uniforme) {
    const fila = crear("li", "admin-edicion__item");

    const imagen = crear("img", "admin-edicion__imagen");
    imagen.alt = "";
    imagen.src = uniforme.tarjetas[0] ? uniforme.tarjetas[0].imagen : "../Recursos UTU/Isotipo-UTU-Color-Dorado-PNG.png";

    const estado = uniforme.eliminada ? "Eliminada" : uniforme.editada ? "Editada" : "Ya en la página";
    const datos = crear("div", "admin-edicion__datos");
    datos.append(crear("span", "admin-edicion__fecha", estado), crear("p", "admin-edicion__titulo", uniforme.titulo));

    const acciones = crear("div", "admin-edicion__acciones");
    const boton = (texto, clase, accion) => {
        const nuevo = crear("button", `admin-btn ${clase}`, texto);
        nuevo.type = "button";
        nuevo.addEventListener("click", accion);
        acciones.append(nuevo);
    };
    if (!uniforme.eliminada) {
        boton("Editar", "admin-btn--secondary", () => abrirUniforme(uniforme));
        boton("Eliminar", "admin-btn--primary", () => confirmarUniforme(
            "¿Seguro que querés eliminar la sección Uniforme? Deja de verse en la página; después la podés restaurar.",
            "eliminar_uniforme", "Se eliminó la sección Uniforme"));
    }
    if (uniforme.eliminada || uniforme.editada) {
        boton("Restaurar", "admin-btn--secondary", () => confirmarUniforme(
            "¿Querés volver a mostrar Uniforme como era originalmente? Se pierden los cambios.",
            "restaurar_uniforme", "Se restauró la sección Uniforme"));
    }

    fila.append(imagen, datos, acciones);
    return fila;
}

// Un recuadro por tarjeta (Ciclo Básico y Bachillerato)
function crearCamposTarjeta(tarjeta, indice) {
    const caja = crear("fieldset", "admin-edicion-bloque");
    caja.append(crear("legend", "admin-edicion-bloque__titulo", `Tarjeta ${indice + 1} — ${tarjeta.titulo}`));

    const marco = crear("div", "admin-file-drop");
    const miniatura = crear("div", "admin-file-drop__thumb has-image");
    const imagen = crear("img");
    imagen.alt = "";
    imagen.src = tarjeta.imagen;
    miniatura.append(imagen);
    const archivo = crear("input");
    archivo.type = "file";
    archivo.name = `imagen_tarjeta_${indice}`;
    archivo.accept = "image/jpeg,image/png,image/webp";
    archivo.setAttribute("aria-label", `Imagen de la tarjeta ${indice + 1}`);
    archivo.addEventListener("change", () => {
        const url = urlImagen(archivo);
        if (url) ponerImagen(imagen, url);
    });
    marco.append(miniatura, archivo);
    const grupoImagen = crear("div", "admin-field");
    grupoImagen.append(crear("span", "admin-field__label", "Imagen"), marco);
    caja.append(grupoImagen);

    const campo = (etiqueta, elemento, nombre, valor, maximo) => {
        const id = `uniformeTarjeta${indice}${nombre}`;
        const grupo = crear("div", "admin-field");
        const rotulo = crear("label", "admin-field__label", etiqueta);
        rotulo.htmlFor = id;
        elemento.id = id;
        elemento.name = `tarjeta_${nombre}[]`;
        elemento.value = valor;
        elemento.maxLength = maximo;
        elemento.required = true;
        grupo.append(rotulo, elemento);
        caja.append(grupo);
    };
    const titulo = crear("input");
    titulo.type = "text";
    campo("Título", titulo, "titulo", tarjeta.titulo, 80);
    const etiqueta = crear("input");
    etiqueta.type = "text";
    campo("Etiqueta de color", etiqueta, "etiqueta", tarjeta.etiqueta, 60);
    const texto = crear("textarea");
    texto.rows = 4;
    campo("Texto", texto, "texto", tarjeta.texto, 800);

    return caja;
}

function abrirUniforme(uniforme) {
    formUniforme.reset();
    porId("uniformeError").hidden = true;
    formUniforme.elements.titulo.value = uniforme.titulo;
    formUniforme.elements.texto.value = uniforme.texto;
    formUniforme.elements.nota.value = uniforme.nota;
    porId("uniformeTarjetas").replaceChildren(...uniforme.tarjetas.map(crearCamposTarjeta));
    modalUniforme.showModal();
}

porId("uniformeCancelar").addEventListener("click", () => modalUniforme.close());

formUniforme.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const error = porId("uniformeError");
    error.hidden = true;
    const boton = formUniforme.querySelector('button[type="submit"]');
    boton.disabled = true;

    const datos = new FormData(formUniforme);
    datos.append("accion", "editar_uniforme");
    // Las tarjetas sin imagen nueva no mandan archivo
    formUniforme.querySelectorAll('input[type="file"]').forEach((archivo) => {
        if (!archivo.files[0]) datos.delete(archivo.name);
    });

    try {
        const resultado = await enviarCambio(datos);
        if (resultado.exito) {
            modalUniforme.close();
            avisarCambio("Se guardaron los cambios correctamente");
        } else {
            error.textContent = resultado.mensaje || "No se pudo guardar el cambio.";
            error.hidden = false;
        }
    } catch {
        error.textContent = "No se pudo conectar con el servidor. Los cambios no se guardaron.";
        error.hidden = false;
    } finally {
        boton.disabled = false;
    }
});

function confirmarUniforme(texto, accion, aviso) {
    accionUniforme = { accion, aviso };
    porId("modalConfirmarUniformeTexto").textContent = texto;
    modalConfirmarUniforme.returnValue = "";
    modalConfirmarUniforme.showModal();
}

// Si confirmó, elimina o restaura Uniforme
modalConfirmarUniforme.addEventListener("close", async () => {
    if (modalConfirmarUniforme.returnValue !== "si" || !accionUniforme) return;
    const { accion, aviso } = accionUniforme;
    accionUniforme = null;
    const datos = new FormData();
    datos.append("accion", accion);
    try {
        const resultado = await enviarCambio(datos);
        if (resultado.exito) {
            avisarCambio(aviso);
        } else {
            avisar(resultado.mensaje || "No se pudo completar el cambio.");
        }
    } catch {
        avisar("No se pudo conectar con el servidor. No se cambió nada.");
    }
});

[modalUniforme, modalConfirmarUniforme].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});
