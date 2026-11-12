// Pantalla de Inicio del Polideportivo.
// Los datos básicos abren con lo que se ve hoy; las secciones de texto o tabla
// se agregan con "Subir" y se editan, eliminan o restauran desde "Editar".

const DIRECCION_POLIDEPORTIVO = "../backend/polideportivo.php";
const PAGINA_POLIDEPORTIVO = "../html/Anexo-Polideportivo.html";
const CAMPOS_DATOS = ["inauguracion", "etiqueta_coordinador", "coordinador", "direccion", "telefono"];

const formDatos = porId("formDatos");
const formContenido = porId("formContenido");
const formEditar = porId("formEditarSeccion");
const botonRestaurarDatos = porId("datosRestaurar");
const modalSecciones = porId("modalSecciones");
const modalSeccion = porId("modalSeccion");
const modalConfirmar = porId("modalConfirmarPolid");
const modalCambios = porId("modalPolidCambios");
const listaSecciones = porId("seccionesLista");
const avisoSecciones = porId("seccionesAviso");

let original = null;      // lo que trae la página pública
let datosActuales = null; // título y datos básicos que se ven hoy
let secciones = [];       // las secciones que se ven hoy (y las eliminadas)
let editando = null;      // sección abierta en el modal de edición
let pendiente = null;     // cambio que espera el "Sí" de la confirmación

const tipoNuevo = interruptor([
    ["polidBtnTexto", "polidBlockTexto"],
    ["polidBtnTabla", "polidBlockTabla"]
]);
const esTablaNueva = () => tipoNuevo() === 1;

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
    const respuesta = await fetch(DIRECCION_POLIDEPORTIVO, { method: "POST", body: datos });
    return respuesta.json();
}

function formulario(accion, campos = {}) {
    const datos = new FormData();
    datos.append("accion", accion);
    Object.entries(campos).forEach(([nombre, valor]) => datos.append(nombre, valor));
    return datos;
}

// Cada fila de una tabla: dos celdas y la "×" para quitarla
function agregarFila(idContenedor, valores = ["", ""]) {
    const fila = crear("div", "admin-fila");
    valores.forEach((valor, indice) => {
        const celda = document.createElement("input");
        celda.type = "text";
        celda.name = `celda_${indice + 1}[]`;
        celda.maxLength = 150;
        celda.value = valor;
        celda.setAttribute("aria-label", `Columna ${indice + 1}`);
        fila.appendChild(celda);
    });
    const quitar = crear("button", "admin-fila__quitar", "×");
    quitar.type = "button";
    quitar.setAttribute("aria-label", "Quitar fila");
    quitar.addEventListener("click", () => {
        fila.remove();
        pintarVistaPrevia();
    });
    fila.appendChild(quitar);
    porId(idContenedor).appendChild(fila);
    return fila;
}

function ponerFilas(idContenedor, filas) {
    porId(idContenedor).replaceChildren();
    (filas.length ? filas : [["", ""]]).forEach((fila) => agregarFila(idContenedor, fila));
}

function leerFilas(idContenedor) {
    return [...porId(idContenedor).querySelectorAll(".admin-fila")]
        .map((fila) => [...fila.querySelectorAll("input")].map((celda) => celda.value.trim()))
        .filter(([primera, segunda]) => primera || segunda);
}

document.querySelectorAll("[data-agregar-fila]").forEach((boton) => {
    boton.addEventListener("click", () => agregarFila(boton.dataset.agregarFila).querySelector("input").focus());
});

// Lee el contenido original de la página pública
async function leerOriginal() {
    const respuesta = await fetch(PAGINA_POLIDEPORTIVO);
    const pagina = new DOMParser().parseFromString(await respuesta.text(), "text/html");
    const filas = [...pagina.querySelectorAll('[data-poli-fijo="datos"] .poli-datos__row')];
    const valor = (indice) => limpiarTexto(filas[indice].querySelector("dd"));

    return {
        datos: {
            titulo: limpiarTexto(pagina.getElementById("poli-heading")),
            inauguracion: valor(0),
            etiqueta_coordinador: limpiarTexto(filas[1].querySelector("dt")).replace(/:\s*$/, ""),
            coordinador: valor(1),
            direccion: valor(2),
            telefono: valor(3)
        },
        secciones: [...pagina.querySelectorAll('[data-poli-fijo]:not([data-poli-fijo="datos"])')].map((panel) => {
            const tabla = panel.querySelector("table");
            const seccion = { clave: panel.dataset.poliFijo, titulo: limpiarTexto(panel.querySelector(".poli-subtitle")) };
            if (tabla) {
                return {
                    ...seccion,
                    tipo: "tabla",
                    contenido: {
                        columnas: [...tabla.querySelectorAll("thead th")].map(limpiarTexto),
                        filas: [...tabla.querySelectorAll("tbody tr")].map((fila) => [...fila.cells].map(limpiarTexto))
                    }
                };
            }
            // Los subtítulos chicos se escriben con "#" adelante
            const lineas = [...panel.querySelectorAll(".poli-subsubtitle, .poli-text")]
                .map((elemento) => (elemento.matches("h3") ? `# ${limpiarTexto(elemento)}` : limpiarTexto(elemento)));
            return { ...seccion, tipo: "texto", contenido: lineas.join("\n") };
        })
    };
}

