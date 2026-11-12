// Pantalla de Docentes: agrega docentes con vista previa.
// "Editar" abre la lista con un buscador para ubicar a un docente
// y editarlo o eliminarlo.

vincularTexto("docenteNombre", "previewDocenteNombre");
vincularTexto("docenteAsignatura", "previewDocenteAsignatura");

const DIRECCION_DOCENTES = "../backend/docentes.php";
const MAXIMO_RESULTADOS = 30;

const formDocente = document.getElementById("formDocente");
const modalConfirmar = document.getElementById("modalConfirmarDocente");
const modalSubido = document.getElementById("modalDocenteSubido");
const errorDocente = document.getElementById("docenteError");
const botonSubir = formDocente.querySelector('button[type="submit"]');
const opcionesTurno = formDocente.querySelectorAll('input[name="turno[]"]');
const vistaTurno = document.getElementById("previewDocenteTurno");

const modalDocentes = porId("modalDocentes");
const buscador = porId("docentesBuscar");
const listaDocentes = porId("docentesLista");
const avisoDocentes = porId("docentesAviso");
const modalEditar = porId("modalEditarDocente");
const formEditar = porId("formEditarDocente");

let docentes = [];
let editando = null;
let pendiente = null;      // lo que se hace si se toca "Sí" en la confirmación
let limpiarAlCerrar = false;

const turnosMarcados = (form) => [...form.querySelectorAll('input[name="turno[]"]')]
    .filter((opcion) => opcion.checked).map((opcion) => opcion.value);

function actualizarTurno() {
    vistaTurno.textContent = turnosMarcados(formDocente).join(", ") || "Turno";
}

opcionesTurno.forEach((opcion) => opcion.addEventListener("change", actualizarTurno));
alLimpiar(formDocente, actualizarTurno);

function mostrarError(texto, elemento = errorDocente) {
    elemento.textContent = texto;
    elemento.hidden = !texto;
}

async function enviar(datos) {
    const respuesta = await fetch(DIRECCION_DOCENTES, { method: "POST", body: datos });
    return respuesta.json();
}

function confirmar(texto, accion) {
    pendiente = accion;
    porId("modalConfirmarDocenteTexto").textContent = texto;
    modalConfirmar.returnValue = "";
    modalConfirmar.showModal();
}

function avisarListo(texto, limpiar = false) {
    porId("modalDocenteSubidoTexto").textContent = texto;
    limpiarAlCerrar = limpiar;
    modalSubido.showModal();
}

// Al tocar "Subir" primero pregunta si está seguro
formDocente.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!turnosMarcados(formDocente).length) {
        mostrarError("Elegí al menos un turno.");
        return;
    }
    mostrarError("");
    confirmar("¿Seguro que querés agregar este docente?", subirDocente);
});

async function subirDocente() {
    const datos = new FormData(formDocente);
    datos.append("accion", "crear");
    botonSubir.disabled = true;

    try {
        const resultado = await enviar(datos);
        if (resultado.exito) {
            avisarListo("Se agregó el docente correctamente", true);
        } else {
            mostrarError(resultado.mensaje || "No se pudo agregar el docente.");
        }
    } catch {
        // Si el servidor no responde, se avisa que no se agregó
        mostrarError("No se pudo conectar con el servidor. El docente no se agregó.");
    } finally {
        botonSubir.disabled = false;
    }
}

// Buscador: no importan mayúsculas ni tildes, y cada palabra puede estar
// en el nombre o en la asignatura ("perez ingles" encuentra a Pérez de Inglés)
const normalizar = (texto) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function boton(texto, clase, accion) {
    const nuevo = crear("button", `admin-btn ${clase}`, texto);
    nuevo.type = "button";
    nuevo.addEventListener("click", accion);
    return nuevo;
}

function crearFila(docente) {
    const fila = crear("li", "admin-edicion__item admin-edicion__item--sin-imagen");

    const datos = crear("div", "admin-edicion__datos");
    datos.append(
        crear("span", "admin-edicion__fecha", docente.turnos_docente),
        crear("p", "admin-edicion__titulo", docente.nom_docente),
        crear("p", "admin-edicion__detalle", docente.asignatura_docente)
    );

    const acciones = crear("div", "admin-edicion__acciones");
    acciones.append(
        boton("Editar", "admin-btn--secondary", () => abrirEdicion(docente)),
        boton("Eliminar", "admin-btn--primary", () => confirmar(
            `¿Seguro que querés eliminar a ${docente.nom_docente}, de ${docente.asignatura_docente}? No se puede deshacer.`,
            () => eliminarDocente(docente)))
    );

    fila.append(datos, acciones);
    return fila;
}

