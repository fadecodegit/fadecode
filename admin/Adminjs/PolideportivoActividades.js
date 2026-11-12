// Pantalla de Actividades del Polideportivo.
// Edita el texto de arriba, agrega actividades con "Subir" y las edita,
// elimina o restaura desde "Editar".

const DIRECCION_ACTIVIDADES = "../backend/polideportivo-actividades.php";
const PAGINA_ACTIVIDADES = "../html/Actividades-Polideportivo.html";

vincularImagen("actividadImagen", "actividadImagenThumb");

const formIntro = porId("formIntro");
const formActividad = porId("formActividad");
const formEditar = porId("formEditarActividad");
const botonRestaurarIntro = porId("introRestaurar");
const campoImagenEditar = porId("editarActividadImagen");
const miniaturaEditar = porId("editarActividadThumb").querySelector("img");
const modalActividades = porId("modalActividades");
const modalActividad = porId("modalActividad");
const modalConfirmar = porId("modalConfirmarActividad");
const modalCambios = porId("modalActividadCambios");
const listaActividades = porId("actividadesLista");
const avisoActividades = porId("actividadesAviso");

let originales = null;    // lo que trae la página pública
let intro = null;         // el texto de arriba que se ve hoy
let actividades = [];     // las que se ven hoy (y las eliminadas)
let editando = null;      // actividad abierta en el modal de edición
let pendiente = null;     // cambio que espera el "Sí" de la confirmación
let imagenNueva = null;   // dirección de la imagen elegida en "Agregar actividad"

const limpiarTexto = (elemento) => (elemento ? elemento.textContent.replace(/\s+/g, " ").trim() : "");

function mostrarError(id, texto) {
    porId(id).textContent = texto;
    porId(id).hidden = !texto;
}

function avisar(texto) {
    avisoActividades.textContent = texto;
    avisoActividades.hidden = !texto;
}

async function enviar(datos) {
    const respuesta = await fetch(DIRECCION_ACTIVIDADES, { method: "POST", body: datos });
    return respuesta.json();
}

function formulario(accion, campos = {}) {
    const datos = new FormData();
    datos.append("accion", accion);
    Object.entries(campos).forEach(([nombre, valor]) => datos.append(nombre, valor));
    return datos;
}

// Si una imagen no carga, no se muestra el ícono de imagen rota
function crearImagenSegura(url, alt = "") {
    const imagen = document.createElement("img");
    imagen.alt = alt;
    imagen.addEventListener("error", () => {
        imagen.hidden = true;
    });
    if (url) imagen.src = url;
    return imagen;
}

// Lee el contenido original de la página pública
async function leerOriginales() {
    const respuesta = await fetch(PAGINA_ACTIVIDADES);
    const pagina = new DOMParser().parseFromString(await respuesta.text(), "text/html");
    return {
        intro: limpiarTexto(pagina.querySelector(".pact-intro")),
        actividades: [...pagina.querySelectorAll("[data-actividad-fija]")].map((tarjeta) => ({
            clave: tarjeta.dataset.actividadFija,
            imagen: tarjeta.querySelector(".pact-card-item__image").getAttribute("src"),
            nombre: limpiarTexto(tarjeta.querySelector(".pact-card-item__title")),
            horario: limpiarTexto(tarjeta.querySelector(".pact-card-item__schedule")),
            descripcion: limpiarTexto(tarjeta.querySelector(".pact-card-item__text"))
        }))
    };
}

// Vista previa
function crearTarjeta(actividad, clase = "") {
    const tarjeta = crear("article", `admin-actividad-item ${clase}`.trim());
    if (actividad.imagen) {
        const contenedor = crear("div", "admin-actividad-item__image");
        contenedor.appendChild(crearImagenSegura(actividad.imagen, actividad.nombre));
        tarjeta.appendChild(contenedor);
    }
    const cuerpo = crear("div", "admin-actividad-item__body");
    cuerpo.appendChild(crear("h3", "admin-actividad-item__title", actividad.nombre));
    if (actividad.horario) {
        cuerpo.appendChild(crear("span", "admin-actividad-item__schedule", actividad.horario));
    }
    cuerpo.appendChild(crear("p", "admin-actividad-item__text", actividad.descripcion));
    tarjeta.appendChild(cuerpo);
    return tarjeta;
}

