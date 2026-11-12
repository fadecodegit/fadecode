// Pantalla de Figuras importantes del Polideportivo.
// Agrega figuras con "Subir" y las edita, elimina o restaura desde "Editar".

const DIRECCION_FIGURAS = "../backend/polideportivo-figuras.php";
const PAGINA_FIGURAS = "../html/Figuras-Polideportivo.html";

vincularImagen("figuraFoto", "figuraFotoThumb");

const formFigura = porId("formFiguras");
const formEditar = porId("formEditarFigura");
const campoFotoEditar = porId("editarFiguraFoto");
const miniaturaEditar = porId("editarFiguraThumb").querySelector("img");
const modalFiguras = porId("modalFiguras");
const modalFigura = porId("modalFigura");
const modalConfirmar = porId("modalConfirmarFigura");
const modalCambios = porId("modalFiguraCambios");
const listaFiguras = porId("figurasLista");
const avisoFiguras = porId("figurasAviso");

let originales = null;    // las que trae la página pública
let figuras = [];         // las que se ven hoy (y las eliminadas)
let editando = null;      // figura abierta en el modal de edición
let pendiente = null;     // cambio que espera el "Sí" de la confirmación

const limpiarTexto = (elemento) => (elemento ? elemento.textContent.replace(/\s+/g, " ").trim() : "");

function mostrarError(id, texto) {
    porId(id).textContent = texto;
    porId(id).hidden = !texto;
}

function avisar(texto) {
    avisoFiguras.textContent = texto;
    avisoFiguras.hidden = !texto;
}

async function enviar(datos) {
    const respuesta = await fetch(DIRECCION_FIGURAS, { method: "POST", body: datos });
    return respuesta.json();
}

// Si una foto no carga, queda el círculo gris en lugar del ícono de imagen rota
function crearFoto(url, alt = "") {
    const foto = document.createElement("img");
    foto.alt = alt;
    foto.addEventListener("error", () => {
        foto.hidden = true;
    });
    if (url) foto.src = url;
    return foto;
}

// Lee las figuras originales de la página pública
async function leerOriginales() {
    const respuesta = await fetch(PAGINA_FIGURAS);
    const pagina = new DOMParser().parseFromString(await respuesta.text(), "text/html");
    return [...pagina.querySelectorAll("[data-figura-fija]")].map((tarjeta) => ({
        clave: tarjeta.dataset.figuraFija,
        imagen: tarjeta.querySelector(".pfig-item__image").getAttribute("src"),
        nombre: limpiarTexto(tarjeta.querySelector(".pfig-item__name")),
        cargo: limpiarTexto(tarjeta.querySelector(".pfig-item__cargo")),
        telefono: limpiarTexto(tarjeta.querySelector(".pfig-item__contacto"))
    }));
}

// Vista previa
function crearTarjeta(figura, clase = "") {
    const tarjeta = crear("article", `admin-figura-item ${clase}`.trim());
    const foto = crear("div", "admin-figura-item__photo");
    if (figura.imagen) foto.appendChild(crearFoto(figura.imagen, figura.nombre));
    tarjeta.append(
        foto,
        crear("h3", "admin-figura-item__name", figura.nombre),
        crear("p", "admin-figura-item__cargo", figura.cargo)
    );
    if (figura.telefono) {
        tarjeta.appendChild(crear("div", "admin-figura-item__contacto", `Contacto: ${figura.telefono}`));
    }
    return tarjeta;
}

function pintarVistaPrevia() {
    const tarjetas = figuras.filter((figura) => !figura.eliminada).map((figura) => crearTarjeta(figura));

    // La figura que se está cargando se ve al final
    const nueva = {
        imagen: fotoNueva,
        nombre: formFigura.elements.nombre.value.trim(),
        cargo: formFigura.elements.cargo.value.trim(),
        telefono: formFigura.elements.telefono.value.trim()
    };
    if (nueva.imagen || nueva.nombre || nueva.cargo || nueva.telefono) {
        tarjetas.push(crearTarjeta({ ...nueva, nombre: nueva.nombre || "Nombre", cargo: nueva.cargo || "Cargo" }, "admin-figura-item--borrador"));
    }

    const aviso = porId("previewFigurasAviso");
    aviso.textContent = "La página no tiene ninguna figura.";
    aviso.hidden = tarjetas.length > 0;
    porId("previewFigurasGrid").replaceChildren(aviso, ...tarjetas);
}

async function cargar() {
    try {
        const [base, respuesta] = await Promise.all([
            originales ? originales : leerOriginales(),
            fetch(`${DIRECCION_FIGURAS}?accion=listar`)
        ]);
        originales = base;
        const datos = await respuesta.json();
        if (!datos.exito) throw new Error(datos.mensaje);

        figuras = [
            ...originales.map((figura) => {
                const fila = datos.fijas.find((cambio) => cambio.clave_fija === figura.clave);
                const editada = Boolean(fila && fila.nombre);
                return {
                    ...figura,
                    editada,
                    eliminada: Boolean(fila && Number(fila.eliminada)),
                    nombre: editada ? fila.nombre : figura.nombre,
                    cargo: editada ? fila.cargo : figura.cargo,
                    telefono: editada ? fila.telefono || "" : figura.telefono,
                    imagen: editada && fila.imagen ? `../${fila.imagen}` : figura.imagen
                };
            }),
            ...datos.nuevas.map((fila) => ({
                id: fila.id_figura,
                nombre: fila.nombre,
                cargo: fila.cargo,
                telefono: fila.telefono || "",
                imagen: `../${fila.imagen}`
            }))
        ];

        pintarVistaPrevia();
        if (modalFiguras.open) pintarLista();
    } catch {
        const aviso = porId("previewFigurasAviso");
        aviso.textContent = "No se pudieron cargar las figuras.";
        aviso.hidden = false;
        avisar("No se pudo conectar con el servidor.");
    }
}

