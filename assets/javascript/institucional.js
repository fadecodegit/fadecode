// Página de inicio: muestra los cambios hechos desde el panel en la portada
// y en las secciones; las secciones nuevas van al final.
// Si el servidor no responde, queda el contenido que ya trae la página.

const contenidoInstitucional = document.querySelector(".inst-content");

// Un párrafo por línea
function ponerSeccion(articulo, seccion) {
    const titulo = document.createElement("h3");
    titulo.className = "inst-block__title";
    titulo.textContent = seccion.titulo;

    const parrafos = seccion.texto.split("\n").filter(Boolean).map((linea) => {
        const parrafo = document.createElement("p");
        parrafo.textContent = linea;
        return parrafo;
    });

    articulo.replaceChildren(titulo, ...parrafos);
}

function aplicarPortada(portada) {
    if (portada.imagen) {
        document.querySelector(".inst-hero__img").src = `../${portada.imagen}`;
    }
    document.getElementById("inst-hero-heading").textContent = portada.titulo;
    // El texto está dos veces: sobre la imagen (escritorio) y debajo (celular)
    document.querySelectorAll(".inst-hero__text").forEach((texto) => {
        texto.textContent = portada.texto;
    });
    document.getElementById("inst-content-heading").textContent = portada.titulo_contenido;
}

function aplicarCambiosFijos(fijas) {
    fijas.forEach((cambio) => {
        if (cambio.clave_fija === "portada") {
            aplicarPortada(cambio);
            return;
        }
        const articulo = contenidoInstitucional.querySelector(`[data-inst-fijo="${cambio.clave_fija}"]`);
        if (!articulo) return;
        if (Number(cambio.eliminada)) {
            articulo.remove();
        } else if (cambio.titulo) {
            ponerSeccion(articulo, cambio);
        }
    });
}

async function cargarInstitucional() {
    try {
        const respuesta = await fetch("../backend/institucional.php?accion=listar");
        const datos = await respuesta.json();
        if (!datos.exito) return;
        aplicarCambiosFijos(datos.fijas);
        datos.nuevas.forEach((seccion) => {
            const articulo = document.createElement("article");
            articulo.className = "inst-block";
            ponerSeccion(articulo, seccion);
            contenidoInstitucional.appendChild(articulo);
        });
    } catch {
    }
}

if (contenidoInstitucional) cargarInstitucional();
