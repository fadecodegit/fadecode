// Pantalla de Sugerencias: lista las que mandaron, de la más nueva a la más vieja.
// "Ver" abre un modal con quién la mandó y qué dice, para borrarla o cerrarla.

const DIRECCION_SUGERENCIAS = "../backend/sugerencias.php";

const lista = document.getElementById("sugerenciasLista");
const aviso = document.getElementById("sugerenciasAviso");
const buscador = document.getElementById("sugerenciasBuscar");
const modalSugerencia = document.getElementById("modalSugerencia");
const modalConfirmar = document.getElementById("modalConfirmarSugerencia");
const modalBorrada = document.getElementById("modalSugerenciaBorrada");
const errorSugerencia = document.getElementById("sugerenciaError");
const botonBorrar = document.getElementById("sugerenciaBorrar");

let sugerencias = [];
let abierta = null;

const SIN_CUENTA = "Visitante sin cuenta";
const autor = (sugerencia) => sugerencia.nom_usuario || SIN_CUENTA;

// Búsqueda: no importan mayúsculas ni tildes
const normalizar = (texto) => String(texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function formatearFecha(texto) {
    // Muestra la fecha en un formato fácil de leer
    const fecha = new Date(texto.replace(" ", "T"));
    if (Number.isNaN(fecha.getTime())) return texto;
    return fecha.toLocaleString("es-UY", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (texto) elemento.textContent = texto;
    return elemento;
}

async function enviar(campos) {
    const datos = new FormData();
    Object.entries(campos).forEach(([nombre, valor]) => datos.append(nombre, valor));
    const respuesta = await fetch(DIRECCION_SUGERENCIAS, { method: "POST", body: datos });
    return respuesta.json();
}

function crearFila(sugerencia) {
    const fila = crearElemento("li", "admin-edicion__item admin-edicion__item--sin-imagen");

    const datos = crearElemento("div", "admin-edicion__datos");
    datos.append(
        crearElemento("span", "admin-edicion__fecha", `${autor(sugerencia)} · ${formatearFecha(sugerencia.fecha_sugerencia)}`),
        crearElemento("p", "admin-edicion__titulo", sugerencia.contenido)
    );

    const boton = crearElemento("button", "admin-btn admin-btn--secondary", "Ver");
    boton.type = "button";
    boton.addEventListener("click", () => abrir(sugerencia));

    const acciones = crearElemento("div", "admin-edicion__acciones");
    acciones.append(boton);

    fila.append(datos, acciones);
    return fila;
}

function pintarLista() {
    const palabras = normalizar(buscador.value).split(/\s+/).filter(Boolean);
    const encontradas = sugerencias.filter((sugerencia) => {
        const texto = normalizar(`${sugerencia.contenido} ${autor(sugerencia)} ${sugerencia.cedula || ""}`);
        return palabras.every((palabra) => texto.includes(palabra));
    });

    lista.replaceChildren(...encontradas.map(crearFila));
    if (!sugerencias.length) {
        aviso.textContent = "Todavía no llegó ninguna sugerencia.";
    } else if (!encontradas.length) {
        aviso.textContent = "Ninguna sugerencia coincide con la búsqueda.";
    } else {
        const total = encontradas.length === 1 ? "1 sugerencia" : `${encontradas.length} sugerencias`;
        aviso.textContent = palabras.length ? `${total} encontradas de ${sugerencias.length}.` : `${total}.`;
    }
}

async function cargar() {
    aviso.textContent = "Cargando...";
    try {
        const datos = await enviar({ accion: "listar" });
        if (!datos.exito) {
            aviso.textContent = datos.mensaje || "No se pudieron cargar las sugerencias.";
            return;
        }
        sugerencias = datos.sugerencias;
        pintarLista();
    } catch {
        aviso.textContent = "No se pudo conectar con el servidor.";
    }
}

// Modal con quién la mandó y qué menciona
function abrir(sugerencia) {
    abierta = sugerencia;
    errorSugerencia.hidden = true;
    const conCuenta = Boolean(sugerencia.nom_usuario);
    document.getElementById("sugerenciaFecha").textContent = `Recibida el ${formatearFecha(sugerencia.fecha_sugerencia)}`;
    document.getElementById("sugerenciaAutor").textContent = conCuenta ? sugerencia.nom_usuario : SIN_CUENTA;
    document.getElementById("sugerenciaCedula").textContent = sugerencia.cedula || "";
    document.getElementById("sugerenciaCorreo").textContent = sugerencia.email || "";
    document.getElementById("sugerenciaCedulaFila").hidden = !conCuenta;
    document.getElementById("sugerenciaCorreoFila").hidden = !conCuenta;
    document.getElementById("sugerenciaTexto").textContent = sugerencia.contenido;
    modalSugerencia.showModal();
}

document.getElementById("sugerenciaCerrar").addEventListener("click", () => modalSugerencia.close());

botonBorrar.addEventListener("click", () => {
    modalConfirmar.returnValue = "";
    modalConfirmar.showModal();
});

modalConfirmar.addEventListener("close", async () => {
    if (modalConfirmar.returnValue !== "si" || !abierta) return;
    botonBorrar.disabled = true;
    errorSugerencia.hidden = true;
    try {
        const resultado = await enviar({ accion: "eliminar", id: abierta.id_sugerencia });
        if (!resultado.exito) {
            errorSugerencia.textContent = resultado.mensaje || "No se pudo borrar la sugerencia.";
            errorSugerencia.hidden = false;
            return;
        }
        modalSugerencia.close();
        modalBorrada.showModal();
        cargar();
    } catch {
        errorSugerencia.textContent = "No se pudo conectar con el servidor. La sugerencia no se borró.";
        errorSugerencia.hidden = false;
    } finally {
        botonBorrar.disabled = false;
    }
});

buscador.addEventListener("input", pintarLista);

[modalSugerencia, modalConfirmar, modalBorrada].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});

cargar();

