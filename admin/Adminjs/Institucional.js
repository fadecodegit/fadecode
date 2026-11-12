// Pantalla Institucional: edita la página de inicio.
// La portada abre con lo que se ve hoy; las secciones se agregan con "Subir"
// y se editan, eliminan o restauran desde "Editar".

const DIRECCION_INSTITUCIONAL = "../backend/institucional.php";
const PAGINA_INICIO = "../html/index.html";

const formPortada = porId("formPortada");
const formSeccion = porId("formSeccion");
const formEditar = porId("formEditarSeccion");
const campoImagen = porId("instImagen");
const botonRestaurarPortada = porId("portadaRestaurar");
const modalSecciones = porId("modalSecciones");
const modalSeccion = porId("modalSeccion");
const modalConfirmar = porId("modalConfirmarInst");
const modalCambios = porId("modalInstCambios");
const listaSecciones = porId("seccionesLista");
const avisoSecciones = porId("seccionesAviso");

let original = null;      // lo que trae html/index.html
let portada = null;       // la portada que se ve hoy
let secciones = [];       // las secciones que se ven hoy (y las eliminadas)
let editando = null;      // sección abierta en el modal de edición
let pendiente = null;     // cambio que espera el "Sí" del modal de confirmación

const sinPuntos = (ruta) => (ruta || "").replace(/^\.\.\//, "");
const limpiarTexto = (elemento) => (elemento ? elemento.textContent.replace(/\s+/g, " ").trim() : "");

function mostrarError(id, texto) {
    porId(id).textContent = texto;
    porId(id).hidden = !texto;
}

function avisar(texto) {
    avisoSecciones.textContent = texto;
    avisoSecciones.hidden = !texto;
}

async function enviar(datos) {
    const respuesta = await fetch(DIRECCION_INSTITUCIONAL, { method: "POST", body: datos });
    return respuesta.json();
}

function formulario(accion, campos = {}) {
    const datos = new FormData();
    datos.append("accion", accion);
    Object.entries(campos).forEach(([nombre, valor]) => datos.append(nombre, valor));
    return datos;
}

// Lee el contenido original de la página pública
async function leerOriginal() {
    const respuesta = await fetch(PAGINA_INICIO);
    const pagina = new DOMParser().parseFromString(await respuesta.text(), "text/html");
    return {
        portada: {
            imagen: sinPuntos(pagina.querySelector(".inst-hero__img").getAttribute("src")),
            titulo: limpiarTexto(pagina.getElementById("inst-hero-heading")),
            texto: limpiarTexto(pagina.querySelector(".inst-hero__text")),
            titulo_contenido: limpiarTexto(pagina.getElementById("inst-content-heading"))
        },
        secciones: [...pagina.querySelectorAll("[data-inst-fijo]")].map((articulo) => {
            const titulo = articulo.querySelector(".inst-block__title");
            return {
                clave: articulo.dataset.instFijo,
                // Si tiene versión larga y corta del título, se usa la larga
                titulo: limpiarTexto(titulo.querySelector(".inst-block__title--long") || titulo),
                texto: [...articulo.querySelectorAll("p")].map(limpiarTexto).join("\n")
            };
        })
    };
}

function llenarPortada() {
    formPortada.elements.titulo.value = portada.titulo;
    formPortada.elements.texto.value = portada.texto;
    formPortada.elements.titulo_contenido.value = portada.titulo_contenido;
    campoImagen.value = "";
    const miniatura = porId("instImagenThumb");
    miniatura.classList.add("has-image");
    ponerImagen(miniatura.querySelector("img"), `../${portada.imagen}`);
    botonRestaurarPortada.hidden = !portada.editada;
}

// Vista previa: la página con lo que está escrito en los formularios
function pintarVistaPrevia() {
    if (!portada) return;
    const valor = (campo, respaldo) => campo.value.trim() || respaldo;
    ponerImagen(porId("previewInstImage"), urlImagen(campoImagen) || `../${portada.imagen}`);
    porId("previewInstHeroTitulo").textContent = valor(formPortada.elements.titulo, portada.titulo);
    porId("previewInstHeroTexto").textContent = valor(formPortada.elements.texto, portada.texto);
    porId("previewInstTituloContenido").textContent = valor(formPortada.elements.titulo_contenido, portada.titulo_contenido);

    const bloque = (titulo, texto, clase) => {
        const seccion = crear("div", clase);
        seccion.append(
            crear("h3", "admin-preview-institucional__subtitle", titulo),
            crear("p", "admin-preview-institucional__text", texto)
        );
        return seccion;
    };
    const visibles = secciones.filter((seccion) => !seccion.eliminada).map((seccion) => bloque(seccion.titulo, seccion.texto));

    // Lo que se está escribiendo en "Agregar sección" se ve al final
    const nuevoTitulo = formSeccion.elements.titulo.value.trim();
    const nuevoTexto = formSeccion.elements.texto.value.trim();
    if (nuevoTitulo || nuevoTexto) {
        visibles.push(bloque(nuevoTitulo || "Subtítulo", nuevoTexto, "admin-preview-institucional__borrador"));
    }

    porId("previewInstLista").replaceChildren(...visibles);
    porId("previewInstAviso").hidden = visibles.length > 0;
    porId("previewInstAviso").textContent = "La página no tiene ninguna sección.";
}

async function cargar() {
    try {
        const [base, respuesta] = await Promise.all([
            original ? original : leerOriginal(),
            fetch(`${DIRECCION_INSTITUCIONAL}?accion=listar`)
        ]);
        original = base;
        const datos = await respuesta.json();
        if (!datos.exito) throw new Error(datos.mensaje);

        const cambio = (clave) => datos.fijas.find((fila) => fila.clave_fija === clave);
        const cambioPortada = cambio("portada");
        portada = cambioPortada
            ? {
                editada: true,
                imagen: cambioPortada.imagen || original.portada.imagen,
                titulo: cambioPortada.titulo,
                texto: cambioPortada.texto,
                titulo_contenido: cambioPortada.titulo_contenido
            }
            : { ...original.portada, editada: false };

        secciones = [
            ...original.secciones.map((seccion) => {
                const fila = cambio(seccion.clave);
                const editada = Boolean(fila && fila.titulo);
                return {
                    ...seccion,
                    editada,
                    eliminada: Boolean(fila && Number(fila.eliminada)),
                    titulo: editada ? fila.titulo : seccion.titulo,
                    texto: editada ? fila.texto : seccion.texto
                };
            }),
            ...datos.nuevas.map((fila) => ({ id: fila.id_institucional, titulo: fila.titulo, texto: fila.texto }))
        ];

        llenarPortada();
        pintarVistaPrevia();
        if (modalSecciones.open) pintarLista();
    } catch {
        porId("previewInstAviso").hidden = false;
        porId("previewInstAviso").textContent = "No se pudo cargar el contenido de la página.";
        avisar("No se pudo conectar con el servidor.");
    }
}

function avisarCambio(texto) {
    porId("modalInstCambiosTexto").textContent = texto;
    modalCambios.showModal();
    cargar();
}

function confirmar(texto, datos, aviso) {
    pendiente = { datos, aviso };
    porId("modalConfirmarInstTexto").textContent = texto;
    modalConfirmar.returnValue = "";
    modalConfirmar.showModal();
}

// Envía un formulario: bloquea el botón mientras espera y muestra el error si falla
async function guardar(form, datos, idError, alTerminar) {
    const boton = form.querySelector('button[type="submit"]');
    mostrarError(idError, "");
    boton.disabled = true;
    try {
        const resultado = await enviar(datos);
        if (!resultado.exito) {
            mostrarError(idError, resultado.mensaje || "No se pudo guardar.");
            return;
        }
        alTerminar();
    } catch {
        mostrarError(idError, "No se pudo conectar con el servidor. No se guardó nada.");
    } finally {
        boton.disabled = false;
    }
}

// Portada
campoImagen.addEventListener("change", () => {
    const url = urlImagen(campoImagen);
    if (url) ponerImagen(porId("instImagenThumb").querySelector("img"), url);
    pintarVistaPrevia();
});

formPortada.addEventListener("input", pintarVistaPrevia);

formPortada.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formPortada);
    datos.append("accion", "guardar_portada");
    if (!campoImagen.files[0]) datos.delete("imagen");
    guardar(formPortada, datos, "portadaError", () => avisarCambio("Se guardó la portada correctamente"));
});

