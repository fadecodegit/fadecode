// Pantalla de Ofertas Educativas.
// "Subir" abre un modal para completar la página de la oferta nueva.
// "Editar" lista todas las ofertas para editarlas, eliminarlas o restaurarlas.

const DIRECCION_OFERTAS = "../backend/ofertas.php";
const MENU_OFERTAS = "../OfertasEducativas/Menu-de-Ofertas.html";

vincularImagen("ofertaIcono", "ofertaIconoThumb", "previewOfertaIconoWrap", "previewOfertaIcono");
vincularTexto("ofertaNombre", "previewOfertaNombre");

const formAgregar = porId("formOfertaEducativa");
const errorAgregar = porId("ofertaError");
const modalOferta = porId("modalOferta");
const formOferta = porId("formOferta");
const errorOferta = porId("ofertaFormError");
const modalOfertas = porId("modalOfertas");
const listaOfertas = porId("ofertasLista");
const avisoOfertas = porId("ofertasAviso");
const modalConfirmar = porId("modalConfirmarOferta");
const modalCambios = porId("modalOfertaCambios");
const IMAGENES = ["icono", "horario_1", "horario_2", "horario_3"];
let modo = null;
let pendiente = null;

const sinPuntos = (ruta) => (ruta || "").replace(/^\.\.\//, "");
const limpiarTexto = (elemento) => (elemento ? elemento.textContent.replace(/\s+/g, " ").trim() : "");

function avisar(texto) {
    avisoOfertas.textContent = texto;
    avisoOfertas.hidden = !texto;
}

function mostrarMiniatura(campo, ruta) {
    const marco = formOferta.querySelector(`[data-miniatura="${campo}"]`);
    marco.classList.toggle("has-image", Boolean(ruta));
    ponerImagen(marco.querySelector("img"), ruta || null);
}

// Completa el modal con los datos de la oferta
function abrirFormulario(titulo, datos, nuevoModo) {
    modo = nuevoModo;
    formOferta.reset();
    errorOferta.hidden = true;
    porId("modalOfertaTitulo").textContent = titulo;
    ["nombre", "titulo", "subtitulo", "ofrece_intro", "ofrece_items", "logros_intro", "logros_items"].forEach((campo) => {
        formOferta.elements[campo].value = datos[campo] || "";
    });
    IMAGENES.forEach((campo) => {
        formOferta.elements[`${campo}_actual`].value = datos[campo] || "";
        mostrarMiniatura(campo, datos[campo] ? `../${datos[campo]}` : "");
    });
    if (modo.icono) mostrarMiniatura("icono", urlImagen(modo.icono));
    modalOferta.showModal();
}

IMAGENES.forEach((campo) => {
    formOferta.elements[campo].addEventListener("change", () => {
        const url = urlImagen(formOferta.elements[campo]);
        if (url) mostrarMiniatura(campo, url);
    });
});

// "Subir": con el logo y el texto elegidos abre el modal para completar la oferta
formAgregar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nombre = porId("ofertaNombre").value.trim();
    const icono = porId("ofertaIcono");
    errorAgregar.hidden = true;
    if (!icono.files[0] || !nombre) {
        errorAgregar.textContent = "Elegí un logo y escribí el texto antes de subir.";
        errorAgregar.hidden = false;
        return;
    }
    abrirFormulario("Nueva oferta educativa", { nombre, titulo: nombre, subtitulo: "Bachillerato Tecnológico" },
        { accion: "crear", icono });
});

porId("ofertaFormCancelar").addEventListener("click", () => modalOferta.close());

async function enviar(datos) {
    const respuesta = await fetch(DIRECCION_OFERTAS, { method: "POST", body: datos });
    return respuesta.json();
}

function avisarCambio(texto) {
    porId("modalOfertaCambiosTexto").textContent = texto;
    modalCambios.showModal();
    if (modalOfertas.open) cargarOfertas();
}