function pintarVistaPrevia() {
    if (intro === null) return;
    porId("previewActividadesIntro").textContent = formIntro.elements.intro.value.trim() || intro.texto;

    const tarjetas = actividades.filter((actividad) => !actividad.eliminada).map((actividad) => crearTarjeta(actividad));

    // La actividad que se está cargando se ve al final
    const nueva = {
        imagen: imagenNueva,
        nombre: formActividad.elements.nombre.value.trim(),
        horario: formActividad.elements.horario.value.trim(),
        descripcion: formActividad.elements.descripcion.value.trim()
    };
    if (nueva.imagen || nueva.nombre || nueva.horario || nueva.descripcion) {
        tarjetas.push(crearTarjeta({ ...nueva, nombre: nueva.nombre || "Nombre de la actividad" }, "admin-actividad-item--borrador"));
    }

    const aviso = porId("previewActividadesAviso");
    aviso.textContent = "La página no tiene ninguna actividad.";
    aviso.hidden = tarjetas.length > 0;
    porId("previewActividadesGrid").replaceChildren(aviso, ...tarjetas);
}

async function cargar() {
    try {
        const [base, respuesta] = await Promise.all([
            originales ? originales : leerOriginales(),
            fetch(`${DIRECCION_ACTIVIDADES}?accion=listar`)
        ]);
        originales = base;
        const datos = await respuesta.json();
        if (!datos.exito) throw new Error(datos.mensaje);

        const cambio = (clave) => datos.fijas.find((fila) => fila.clave_fija === clave);
        const cambioIntro = cambio("intro");
        intro = cambioIntro
            ? { editado: true, texto: cambioIntro.descripcion }
            : { editado: false, texto: originales.intro };

        actividades = [
            ...originales.actividades.map((actividad) => {
                const fila = cambio(actividad.clave);
                const editada = Boolean(fila && fila.nombre);
                return {
                    ...actividad,
                    editada,
                    eliminada: Boolean(fila && Number(fila.eliminada)),
                    nombre: editada ? fila.nombre : actividad.nombre,
                    horario: editada ? fila.horario || "" : actividad.horario,
                    descripcion: editada ? fila.descripcion : actividad.descripcion,
                    imagen: editada && fila.imagen ? `../${fila.imagen}` : actividad.imagen
                };
            }),
            ...datos.nuevas.map((fila) => ({
                id: fila.id_actividad,
                nombre: fila.nombre,
                horario: fila.horario || "",
                descripcion: fila.descripcion,
                imagen: `../${fila.imagen}`
            }))
        ];

        formIntro.elements.intro.value = intro.texto;
        botonRestaurarIntro.hidden = !intro.editado;
        pintarVistaPrevia();
        if (modalActividades.open) pintarLista();
    } catch {
        const aviso = porId("previewActividadesAviso");
        aviso.textContent = "No se pudieron cargar las actividades.";
        aviso.hidden = false;
        avisar("No se pudo conectar con el servidor.");
    }
}

function avisarCambio(texto) {
    porId("modalActividadCambiosTexto").textContent = texto;
    modalCambios.showModal();
    cargar();
}

function confirmar(texto, datos, aviso) {
    pendiente = { datos, aviso };
    porId("modalConfirmarActividadTexto").textContent = texto;
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

// Texto de arriba
formIntro.addEventListener("input", pintarVistaPrevia);

formIntro.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formIntro);
    datos.append("accion", "guardar_intro");
    guardar(formIntro, datos, "introError", () => avisarCambio("Se guardó el texto correctamente"));
});

botonRestaurarIntro.addEventListener("click", () => confirmar(
    "¿Querés volver al texto original? Se pierden los cambios.",
    formulario("restaurar_intro"), "Se restauró el texto original"));

// Agregar actividad
function cambiarImagenNueva() {
    if (imagenNueva) URL.revokeObjectURL(imagenNueva);
    imagenNueva = urlImagen(porId("actividadImagen"));
    pintarVistaPrevia();
}

porId("actividadImagen").addEventListener("change", cambiarImagenNueva);
formActividad.addEventListener("input", pintarVistaPrevia);
formActividad.addEventListener("reset", () => setTimeout(cambiarImagenNueva));

formActividad.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formActividad);
    datos.append("accion", "crear");
    guardar(formActividad, datos, "actividadError", () => {
        formActividad.reset();
        avisarCambio("Se subió la actividad correctamente");
    });
});

