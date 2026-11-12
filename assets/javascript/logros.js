// Logros: muestra 3 y el botón despliega el resto.
// Los cargados desde el panel van primero.
// Si el servidor no responde, quedan los que ya trae la página.

const grillaLogros = document.getElementById("logrosGrid");
const botonVerTodos = document.getElementById("verTodosLogros");
const contenedorBoton = botonVerTodos.parentElement;

const MAXIMO_VISIBLES = 3;
let todosVisibles = false;

function crearTarjeta(logro) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "news-item";

    const contenedorImagen = document.createElement("div");
    contenedorImagen.className = "news-item__image";
    const imagen = document.createElement("img");
    if (logro.imagen_logro) {
        imagen.src = `../${logro.imagen_logro}`;
    } else {
        contenedorImagen.classList.add("news-item__image--sin-foto");
        imagen.src = "../Recursos UTU/Isotipo-UTU-Color-Dorado-PNG.png";
    }
    imagen.alt = "";
    imagen.loading = "lazy";
    contenedorImagen.appendChild(imagen);

    const cuerpo = document.createElement("div");
    cuerpo.className = "news-item__body";
    const textos = [
        ["span", "news-item__date", logro.fecha_texto],
        ["h2", "news-item__title", logro.titulo_logro],
        ["p", "news-item__summary", logro.descrip_logro]
    ];
    textos.forEach(([etiqueta, clase, texto]) => {
        const elemento = document.createElement(etiqueta);
        elemento.className = clase;
        elemento.textContent = texto || "";
        cuerpo.appendChild(elemento);
    });

    tarjeta.append(contenedorImagen, cuerpo);
    return tarjeta;
}

function ordenarVisibles() {
    const tarjetas = [...grillaLogros.children];
    tarjetas.forEach((tarjeta, posicion) => {
        tarjeta.hidden = !todosVisibles && posicion >= MAXIMO_VISIBLES;
    });
    contenedorBoton.hidden = todosVisibles || tarjetas.length <= MAXIMO_VISIBLES;
}

// Aplica los cambios hechos desde el panel a los logros que ya trae la página
function aplicarCambiosFijos(cambios) {
    cambios.forEach((cambio) => {
        const tarjeta = grillaLogros.querySelector(`[data-fijo="${cambio.clave}"]`);
        if (!tarjeta) return;
        tarjeta.querySelector(".news-item__date").textContent = cambio.fecha_texto;
        tarjeta.querySelector(".news-item__title").textContent = cambio.titulo;
        tarjeta.querySelector(".news-item__summary").textContent = cambio.texto;
        if (cambio.imagen) {
            const contenedor = tarjeta.querySelector(".news-item__image");
            contenedor.classList.remove("news-item__image--sin-foto");
            contenedor.querySelector("img").src = `../${cambio.imagen}`;
        }
    });
}

async function cargarLogros() {
    try {
        const respuesta = await fetch("../backend/logros.php?accion=listar");
        const datos = await respuesta.json();
        if (!datos.exito) return;
        aplicarCambiosFijos(datos.fijos || []);
        if (!datos.logros.length) return;
        grillaLogros.prepend(...datos.logros.map(crearTarjeta));
        ordenarVisibles();
    } catch {
    }
}

botonVerTodos.addEventListener("click", () => {
    todosVisibles = true;
    ordenarVisibles();
});

ordenarVisibles();
cargarLogros();
