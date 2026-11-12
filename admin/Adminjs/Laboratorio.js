// Pantalla de Laboratorio: agrega fotos al carrusel y edita las que hay.
// Los cambios se borran solos al reiniciar el servidor.

const DIRECCION_LABORATORIO = "../backend/laboratorio.php";
const PAGINA_LABORATORIO = "../html/Laboratorio.html";

vincularImagen("labImagen", "labThumb");

const formFoto = porId("formLaboratorio");
const formEditar = porId("formEditarLaboratorio");
const campoImagenEditar = porId("editarLaboratorioImagen");
const miniaturaEditar = porId("editarLaboratorioThumb").querySelector("img");
const modalLaboratorio = porId("modalLaboratorio");
const modalFoto = porId("modalFotoLab");
const modalConfirmar = porId("modalConfirmarLab");
const modalCambios = porId("modalLaboratorioCambios");
const listaFotos = porId("laboratorioLista");
const avisoFotos = porId("laboratorioAviso");

let originales = null;    // las que trae la página pública
let fotos = [];           // las que se ven hoy (y las eliminadas)
let editando = null;      // foto abierta en el modal de edición
let pendiente = null;     // cambio que espera el "Sí" de la confirmación
let imagenNueva = null;   // dirección de la imagen elegida en "Agregar imagen"

const limpiarTexto = (elemento) => (elemento ? elemento.textContent.replace(/\s+/g, " ").trim() : "");

function mostrarError(id, texto) {
    porId(id).textContent = texto;
    porId(id).hidden = !texto;
}

function avisar(texto) {
    avisoFotos.textContent = texto;
    avisoFotos.hidden = !texto;
}

async function enviar(datos) {
    const respuesta = await fetch(DIRECCION_LABORATORIO, { method: "POST", body: datos });
    return respuesta.json();
}

// Lee las fotos originales de la página pública
async function leerOriginales() {
    const respuesta = await fetch(PAGINA_LABORATORIO);
    const pagina = new DOMParser().parseFromString(await respuesta.text(), "text/html");
    return [...pagina.querySelectorAll("[data-carousel-slide]")].map((diapositiva) => ({
        numero: Number(diapositiva.dataset.carouselSlide),
        imagen: diapositiva.querySelector(".lab-carousel__image").getAttribute("src"),
        texto: limpiarTexto(diapositiva.querySelector(".lab-carousel__description"))
    }));
}

// Vista previa
function crearTarjeta(foto, clase = "") {
    const tarjeta = crear("article", `admin-lab-item ${clase}`.trim());
    if (foto.imagen) {
        const contenedor = crear("div", "admin-lab-item__image");
        const imagen = document.createElement("img");
        imagen.src = foto.imagen;
        imagen.alt = "";
        contenedor.appendChild(imagen);
        tarjeta.appendChild(contenedor);
    }
    tarjeta.appendChild(crear("p", "admin-lab-item__text", foto.texto));
    return tarjeta;
}

function pintarVistaPrevia() {
    const tarjetas = fotos.filter((foto) => !foto.eliminada).map((foto) => crearTarjeta(foto));

    // La foto que se está cargando se ve al final
    const texto = formFoto.elements.texto.value.trim();
    if (imagenNueva || texto) {
        tarjetas.push(crearTarjeta({ imagen: imagenNueva, texto }, "admin-lab-item--borrador"));
    }

    const aviso = porId("labGalleryAviso");
    aviso.textContent = "El carrusel no tiene ninguna foto.";
    aviso.hidden = tarjetas.length > 0;
    porId("labGallery").replaceChildren(aviso, ...tarjetas);
}

async function cargar() {
    try {
        const [base, respuesta] = await Promise.all([
            originales ? originales : leerOriginales(),
            fetch(`${DIRECCION_LABORATORIO}?accion=listar`)
        ]);
        originales = base;
        const datos = await respuesta.json();
        if (!datos.exito) throw new Error(datos.mensaje);

        fotos = [
            ...originales.map((foto) => {
                const fila = datos.diapositivas.find((cambio) => Number(cambio.id_diapositiva) === foto.numero);
                const editada = Boolean(fila && fila.texto_lab);
                return {
                    ...foto,
                    editada,
                    eliminada: Boolean(fila && Number(fila.eliminada)),
                    texto: editada ? fila.texto_lab : foto.texto,
                    imagen: editada && fila.imagen_lab ? `../${fila.imagen_lab}` : foto.imagen
                };
            }),
            ...datos.nuevas.map((fila) => ({ id: fila.id_foto, texto: fila.texto_lab, imagen: `../${fila.imagen_lab}` }))
        ];

        pintarVistaPrevia();
        if (modalLaboratorio.open) pintarLista();
    } catch {
        const aviso = porId("labGalleryAviso");
        aviso.textContent = "No se pudieron cargar las fotos.";
        aviso.hidden = false;
        avisar("No se pudo conectar con el servidor.");
    }
}

function avisarCambio(texto) {
    porId("modalLaboratorioCambiosTexto").textContent = texto;
    modalCambios.showModal();
    cargar();
}