function avisarCambio(texto) {
    porId("modalFiguraCambiosTexto").textContent = texto;
    modalCambios.showModal();
    cargar();
}

function confirmar(texto, datos, aviso) {
    pendiente = { datos, aviso };
    porId("modalConfirmarFiguraTexto").textContent = texto;
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

// Agregar figura
let fotoNueva = null;

function cambiarFotoNueva() {
    if (fotoNueva) URL.revokeObjectURL(fotoNueva);
    fotoNueva = urlImagen(porId("figuraFoto"));
    pintarVistaPrevia();
}

porId("figuraFoto").addEventListener("change", cambiarFotoNueva);
formFigura.addEventListener("input", pintarVistaPrevia);
formFigura.addEventListener("reset", () => setTimeout(cambiarFotoNueva));

formFigura.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formFigura);
    datos.append("accion", "crear");
    guardar(formFigura, datos, "figuraError", () => {
        formFigura.reset();
        avisarCambio("Se subió la figura correctamente");
    });
});

// Lista de figuras (botón Editar)
function boton(texto, clase, accion) {
    const nuevo = crear("button", `admin-btn ${clase}`, texto);
    nuevo.type = "button";
    nuevo.addEventListener("click", accion);
    return nuevo;
}

function identificar(figura, accion) {
    const datos = new FormData();
    datos.append("accion", accion);
    datos.append(figura.clave ? "clave" : "id", figura.clave || figura.id);
    return datos;
}

function crearFila(figura) {
    const fila = crear("li", "admin-edicion__item");

    const imagen = crearFoto(figura.imagen);
    imagen.className = "admin-edicion__imagen";

    const estado = figura.eliminada ? "Eliminada" : figura.editada ? "Editada" : figura.clave ? "" : "Nueva";
    const datos = crear("div", "admin-edicion__datos");
    datos.append(
        crear("span", "admin-edicion__fecha", estado),
        crear("p", "admin-edicion__titulo", figura.nombre),
        crear("p", "admin-edicion__detalle", figura.cargo)
    );

    const acciones = crear("div", "admin-edicion__acciones");
    if (!figura.eliminada) {
        acciones.append(boton("Editar", "admin-btn--secondary", () => abrirEdicion(figura)));
        acciones.append(boton("Eliminar", "admin-btn--primary", () => confirmar(
            figura.clave
                ? "¿Seguro que querés eliminar esta figura? Deja de verse en la página; después la podés restaurar."
                : "¿Seguro que querés eliminar esta figura? No se puede deshacer.",
            identificar(figura, figura.clave ? "eliminar_fijo" : "eliminar"), "Se eliminó la figura")));
    }
    if (figura.clave && (figura.eliminada || figura.editada)) {
        acciones.append(boton("Restaurar", "admin-btn--secondary", () => confirmar(
            "¿Querés volver a mostrar esta figura como era originalmente? Se pierden los cambios.",
            identificar(figura, "restaurar_fijo"), "Se restauró la figura original")));
    }

    fila.append(imagen, datos, acciones);
    return fila;
}

function pintarLista() {
    avisar(figuras.length ? "" : "La página no tiene ninguna figura.");
    listaFiguras.replaceChildren(...figuras.map(crearFila));
}

porId("figurasEditarBtn").addEventListener("click", () => {
    avisar("");
    pintarLista();
    modalFiguras.showModal();
});
porId("figurasCerrar").addEventListener("click", () => modalFiguras.close());

// Modal de edición
function abrirEdicion(figura) {
    editando = figura;
    formEditar.reset();
    mostrarError("editarFiguraError", "");
    porId("modalFiguraTitulo").textContent = `Editar: ${figura.nombre}`;
    formEditar.elements.nombre.value = figura.nombre;
    formEditar.elements.cargo.value = figura.cargo;
    formEditar.elements.telefono.value = figura.telefono;
    miniaturaEditar.hidden = false;
    ponerImagen(miniaturaEditar, figura.imagen);
    modalFigura.showModal();
}

miniaturaEditar.addEventListener("error", () => {
    miniaturaEditar.hidden = true;
});

campoFotoEditar.addEventListener("change", () => {
    const url = urlImagen(campoFotoEditar);
    if (url) {
        miniaturaEditar.hidden = false;
        ponerImagen(miniaturaEditar, url);
    }
});

porId("editarFiguraCancelar").addEventListener("click", () => modalFigura.close());

formEditar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formEditar);
    datos.append("accion", editando.clave ? "editar_fijo" : "editar");
    datos.append(editando.clave ? "clave" : "id", editando.clave || editando.id);
    if (!campoFotoEditar.files[0]) datos.delete("imagen");
    guardar(formEditar, datos, "editarFiguraError", () => {
        modalFigura.close();
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

[modalFiguras, modalFigura, modalConfirmar, modalCambios].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});

cargar();
