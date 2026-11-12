// Pantalla de Becas: edita el texto de arriba y cada beca de la página.
// "Restaurar" vuelve a lo que traía la página originalmente.

const DIRECCION_BECAS = "../backend/becas.php";
const PAGINA_BECAS = "../html/Becas.html";

const formIntro = porId("formIntroBecas");
const formBeca = porId("formBeca");
const botonRestaurarIntro = porId("introBecasRestaurar");
const listaBecas = porId("becasLista");
const avisoBecas = porId("becasAviso");
const modalBeca = porId("modalBeca");
const modalConfirmar = porId("modalConfirmarBeca");
const modalCambios = porId("modalBecaCambios");

let original = null;     // lo que trae la página pública
let intro = null;        // el texto de arriba que se ve hoy
let becas = [];          // las becas como se ven hoy
let editando = null;     // beca abierta en el modal
let pendiente = null;    // lo que espera el "Sí" de la confirmación

const limpiarTexto = (elemento) => (elemento ? elemento.textContent.replace(/\s+/g, " ").trim() : "");

function mostrarError(id, texto) {
    porId(id).textContent = texto;
    porId(id).hidden = !texto;
}

async function enviar(datos) {
    const respuesta = await fetch(DIRECCION_BECAS, { method: "POST", body: datos });
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
    const respuesta = await fetch(PAGINA_BECAS);
    const pagina = new DOMParser().parseFromString(await respuesta.text(), "text/html");
    return {
        intro: limpiarTexto(pagina.querySelector(".becas-intro")),
        becas: [...pagina.querySelectorAll("[data-beca-fija]")].map((articulo) => ({
            clave: articulo.dataset.becaFija,
            titulo: limpiarTexto(articulo.querySelector(".beca__titulo")),
            etiqueta: limpiarTexto(articulo.querySelector(".beca__etiqueta")),
            texto: limpiarTexto(articulo.querySelector(".beca__texto")),
            pasos: [...articulo.querySelectorAll(".beca__pasos li")].map(limpiarTexto),
            nota: limpiarTexto(articulo.querySelector(".beca__nota")),
            enlace: articulo.querySelector(".beca__btn").getAttribute("href")
        }))
    };
}

// Vista previa
function crearTarjeta(beca) {
    const tarjeta = crear("article", "admin-preview-beca");
    const pasos = crear("ol", "admin-preview-beca__pasos");
    pasos.append(...beca.pasos.map((paso) => crear("li", "", paso)));
    tarjeta.append(
        crear("h3", "admin-preview-beca__titulo", beca.titulo),
        crear("span", "admin-preview-beca__etiqueta", beca.etiqueta),
        crear("p", "admin-preview-beca__texto", beca.texto),
        crear("h4", "admin-preview-beca__subtitulo", "Pasos para postularte"),
        pasos
    );
    if (beca.nota) tarjeta.appendChild(crear("p", "admin-preview-beca__nota", beca.nota));
    tarjeta.appendChild(crear("span", "admin-preview-beca__btn", "Preinscribirse"));
    return tarjeta;
}

function pintarVistaPrevia() {
    if (intro === null) return;
    porId("previewBecasIntro").textContent = formIntro.elements.intro.value.trim() || intro.texto;
    porId("previewBecasLista").replaceChildren(...becas.map(crearTarjeta));
}

// Lista de becas
function boton(texto, clase, accion) {
    const nuevo = crear("button", `admin-btn ${clase}`, texto);
    nuevo.type = "button";
    nuevo.addEventListener("click", accion);
    return nuevo;
}

function crearFila(beca) {
    const fila = crear("li", "admin-edicion__item admin-edicion__item--sin-imagen");
    const datos = crear("div", "admin-edicion__datos");
    datos.append(
        crear("span", "admin-edicion__fecha", beca.editada ? "Editada" : "Original"),
        crear("p", "admin-edicion__titulo", beca.titulo),
        crear("p", "admin-edicion__detalle", beca.etiqueta)
    );

    const acciones = crear("div", "admin-edicion__acciones");
    acciones.append(boton("Editar", "admin-btn--secondary", () => abrirEdicion(beca)));
    if (beca.editada) {
        acciones.append(boton("Restaurar", "admin-btn--secondary", () => confirmar(
            `¿Querés volver a mostrar "${beca.titulo}" como era originalmente? Se pierden los cambios.`,
            formulario("restaurar", { clave: beca.clave }), "Se restauró la beca original")));
    }

    fila.append(datos, acciones);
    return fila;
}