botonRestaurarPortada.addEventListener("click", () => confirmar(
    "¿Querés volver a la portada original? Se pierden los cambios.",
    formulario("restaurar_portada"), "Se restauró la portada original"));

// Agregar sección
formSeccion.addEventListener("input", pintarVistaPrevia);
formSeccion.addEventListener("reset", () => setTimeout(pintarVistaPrevia));

formSeccion.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formSeccion);
    datos.append("accion", "crear");
    guardar(formSeccion, datos, "seccionError", () => {
        formSeccion.reset();
        avisarCambio("Se subió la sección correctamente");
    });
});

// Lista de secciones (botón Editar)
function boton(texto, clase, accion) {
    const nuevo = crear("button", `admin-btn ${clase}`, texto);
    nuevo.type = "button";
    nuevo.addEventListener("click", accion);
    return nuevo;
}

function identificar(seccion, accion) {
    return formulario(accion, seccion.clave ? { clave: seccion.clave } : { id: seccion.id });
}

function crearFila(seccion) {
    const fila = crear("li", "admin-edicion__item admin-edicion__item--sin-imagen");

    const estado = seccion.eliminada ? "Eliminada" : seccion.editada ? "Editada" : seccion.clave ? "" : "Nueva";
    const datos = crear("div", "admin-edicion__datos");
    datos.append(crear("span", "admin-edicion__fecha", estado), crear("p", "admin-edicion__titulo", seccion.titulo));

    const acciones = crear("div", "admin-edicion__acciones");
    if (!seccion.eliminada) {
        acciones.append(boton("Editar", "admin-btn--secondary", () => abrirEdicion(seccion)));
        acciones.append(boton("Eliminar", "admin-btn--primary", () => confirmar(
            seccion.clave
                ? "¿Seguro que querés eliminar esta sección? Deja de verse en la página; después la podés restaurar."
                : "¿Seguro que querés eliminar esta sección? No se puede deshacer.",
            identificar(seccion, seccion.clave ? "eliminar_fijo" : "eliminar"), "Se eliminó la sección")));
    }
    if (seccion.clave && (seccion.eliminada || seccion.editada)) {
        acciones.append(boton("Restaurar", "admin-btn--secondary", () => confirmar(
            "¿Querés volver a mostrar esta sección como era originalmente? Se pierden los cambios.",
            identificar(seccion, "restaurar_fijo"), "Se restauró la sección original")));
    }

    fila.append(datos, acciones);
    return fila;
}

