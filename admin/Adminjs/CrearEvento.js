// Pantalla de Eventos: crea eventos con vista previa.
// Antes de subir pregunta si está seguro y después avisa que se subió.

vincularTexto("eventoFecha", "previewEventoDate");
vincularTexto("eventoDescripcion", "previewEventoDescription");

// El color elegido pinta el recuadro de la fecha
const campoColor = porId("eventoColor");
const pintarFecha = () => {
    porId("previewEventoDate").style.backgroundColor = campoColor.value;
};
campoColor.addEventListener("input", pintarFecha);
alLimpiar(campoColor.form, pintarFecha);

const formEvento = document.getElementById("formEvento");
const modalConfirmar = document.getElementById("modalConfirmarEvento");
const modalSubido = document.getElementById("modalEventoSubido");
const errorEvento = document.getElementById("eventoError");
const botonSubir = formEvento.querySelector('button[type="submit"]');
const direccionEventos = formEvento.action;

function mostrarError(texto) {
    errorEvento.textContent = texto;
    errorEvento.hidden = !texto;
}

// Al tocar "Subir" primero pregunta si está seguro
formEvento.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mostrarError("");
    modalConfirmar.returnValue = "";
    modalConfirmar.showModal();
});

// Envía un cambio al servidor y devuelve la respuesta
async function enviarCambio(accion, datos) {
    datos.append("accion", accion);
    const respuesta = await fetch(direccionEventos, { method: "POST", body: datos });
    return respuesta.json();
}

async function subirEvento() {
    botonSubir.disabled = true;

    try {
        const resultado = await enviarCambio("crear", new FormData(formEvento));
        if (resultado.exito) {
            modalSubido.showModal();
        } else {
            mostrarError(resultado.mensaje || "No se pudo subir el evento.");
        }
    } catch {
        // Si el servidor no responde, se avisa que no se subió
        mostrarError("No se pudo conectar con el servidor. El evento no se subió.");
    } finally {
        botonSubir.disabled = false;
    }
}

// Si tocó "Sí", se envía
modalConfirmar.addEventListener("close", () => {
    if (modalConfirmar.returnValue === "si") subirEvento();
});

// Después del aviso, el formulario queda vacío para otro evento
modalSubido.addEventListener("close", () => formEvento.reset());

// Botón Editar: lista todos los eventos para editarlos o eliminarlos.
// Los que ya estaban en la página vuelven a como eran al reiniciar el servidor.

const modalEventos = document.getElementById("modalEventos");
const vistaLista = document.getElementById("eventosVistaLista");
const listaEventos = document.getElementById("eventosLista");
const avisoEventos = document.getElementById("eventosAviso");
const formEditar = document.getElementById("formEditarEvento");
const errorEditar = document.getElementById("editarEventoError");
const modalEliminar = document.getElementById("modalEliminarEvento");
const textoEliminar = document.getElementById("modalEliminarEventoTexto");
const modalCambios = document.getElementById("modalEventoCambios");
const textoCambios = document.getElementById("modalEventoCambiosTexto");
let eventoAEliminar = null;

function mostrarVistaLista() {
    formEditar.hidden = true;
    vistaLista.hidden = false;
}

function avisar(texto) {
    avisoEventos.textContent = texto;
    avisoEventos.hidden = !texto;
}

function crearFilaEvento(evento) {
    const fila = document.createElement("li");
    fila.className = "admin-edicion__item";

    const color = document.createElement("div");
    color.className = "admin-edicion__imagen";
    color.style.backgroundColor = evento.color_evento;

    const datos = document.createElement("div");
    datos.className = "admin-edicion__datos";
    const fecha = document.createElement("span");
    fecha.className = "admin-edicion__fecha";
    fecha.textContent = evento.fecha_texto;
    const descripcion = document.createElement("p");
    descripcion.className = "admin-edicion__titulo";
    descripcion.textContent = evento.descripcion;
    datos.append(fecha, descripcion);

    const botonEditar = document.createElement("button");
    botonEditar.className = "admin-btn admin-btn--secondary";
    botonEditar.type = "button";
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener("click", () => abrirEdicion(evento));

    const botonEliminar = document.createElement("button");
    botonEliminar.className = "admin-btn admin-btn--primary";
    botonEliminar.type = "button";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", () => {
        eventoAEliminar = evento;
        textoEliminar.textContent = evento.clave
            ? "¿Seguro que querés eliminar este evento? Vuelve a aparecer al reiniciar el servidor."
            : "¿Seguro que querés eliminar este evento? No se puede deshacer.";
        modalEliminar.returnValue = "";
        modalEliminar.showModal();
    });

    const acciones = document.createElement("div");
    acciones.className = "admin-edicion__acciones";
    acciones.append(botonEditar, botonEliminar);

    fila.append(color, datos, acciones);
    return fila;
}