// Lista de actividades (botón Editar)
function boton(texto, clase, accion) {
    const nuevo = crear("button", `admin-btn ${clase}`, texto);
    nuevo.type = "button";
    nuevo.addEventListener("click", accion);
    return nuevo;
}

function identificar(actividad, accion) {
    return formulario(accion, actividad.clave ? { clave: actividad.clave } : { id: actividad.id });
}

function crearFila(actividad) {
    const fila = crear("li", "admin-edicion__item");

    const imagen = crearImagenSegura(actividad.imagen);
    imagen.className = "admin-edicion__imagen";

    const estado = actividad.eliminada ? "Eliminada" : actividad.editada ? "Editada" : actividad.clave ? "" : "Nueva";
    const datos = crear("div", "admin-edicion__datos");
    datos.append(
        crear("span", "admin-edicion__fecha", estado),
        crear("p", "admin-edicion__titulo", actividad.nombre),
        crear("p", "admin-edicion__detalle", actividad.horario)
    );

    const acciones = crear("div", "admin-edicion__acciones");
    if (!actividad.eliminada) {
        acciones.append(boton("Editar", "admin-btn--secondary", () => abrirEdicion(actividad)));
        acciones.append(boton("Eliminar", "admin-btn--primary", () => confirmar(
            actividad.clave
                ? "¿Seguro que querés eliminar esta actividad? Deja de verse en la página; después la podés restaurar."
                : "¿Seguro que querés eliminar esta actividad? No se puede deshacer.",
            identificar(actividad, actividad.clave ? "eliminar_fijo" : "eliminar"), "Se eliminó la actividad")));
    }
    if (actividad.clave && (actividad.eliminada || actividad.editada)) {
        acciones.append(boton("Restaurar", "admin-btn--secondary", () => confirmar(
            "¿Querés volver a mostrar esta actividad como era originalmente? Se pierden los cambios.",
            identificar(actividad, "restaurar_fijo"), "Se restauró la actividad original")));
    }

    fila.append(imagen, datos, acciones);
    return fila;
}

function pintarLista() {
    avisar(actividades.length ? "" : "La página no tiene ninguna actividad.");
    listaActividades.replaceChildren(...actividades.map(crearFila));
}

porId("actividadesEditarBtn").addEventListener("click", () => {
    avisar("");
    pintarLista();
    modalActividades.showModal();
});
porId("actividadesCerrar").addEventListener("click", () => modalActividades.close());

// Modal de edición
function abrirEdicion(actividad) {
    editando = actividad;
    formEditar.reset();
    mostrarError("editarActividadError", "");
    porId("modalActividadTitulo").textContent = `Editar: ${actividad.nombre}`;
    formEditar.elements.nombre.value = actividad.nombre;
    formEditar.elements.horario.value = actividad.horario;
    formEditar.elements.descripcion.value = actividad.descripcion;
    miniaturaEditar.hidden = false;
    ponerImagen(miniaturaEditar, actividad.imagen);
    modalActividad.showModal();
}

miniaturaEditar.addEventListener("error", () => {
    miniaturaEditar.hidden = true;
});

campoImagenEditar.addEventListener("change", () => {
    const url = urlImagen(campoImagenEditar);
    if (url) {
        miniaturaEditar.hidden = false;
        ponerImagen(miniaturaEditar, url);
    }
});

porId("editarActividadCancelar").addEventListener("click", () => modalActividad.close());

formEditar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formEditar);
    datos.append("accion", editando.clave ? "editar_fijo" : "editar");
    datos.append(editando.clave ? "clave" : "id", editando.clave || editando.id);
    if (!campoImagenEditar.files[0]) datos.delete("imagen");
    guardar(formEditar, datos, "editarActividadError", () => {
        modalActividad.close();
        avisarCambio("Se guardaron los cambios correctamente");
    });
});

// Si confirmó, elimina o restaura lo elegido
modalConfirmar.addEventListener("close", async () => {
    if (modalConfirmar.returnValue !== "si" || !pendiente) return;
    const { datos, aviso } = pendiente;
    pendiente = null;
    // El error se muestra donde está mirando: en la lista o debajo del texto
    const error = (texto) => (modalActividades.open ? avisar(texto) : mostrarError("introError", texto));
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

[modalActividades, modalActividad, modalConfirmar, modalCambios].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});

cargar();