formOferta.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    errorOferta.hidden = true;
    const boton = formOferta.querySelector('button[type="submit"]');

    const datos = new FormData(formOferta);
    datos.append("accion", modo.accion);
    if (modo.id) datos.append("id", modo.id);
    if (modo.clave) datos.append("clave", modo.clave);
    if (modo.icono && !formOferta.elements.icono.files[0]) datos.set("icono", modo.icono.files[0]);
    [1, 2, 3].forEach((n) => {
        if (datos.get(`quitar_${n}`)) {
            datos.set(`horario_${n}_actual`, "");
            datos.delete(`horario_${n}`);
        }
        datos.delete(`quitar_${n}`);
    });

    boton.disabled = true;
    try {
        const resultado = await enviar(datos);
        if (!resultado.exito) {
            errorOferta.textContent = resultado.mensaje || "No se pudo guardar la oferta.";
            errorOferta.hidden = false;
            return;
        }
        modalOferta.close();
        if (modo.accion === "crear") formAgregar.reset();
        avisarCambio(modo.accion === "crear" ? "Se subió la oferta educativa correctamente" : "Se guardaron los cambios correctamente");
    } catch {
        errorOferta.textContent = "No se pudo conectar con el servidor. La oferta no se guardó.";
        errorOferta.hidden = false;
    } finally {
        boton.disabled = false;
    }
});

// Las ofertas que ya están en el sitio, leídas del menú público
async function leerMenu() {
    const respuesta = await fetch(MENU_OFERTAS);
    const pagina = new DOMParser().parseFromString(await respuesta.text(), "text/html");
    return [...pagina.querySelectorAll("[data-oferta-fija]")].map((tarjeta) => ({
        clave: tarjeta.dataset.ofertaFija,
        pagina: tarjeta.dataset.pagina,
        nombre: limpiarTexto(tarjeta.querySelector(".offer-item__label")),
        icono: sinPuntos(tarjeta.querySelector("img").getAttribute("src"))
    }));
}

// Lee el contenido de una oferta que ya está en el sitio desde su página
async function leerPaginaOferta(fija) {
    const respuesta = await fetch(`../OfertasEducativas/${fija.pagina}`);
    const pagina = new DOMParser().parseFromString(await respuesta.text(), "text/html");
    const [ofrece, logros] = pagina.querySelectorAll(".oferta-body article");
    const puntos = (articulo) => [...articulo.querySelectorAll("li")].map(limpiarTexto).join("\n");
    const horarios = [...pagina.querySelectorAll(".oferta-tabs__panel")].map((panel) => {
        const imagen = panel.querySelector("img");
        return imagen ? sinPuntos(imagen.getAttribute("src")) : "";
    });

    return {
        nombre: fija.nombre,
        icono: sinPuntos(pagina.querySelector(".oferta-banner__icon img").getAttribute("src")),
        titulo: limpiarTexto(pagina.querySelector(".oferta-banner__title")),
        subtitulo: limpiarTexto(pagina.querySelector(".oferta-banner__subtitle")),
        ofrece_intro: limpiarTexto(ofrece.querySelector("p")),
        ofrece_items: puntos(ofrece),
        logros_intro: limpiarTexto(logros.querySelector("p")),
        logros_items: puntos(logros),
        horario_1: horarios[0] || "",
        horario_2: horarios[1] || "",
        horario_3: horarios[2] || ""
    };
}

function confirmar(texto, datos, aviso) {
    pendiente = { datos, aviso };
    porId("modalConfirmarOfertaTexto").textContent = texto;
    modalConfirmar.returnValue = "";
    modalConfirmar.showModal();
}

function boton(texto, clase, accion) {
    const nuevo = crear("button", `admin-btn ${clase}`, texto);
    nuevo.type = "button";
    nuevo.addEventListener("click", accion);
    return nuevo;
}