// Los eventos que ya trae la página y todavía se ven, con sus cambios
async function leerEventosFijos(borrados, editados) {
    const respuesta = await fetch("../html/Eventos.html");
    const pagina = new DOMParser().parseFromString(await respuesta.text(), "text/html");

    return [...pagina.querySelectorAll("[data-evento-fijo]")]
        .filter((tarjeta) => !borrados.includes(tarjeta.dataset.eventoFijo))
        .map((tarjeta) => {
            const clave = tarjeta.dataset.eventoFijo;
            const cambio = editados.find((fila) => fila.clave_evento === clave);
            return cambio ? { clave, ...cambio } : {
                clave,
                fecha_texto: tarjeta.querySelector(".event-item__date").textContent.trim(),
                descripcion: tarjeta.querySelector(".event-item__description").textContent.trim(),
                // El gris que tienen en la página
                color_evento: "#d9d9d9"
            };
        });
}

async function cargarEventosSubidos() {
    listaEventos.replaceChildren();
    avisar("Cargando...");

    try {
        const respuesta = await fetch(`${direccionEventos}?accion=listar`);
        const datos = await respuesta.json();
        if (!datos.exito) {
            avisar(datos.mensaje || "No se pudieron cargar los eventos.");
            return;
        }
        const eventos = [...datos.eventos, ...await leerEventosFijos(datos.fijos_borrados, datos.fijos_editados || [])];
        avisar(eventos.length ? "" : "No hay eventos para mostrar.");
        listaEventos.replaceChildren(...eventos.map(crearFilaEvento));
    } catch {
        avisar("No se pudo conectar con el servidor.");
    }
}

function abrirEdicion(evento) {
    errorEditar.hidden = true;
    document.getElementById("editarEventoId").value = evento.id_evento || "";
    document.getElementById("editarEventoClave").value = evento.clave || "";
    document.getElementById("editarEventoColor").value = evento.color_evento;
    document.getElementById("editarEventoFecha").value = evento.fecha_texto;
    document.getElementById("editarEventoDescripcion").value = evento.descripcion;
    vistaLista.hidden = true;
    formEditar.hidden = false;
}

function avisarCambio(texto) {
    textoCambios.textContent = texto;
    modalCambios.showModal();
    mostrarVistaLista();
    cargarEventosSubidos();
}

document.getElementById("eventosEditarBtn").addEventListener("click", () => {
    mostrarVistaLista();
    modalEventos.showModal();
    cargarEventosSubidos();
});

document.getElementById("eventosCerrar").addEventListener("click", () => modalEventos.close());
document.getElementById("editarEventoVolver").addEventListener("click", mostrarVistaLista);

formEditar.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    errorEditar.hidden = true;
    const boton = formEditar.querySelector('button[type="submit"]');
    boton.disabled = true;

    try {
        const datos = new FormData(formEditar);
        const fijo = Boolean(datos.get("clave"));
        datos.delete(fijo ? "id" : "clave");
        const resultado = await enviarCambio(fijo ? "editar_fijo" : "editar", datos);
        if (resultado.exito) {
            avisarCambio("Se guardaron los cambios correctamente");
        } else {
            errorEditar.textContent = resultado.mensaje || "No se pudo editar el evento.";
            errorEditar.hidden = false;
        }
    } catch {
        errorEditar.textContent = "No se pudo conectar con el servidor. Los cambios no se guardaron.";
        errorEditar.hidden = false;
    } finally {
        boton.disabled = false;
    }
});

// Si confirmó, elimina el evento elegido
modalEliminar.addEventListener("close", async () => {
    if (modalEliminar.returnValue !== "si") return;

    const fijo = Boolean(eventoAEliminar.clave);
    const datos = new FormData();
    datos.append(fijo ? "clave" : "id", fijo ? eventoAEliminar.clave : eventoAEliminar.id_evento);

    try {
        const resultado = await enviarCambio(fijo ? "eliminar_fijo" : "eliminar", datos);
        if (resultado.exito) {
            avisarCambio("Se eliminó el evento correctamente");
        } else {
            avisar(resultado.mensaje || "No se pudo eliminar el evento.");
        }
    } catch {
        avisar("No se pudo conectar con el servidor. El evento no se eliminó.");
    }
});

[modalConfirmar, modalSubido, modalEventos, modalEliminar, modalCambios].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});
