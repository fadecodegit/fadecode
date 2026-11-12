// Noticias: muestra las 3 más recientes, con la más nueva a la derecha.
// Las publicadas desde el panel se suman a las que ya trae la página.

const grillaNoticias = document.getElementById("newsGrid");
const MAXIMO_VISIBLES = 3;

function crearTarjeta(noticia) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "news-item";

    const contenedorImagen = document.createElement("div");
    contenedorImagen.className = "news-item__image";
    const imagen = document.createElement("img");
    imagen.src = `../${noticia.imagen_noticia}`;
    imagen.alt = "";
    imagen.loading = "lazy";
    contenedorImagen.appendChild(imagen);

    const cuerpo = document.createElement("div");
    cuerpo.className = "news-item__body";
    const textos = [
        ["span", "news-item__date", noticia.fecha_texto],
        ["h2", "news-item__title", noticia.titulo_noticia],
        ["p", "news-item__summary", noticia.descrip_noticia]
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

// Aplica los cambios hechos desde el panel a las noticias que ya trae la página
function aplicarCambiosFijos(cambios) {
    cambios.forEach((cambio) => {
        const tarjeta = grillaNoticias.querySelector(`[data-fijo="${cambio.clave}"]`);
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

async function cargarNoticias() {
    try {
        const respuesta = await fetch("../backend/noticias.php?accion=ultimas");
        const datos = await respuesta.json();
        if (!datos.exito) return;
        aplicarCambiosFijos(datos.fijos || []);
        if (!datos.noticias.length) return;
        const fijas = [...grillaNoticias.children];
        const todas = [...fijas, ...datos.noticias.map(crearTarjeta)];
        grillaNoticias.replaceChildren(...todas.slice(-MAXIMO_VISIBLES));
    } catch {
    }
}

if (grillaNoticias) cargarNoticias();