function confirmar(texto, datos, aviso) {
    pendiente = { datos, aviso };
    porId("modalConfirmarLabTexto").textContent = texto;
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

// Agregar imagen
function cambiarImagenNueva() {
    if (imagenNueva) URL.revokeObjectURL(imagenNueva);
    imagenNueva = urlImagen(porId("labImagen"));
    pintarVistaPrevia();
}

porId("labImagen").addEventListener("change", cambiarImagenNueva);
formFoto.addEventListener("input", pintarVistaPrevia);
formFoto.addEventListener("reset", () => setTimeout(cambiarImagenNueva));

formFoto.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formFoto);
    datos.append("accion", "crear");
    guardar(formFoto, datos, "labError", () => {
        formFoto.reset();
        avisarCambio("Se subió la foto correctamente");
    });
});

// Lista de fotos (botón Editar)
function boton(texto, clase, accion) {
    const nuevo = crear("button", `admin-btn ${clase}`, texto);
    nuevo.type = "button";
    nuevo.addEventListener("click", accion);
    return nuevo;
}

function formulario(accion, foto) {
    const datos = new FormData();
    datos.append("accion", accion);
    datos.append("id", foto.numero || foto.id);
    return datos;
}

function crearFila(foto) {
    const fila = crear("li", "admin-edicion__item");

    const imagen = crear("img", "admin-edicion__imagen");
    imagen.alt = "";
    imagen.src = foto.imagen;

    const estado = foto.eliminada ? "Eliminada" : foto.editada ? "Editada" : foto.numero ? `Foto ${foto.numero}` : "Nueva";
    const datos = crear("div", "admin-edicion__datos");
    datos.append(crear("span", "admin-edicion__fecha", estado), crear("p", "admin-edicion__titulo", foto.texto));

    const acciones = crear("div", "admin-edicion__acciones");
    if (!foto.eliminada) {
        acciones.append(boton("Editar", "admin-btn--secondary", () => abrirEdicion(foto)));
        acciones.append(boton("Eliminar", "admin-btn--primary", () => confirmar(
            foto.numero
                ? "¿Seguro que querés eliminar esta foto? Deja de verse en el carrusel; después la podés restaurar."
                : "¿Seguro que querés eliminar esta foto? No se puede deshacer.",
            formulario(foto.numero ? "eliminar_fijo" : "eliminar_nueva", foto), "Se eliminó la foto")));
    }
    if (foto.numero && (foto.eliminada || foto.editada)) {
        acciones.append(boton("Restaurar", "admin-btn--secondary", () => confirmar(
            "¿Querés volver a mostrar esta foto como era originalmente? Se pierden los cambios.",
            formulario("restaurar_fijo", foto), "Se restauró la foto original")));
    }

    fila.append(imagen, datos, acciones);
    return fila;
}

function pintarLista() {
    avisar(fotos.length ? "" : "El carrusel no tiene ninguna foto.");
    listaFotos.replaceChildren(...fotos.map(crearFila));
}

porId("laboratorioEditarBtn").addEventListener("click", () => {
    avisar("");
    pintarLista();
    modalLaboratorio.showModal();
});
porId("laboratorioCerrar").addEventListener("click", () => modalLaboratorio.close());

// Modal de edición
function abrirEdicion(foto) {
    editando = foto;
    formEditar.reset();
    mostrarError("editarLaboratorioError", "");
    porId("modalFotoLabTitulo").textContent = foto.numero ? `Editar foto ${foto.numero}` : "Editar foto nueva";
    formEditar.elements.texto.value = foto.texto;
    ponerImagen(miniaturaEditar, foto.imagen);
    modalFoto.showModal();
}

campoImagenEditar.addEventListener("change", () => {
    const url = urlImagen(campoImagenEditar);
    if (url) ponerImagen(miniaturaEditar, url);
});

porId("editarLaboratorioCancelar").addEventListener("click", () => modalFoto.close());

formEditar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formEditar);
    datos.append("accion", editando.numero ? "editar" : "editar_nueva");
    datos.append("id", editando.numero || editando.id);
    if (!campoImagenEditar.files[0]) datos.delete("imagen");
    guardar(formEditar, datos, "editarLaboratorioError", () => {
        modalFoto.close();
        avisarCambio("Se guardaron los cambios correctamente");
    });
});

// Si confirmó, elimina o restaura lo elegido
modalConfirmar.addEventListener("close", async () => {
    if (modalConfirmar.returnValue !== "si" || !pendiente) return;
    const { datos, aviso } = pendiente;
    pendiente = null;
    try {
        const resultado = await enviar(datos);
        if (resultado.exito) {
            avisarCambio(aviso);
        } else {
            avisar(resultado.mensaje || "No se pudo completar el cambio.");
        }
    } catch {
        avisar("No se pudo conectar con el servidor. No se cambió nada.");
    }
});

[modalLaboratorio, modalFoto, modalConfirmar, modalCambios].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});

cargar();