// Prepara el contenido guardado para mostrarlo en la pantalla
const contenidoDeFila = (fila) => (fila.tipo === "tabla" ? JSON.parse(fila.contenido) : fila.contenido);

function llenarDatos() {
    formDatos.elements.titulo.value = datosActuales.titulo;
    CAMPOS_DATOS.forEach((campo) => {
        formDatos.elements[campo].value = datosActuales[campo];
    });
    botonRestaurarDatos.hidden = !datosActuales.editados;
}

// Vista previa
function bloqueTexto(texto) {
    return texto.split("\n").filter(Boolean).map((linea) => linea.startsWith("#")
        ? crear("h4", "admin-polid-section__subsubtitle", linea.replace(/^#+\s*/, ""))
        : crear("p", "admin-polid-section__text", linea));
}

function bloqueTabla({ columnas, filas }) {
    const tabla = crear("table", "admin-polid-table");
    const encabezado = tabla.createTHead().insertRow();
    columnas.forEach((columna) => encabezado.appendChild(crear("th", "", columna)));
    const cuerpo = tabla.createTBody();
    filas.forEach((fila) => {
        const filaTabla = cuerpo.insertRow();
        fila.forEach((valor) => {
            filaTabla.insertCell().textContent = valor;
        });
    });
    return [tabla];
}

function bloqueSeccion(seccion, clase = "") {
    const caja = crear("div", `admin-polid-section ${clase}`.trim());
    caja.append(
        crear("h3", "admin-polid-section__subtitle", seccion.titulo),
        ...(seccion.tipo === "tabla" ? bloqueTabla(seccion.contenido) : bloqueTexto(seccion.contenido))
    );
    return caja;
}

function pintarVistaPrevia() {
    if (!datosActuales) return;
    const valor = (campo) => formDatos.elements[campo].value.trim() || datosActuales[campo];

    porId("previewPolidTitulo").textContent = valor("titulo");
    const filas = [
        ["Inauguración", valor("inauguracion")],
        [valor("etiqueta_coordinador"), valor("coordinador")],
        ["Dirección", valor("direccion")],
        ["Teléfono", valor("telefono")]
    ];
    porId("previewPolidDatos").replaceChildren(...filas.map(([etiqueta, dato]) => {
        const fila = crear("div", "admin-preview-polideportivo__dato");
        fila.append(crear("dt", "", `${etiqueta}:`), crear("dd", "", dato));
        return fila;
    }));

    const visibles = secciones.filter((seccion) => !seccion.eliminada).map((seccion) => bloqueSeccion(seccion));

    // Lo que se está escribiendo en "Agregar contenido" se ve al final
    const titulo = formContenido.elements.titulo.value.trim();
    const borrador = esTablaNueva()
        ? {
            tipo: "tabla",
            contenido: {
                columnas: [formContenido.elements.columna_1.value.trim(), formContenido.elements.columna_2.value.trim()],
                filas: leerFilas("polidFilas")
            }
        }
        : { tipo: "texto", contenido: formContenido.elements.texto.value.trim() };
    const hayBorrador = titulo || (borrador.tipo === "tabla"
        ? borrador.contenido.filas.length || borrador.contenido.columnas.some(Boolean)
        : borrador.contenido);
    if (hayBorrador) {
        visibles.push(bloqueSeccion({ ...borrador, titulo: titulo || "Subtítulo" }, "admin-polid-section--borrador"));
    }

    porId("previewPolidLista").replaceChildren(...visibles);
    porId("previewPolidAviso").textContent = "La página no tiene ninguna sección.";
    porId("previewPolidAviso").hidden = visibles.length > 0;
}

async function cargar() {
    try {
        const [base, respuesta] = await Promise.all([
            original ? original : leerOriginal(),
            fetch(`${DIRECCION_POLIDEPORTIVO}?accion=listar`)
        ]);
        original = base;
        const datos = await respuesta.json();
        if (!datos.exito) throw new Error(datos.mensaje);

        const cambio = (clave) => datos.fijas.find((fila) => fila.clave_fija === clave);
        const cambioDatos = cambio("datos");
        datosActuales = cambioDatos
            ? { editados: true, titulo: cambioDatos.titulo, ...JSON.parse(cambioDatos.contenido) }
            : { editados: false, ...original.datos };

        secciones = [
            ...original.secciones.map((seccion) => {
                const fila = cambio(seccion.clave);
                const editada = Boolean(fila && fila.titulo);
                return {
                    ...seccion,
                    editada,
                    eliminada: Boolean(fila && Number(fila.eliminada)),
                    titulo: editada ? fila.titulo : seccion.titulo,
                    contenido: editada ? contenidoDeFila(fila) : seccion.contenido
                };
            }),
            ...datos.nuevas.map((fila) => ({ id: fila.id_polideportivo, tipo: fila.tipo, titulo: fila.titulo, contenido: contenidoDeFila(fila) }))
        ];

        llenarDatos();
        pintarVistaPrevia();
        if (modalSecciones.open) pintarLista();
    } catch {
        porId("previewPolidAviso").hidden = false;
        porId("previewPolidAviso").textContent = "No se pudo cargar el contenido de la página.";
        avisar("No se pudo conectar con el servidor.");
    }
}

function avisarCambio(texto) {
    porId("modalPolidCambiosTexto").textContent = texto;
    modalCambios.showModal();
    cargar();
}

function confirmar(texto, datos, aviso) {
    pendiente = { datos, aviso };
    porId("modalConfirmarPolidTexto").textContent = texto;
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

// Datos básicos
formDatos.addEventListener("input", pintarVistaPrevia);

formDatos.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formDatos);
    datos.append("accion", "guardar_datos");
    guardar(formDatos, datos, "datosError", () => avisarCambio("Se guardaron los datos correctamente"));
});