function crearFila(oferta) {
    const fila = crear("li", "admin-edicion__item");

    const imagen = crear("img", "admin-edicion__imagen");
    imagen.alt = "";
    imagen.src = `../${oferta.icono}`;

    const estado = oferta.eliminada ? "Eliminada" : oferta.editada ? "Editada" : oferta.clave ? "" : "Nueva";
    const datos = crear("div", "admin-edicion__datos");
    datos.append(crear("span", "admin-edicion__fecha", estado), crear("p", "admin-edicion__titulo", oferta.nombre));

    const acciones = crear("div", "admin-edicion__acciones");
    const conClave = (accion) => {
        const formulario = new FormData();
        formulario.append("accion", accion);
        formulario.append(oferta.clave ? "clave" : "id", oferta.clave || oferta.id);
        return formulario;
    };

    if (!oferta.eliminada) {
        acciones.append(boton("Editar", "admin-btn--secondary", async () => {
            try {
                const contenido = oferta.fila && oferta.fila.nombre ? oferta.fila : await leerPaginaOferta(oferta);
                abrirFormulario(`Editar: ${oferta.nombre}`, contenido,
                    oferta.clave ? { accion: "editar_fijo", clave: oferta.clave } : { accion: "editar", id: oferta.id });
            } catch {
                avisar("No se pudo leer la página de esta oferta.");
            }
        }));
        acciones.append(boton("Eliminar", "admin-btn--primary", () => confirmar(
            oferta.clave
                ? "¿Seguro que querés eliminar esta oferta? Deja de verse en el menú; después la podés restaurar."
                : "¿Seguro que querés eliminar esta oferta? No se puede deshacer.",
            conClave(oferta.clave ? "eliminar_fijo" : "eliminar"), "Se eliminó la oferta educativa")));
    }
    if (oferta.clave && (oferta.eliminada || oferta.editada)) {
        acciones.append(boton("Restaurar", "admin-btn--secondary", () => confirmar(
            "¿Querés volver a mostrar esta oferta como era originalmente? Se pierden los cambios.",
            conClave("restaurar_fijo"), "Se restauró la oferta original")));
    }

    fila.append(imagen, datos, acciones);
    return fila;
}

async function cargarOfertas() {
    listaOfertas.replaceChildren();
    avisar("Cargando...");
    try {
        const [respuesta, fijas] = await Promise.all([fetch(`${DIRECCION_OFERTAS}?accion=listar`), leerMenu()]);
        const datos = await respuesta.json();
        if (!datos.exito) {
            avisar(datos.mensaje || "No se pudieron cargar las ofertas.");
            return;
        }
        const existentes = fijas.map((fija) => {
            const fila = datos.fijas.find((cambio) => cambio.clave_fija === fija.clave);
            const editada = Boolean(fila && fila.nombre);
            return {
                ...fija,
                fila,
                editada,
                eliminada: Boolean(fila && Number(fila.eliminada)),
                nombre: editada ? fila.nombre : fija.nombre,
                icono: editada ? fila.icono : fija.icono
            };
        });
        const nuevas = datos.nuevas.map((fila) => ({ id: fila.id_oferta_panel, fila, nombre: fila.nombre, icono: fila.icono }));
        avisar("");
        listaOfertas.replaceChildren(...[...existentes, ...nuevas].map(crearFila));
    } catch {
        avisar("No se pudo conectar con el servidor.");
    }
}

porId("ofertasEditarBtn").addEventListener("click", () => {
    modalOfertas.showModal();
    cargarOfertas();
});
porId("ofertasCerrar").addEventListener("click", () => modalOfertas.close());

// Si confirmó, elimina o restaura lo elegido
modalConfirmar.addEventListener("close", async () => {
    if (modalConfirmar.returnValue !== "si" || !pendiente) return;
    try {
        const resultado = await enviar(pendiente.datos);
        if (resultado.exito) {
            avisarCambio(pendiente.aviso);
        } else {
            avisar(resultado.mensaje || "No se pudo completar el cambio.");
        }
    } catch {
        avisar("No se pudo conectar con el servidor. No se cambió nada.");
    }
});

[modalOferta, modalOfertas, modalConfirmar, modalCambios].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});