function filtrar() {
    const palabras = normalizar(buscador.value).split(/\s+/).filter(Boolean);
    const encontrados = docentes.filter((docente) => palabras.every((palabra) => docente.busqueda.includes(palabra)));
    const mostrados = encontrados.slice(0, MAXIMO_RESULTADOS);

    listaDocentes.replaceChildren(...mostrados.map(crearFila));
    if (!encontrados.length) {
        avisoDocentes.textContent = palabras.length ? "No se encontró ningún docente con esa búsqueda." : "Todavía no hay docentes cargados.";
    } else if (encontrados.length > mostrados.length) {
        avisoDocentes.textContent = `Se muestran ${mostrados.length} de ${encontrados.length}. Escribí más para achicar la búsqueda.`;
    } else {
        avisoDocentes.textContent = encontrados.length === 1 ? "1 docente encontrado." : `${encontrados.length} docentes encontrados.`;
    }
}

async function cargarDocentes() {
    avisoDocentes.textContent = "Cargando...";
    listaDocentes.replaceChildren();
    try {
        const respuesta = await fetch(`${DIRECCION_DOCENTES}?accion=listar`);
        const datos = await respuesta.json();
        if (!datos.exito) {
            avisoDocentes.textContent = datos.mensaje || "No se pudieron cargar los docentes.";
            return;
        }
        docentes = datos.docentes.map((docente) => ({
            ...docente,
            busqueda: normalizar(`${docente.nom_docente} ${docente.asignatura_docente}`)
        }));
        filtrar();
    } catch {
        avisoDocentes.textContent = "No se pudo conectar con el servidor.";
    }
}

buscador.addEventListener("input", filtrar);

porId("docentesEditarBtn").addEventListener("click", () => {
    modalDocentes.showModal();
    buscador.focus();
    cargarDocentes();
});
porId("docentesCerrar").addEventListener("click", () => modalDocentes.close());

// Editar un docente
function abrirEdicion(docente) {
    editando = docente;
    mostrarError("", porId("editarDocenteError"));
    formEditar.elements.nombre.value = docente.nom_docente;
    formEditar.elements.asignatura.value = docente.asignatura_docente;
    const turnos = docente.turnos_docente.split(",").map((turno) => turno.trim());
    formEditar.querySelectorAll('input[name="turno[]"]').forEach((opcion) => {
        opcion.checked = turnos.includes(opcion.value);
    });
    modalEditar.showModal();
}

porId("editarDocenteCancelar").addEventListener("click", () => modalEditar.close());

formEditar.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const error = porId("editarDocenteError");
    if (!turnosMarcados(formEditar).length) {
        mostrarError("Elegí al menos un turno.", error);
        return;
    }
    const datos = new FormData(formEditar);
    datos.append("accion", "editar");
    datos.append("id", editando.id_docente);

    const botonGuardar = formEditar.querySelector('button[type="submit"]');
    botonGuardar.disabled = true;
    mostrarError("", error);
    try {
        const resultado = await enviar(datos);
        if (!resultado.exito) {
            mostrarError(resultado.mensaje || "No se pudo guardar el docente.", error);
            return;
        }
        modalEditar.close();
        avisarListo("Se guardaron los cambios correctamente");
        cargarDocentes();
    } catch {
        mostrarError("No se pudo conectar con el servidor. No se guardó nada.", error);
    } finally {
        botonGuardar.disabled = false;
    }
});

async function eliminarDocente(docente) {
    const datos = new FormData();
    datos.append("accion", "eliminar");
    datos.append("id", docente.id_docente);
    try {
        const resultado = await enviar(datos);
        if (!resultado.exito) {
            avisoDocentes.textContent = resultado.mensaje || "No se pudo eliminar el docente.";
            return;
        }
        avisarListo("Se eliminó el docente correctamente");
        cargarDocentes();
    } catch {
        avisoDocentes.textContent = "No se pudo conectar con el servidor. No se eliminó nada.";
    }
}

// Si tocó "Sí", se hace lo que estaba esperando
modalConfirmar.addEventListener("close", () => {
    const accion = pendiente;
    pendiente = null;
    if (modalConfirmar.returnValue === "si" && accion) accion();
});

// Después de agregar uno, el formulario queda vacío para otro docente
modalSubido.addEventListener("close", () => {
    if (limpiarAlCerrar) formDocente.reset();
});

[modalConfirmar, modalSubido, modalDocentes, modalEditar].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});