botonRestaurarDatos.addEventListener("click", () => confirmar(
    "¿Querés volver a los datos originales? Se pierden los cambios.",
    formulario("restaurar_datos"), "Se restauraron los datos originales"));

// Agregar contenido
["polidBtnTexto", "polidBtnTabla"].forEach((id) => porId(id).addEventListener("click", pintarVistaPrevia));
formContenido.addEventListener("input", pintarVistaPrevia);
formContenido.addEventListener("reset", () => setTimeout(() => {
    ponerFilas("polidFilas", []);
    pintarVistaPrevia();
}));

formContenido.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formContenido);
    datos.append("accion", "crear");
    datos.append("tipo", esTablaNueva() ? "tabla" : "texto");
    guardar(formContenido, datos, "contenidoError", () => {
        formContenido.reset();
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
    const tipo = seccion.tipo === "tabla" ? "Tabla" : "Texto";
    const datos = crear("div", "admin-edicion__datos");
    datos.append(
        crear("span", "admin-edicion__fecha", estado ? `${tipo} · ${estado}` : tipo),
        crear("p", "admin-edicion__titulo", seccion.titulo)
    );

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

// Modal de edición: muestra el texto o la tabla, según la sección
function abrirEdicion(seccion) {
    editando = seccion;
    const esTabla = seccion.tipo === "tabla";
    formEditar.reset();
    mostrarError("editarSeccionError", "");
    porId("modalSeccionTitulo").textContent = `Editar: ${seccion.titulo}`;
    porId("editarBlockTexto").hidden = esTabla;
    porId("editarBlockTabla").hidden = !esTabla;
    formEditar.elements.titulo.value = seccion.titulo;
    if (esTabla) {
        formEditar.elements.columna_1.value = seccion.contenido.columnas[0] || "";
        formEditar.elements.columna_2.value = seccion.contenido.columnas[1] || "";
        ponerFilas("editarFilas", seccion.contenido.filas);
    } else {
        formEditar.elements.texto.value = seccion.contenido;
    }
    modalSeccion.showModal();
}

porId("editarSeccionCancelar").addEventListener("click", () => modalSeccion.close());

formEditar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = new FormData(formEditar);
    datos.append("accion", editando.clave ? "editar_fijo" : "editar");
    datos.append(editando.clave ? "clave" : "id", editando.clave || editando.id);
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
    // El error se muestra donde está mirando: en la lista o debajo de los datos
    const error = (texto) => (modalSecciones.open ? avisar(texto) : mostrarError("datosError", texto));
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

ponerFilas("polidFilas", []);
cargar();


 $intentos = new IntentosLogin();
    // Si la cuenta está bloqueada por intentos fallidos, no se revisa la contraseña
    $minutos = $intentos->minutosBloqueado($cedula);
    if ($minutos > 0) apiError('login_bloqueado', IntentosLogin::mensaje($minutos), 429);