async function cargar() {
    try {
        const [base, respuesta] = await Promise.all([
            original ? original : leerOriginal(),
            fetch(`${DIRECCION_BECAS}?accion=listar`)
        ]);
        original = base;
        const datos = await respuesta.json();
        if (!datos.exito) throw new Error(datos.mensaje);

        const cambio = (clave) => datos.cambios.find((fila) => fila.clave_fija === clave);
        const cambioIntro = cambio("intro");
        intro = cambioIntro ? { editado: true, texto: cambioIntro.contenido } : { editado: false, texto: original.intro };
        becas = original.becas.map((beca) => {
            const fila = cambio(beca.clave);
            return fila ? { clave: beca.clave, editada: true, titulo: fila.titulo, ...JSON.parse(fila.contenido) } : { ...beca, editada: false };
        });

        formIntro.elements.intro.value = intro.texto;
        botonRestaurarIntro.hidden = !intro.editado;
        avisoBecas.hidden = true;
        listaBecas.replaceChildren(...becas.map(crearFila));
        pintarVistaPrevia();
    } catch {
        avisoBecas.textContent = "No se pudieron cargar las becas.";
        avisoBecas.hidden = false;
    }
}

function avisarCambio(texto) {
    porId("modalBecaCambiosTexto").textContent = texto;
    modalCambios.showModal();
    cargar();
}

function confirmar(texto, datos, aviso) {
    pendiente = { datos, aviso };
    porId("modalConfirmarBecaTexto").textContent = texto;
    modalConfirmar.returnValue = "";
    modalConfirmar.showModal();
}

// Envía un formulario: bloquea el botón mientras espera y muestra el error si falla
async function guardar(form, datos, idError, alTerminar) {
    const botonGuardar = form.querySelector('button[type="submit"]');
    mostrarError(idError, "");
    botonGuardar.disabled = true;
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
        botonGuardar.disabled = false;
    }
}

// Texto de arriba
formIntro.addEventListener("input", pintarVistaPrevia);

formIntro.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formIntro);
    datos.append("accion", "guardar_intro");
    guardar(formIntro, datos, "introBecasError", () => avisarCambio("Se guardó el texto correctamente"));
});

botonRestaurarIntro.addEventListener("click", () => confirmar(
    "¿Querés volver al texto original? Se pierden los cambios.",
    formulario("restaurar", { clave: "intro" }), "Se restauró el texto original"));

// Modal de edición de una beca
function abrirEdicion(beca) {
    editando = beca;
    formBeca.reset();
    mostrarError("becaError", "");
    porId("modalBecaTitulo").textContent = `Editar: ${beca.titulo}`;
    formBeca.elements.titulo.value = beca.titulo;
    formBeca.elements.etiqueta.value = beca.etiqueta;
    formBeca.elements.texto.value = beca.texto;
    formBeca.elements.pasos.value = beca.pasos.join("\n");
    formBeca.elements.nota.value = beca.nota || "";
    formBeca.elements.enlace.value = beca.enlace;
    modalBeca.showModal();
}

porId("becaCancelar").addEventListener("click", () => modalBeca.close());

formBeca.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formBeca);
    datos.append("accion", "editar");
    datos.append("clave", editando.clave);
    guardar(formBeca, datos, "becaError", () => {
        modalBeca.close();
        avisarCambio("Se guardaron los cambios correctamente");
    });
});

// Si confirmó, restaura lo elegido
modalConfirmar.addEventListener("close", async () => {
    if (modalConfirmar.returnValue !== "si" || !pendiente) return;
    const { datos, aviso } = pendiente;
    pendiente = null;
    try {
        const resultado = await enviar(datos);
        if (resultado.exito) {
            avisarCambio(aviso);
        } else {
            mostrarError("introBecasError", resultado.mensaje || "No se pudo restaurar.");
        }
    } catch {
        mostrarError("introBecasError", "No se pudo conectar con el servidor. No se cambió nada.");
    }
});

[modalBeca, modalConfirmar, modalCambios].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});

cargar();