function pintarLista() {
    avisar(secciones.length ? "" : "La página no tiene ninguna sección.");
    listaSecciones.replaceChildren(...secciones.map(crearFila));
}

porId("seccionesEditarBtn").addEventListener("click", () => {
    avisar("");
    pintarLista();
    modalSecciones.showModal();
});
porId("seccionesCerrar").addEventListener("click", () => modalSecciones.close());

// Modal de edición de una sección
function abrirEdicion(seccion) {
    editando = seccion;
    mostrarError("editarSeccionError", "");
    porId("modalSeccionTitulo").textContent = `Editar: ${seccion.titulo}`;
    formEditar.elements.titulo.value = seccion.titulo;
    formEditar.elements.texto.value = seccion.texto;
    modalSeccion.showModal();
}

porId("editarSeccionCancelar").addEventListener("click", () => modalSeccion.close());

formEditar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = identificar(editando, editando.clave ? "editar_fijo" : "editar");
    datos.append("titulo", formEditar.elements.titulo.value);
    datos.append("texto", formEditar.elements.texto.value);
    guardar(formEditar, datos, "editarSeccionError", () => {
        modalSeccion.close();
        avisarCambio("Se guardaron los cambios correctamente");
    });
});

// Si confirmó, elimina o restaura lo elegido
modalConfirmar.addEventListener("close", async () => {
    if (modalConfirmar.returnValue !== "si" || !pendiente) return;
    const { datos, aviso } = pendiente;
    pendiente = null;
    // El error se muestra donde está mirando: en la lista o debajo de la portada
    const error = (texto) => (modalSecciones.open ? avisar(texto) : mostrarError("portadaError", texto));
    try {
        const resultado = await enviar(datos);
        if (resultado.exito) {
            avisarCambio(aviso);
        } else {
            error(resultado.mensaje || "No se pudo completar el cambio.");
        }
    } catch {
        error("No se pudo conectar con el servidor. No se cambió nada.");
    }
});

[modalSecciones, modalSeccion, modalConfirmar, modalCambios].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});

cargar();
