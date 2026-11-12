// Carrusel del Laboratorio: las flechas y los puntos cambian de foto.
// Primero aplica los cambios hechos desde el panel y después arma el carrusel.
// Si el servidor no responde, quedan las fotos que ya trae la página.

const contenidoCarrusel = document.querySelector(".lab-carousel__content");
const contenedorPuntos = document.querySelector("[data-carousel-dots]");
const flechas = document.querySelectorAll("[data-carousel-prev], [data-carousel-next]");
let diapositivas = [];
let puntos = [];
let actual = 0;

function mostrar(indice) {
    if (!diapositivas.length) return;
    // Después de la última vuelve a la primera
    actual = (indice + diapositivas.length) % diapositivas.length;

    diapositivas.forEach((diapositiva, i) => {
        diapositiva.classList.toggle("is-active", i === actual);
    });
    puntos.forEach((punto, i) => {
        punto.setAttribute("aria-current", String(i === actual));
    });
}

// Un punto por imagen; con una sola imagen no hacen falta flechas ni puntos
function armarCarrusel() {
    diapositivas = [...contenidoCarrusel.querySelectorAll("[data-carousel-slide]")];
    puntos = diapositivas.map((diapositiva, indice) => {
        const punto = document.createElement("button");
        punto.type = "button";
        punto.className = "lab-carousel__dot";
        punto.setAttribute("aria-label", `Imagen ${indice + 1}`);
        punto.addEventListener("click", () => mostrar(indice));
        return punto;
    });
    contenedorPuntos.replaceChildren(...puntos);
    const variasImagenes = diapositivas.length > 1;
    contenedorPuntos.hidden = !variasImagenes;
    flechas.forEach((flecha) => {
        flecha.hidden = !variasImagenes;
    });
    mostrar(0);
}

function crearDiapositiva(foto) {
    const figura = document.createElement("figure");
    figura.className = "lab-carousel__slide";
    figura.dataset.carouselSlide = `nueva-${foto.id_foto}`;

    const contenedorImagen = document.createElement("div");
    contenedorImagen.className = "lab-carousel__image-wrapper";
    const imagen = document.createElement("img");
    imagen.className = "lab-carousel__image";
    imagen.src = `../${foto.imagen_lab}`;
    imagen.alt = "Foto del laboratorio";
    contenedorImagen.appendChild(imagen);

    const descripcion = document.createElement("figcaption");
    descripcion.className = "lab-carousel__description";
    descripcion.textContent = foto.texto_lab;

    figura.append(contenedorImagen, descripcion);
    return figura;
}

document.querySelector("[data-carousel-prev]").addEventListener("click", () => mostrar(actual - 1));
document.querySelector("[data-carousel-next]").addEventListener("click", () => mostrar(actual + 1));

armarCarrusel();

async function aplicarCambios() {
    try {
        const respuesta = await fetch("../backend/laboratorio.php?accion=listar");
        const datos = await respuesta.json();
        if (!datos.exito) return;

        datos.diapositivas.forEach((cambio) => {
            const diapositiva = contenidoCarrusel.querySelector(`[data-carousel-slide="${cambio.id_diapositiva}"]`);
            if (!diapositiva) return;
            if (Number(cambio.eliminada)) {
                diapositiva.remove();
                return;
            }
            diapositiva.querySelector(".lab-carousel__description").textContent = cambio.texto_lab;
            if (cambio.imagen_lab) {
                diapositiva.querySelector(".lab-carousel__image").src = `../${cambio.imagen_lab}`;
            }
        });
        contenidoCarrusel.append(...datos.nuevas.map(crearDiapositiva));
        armarCarrusel();
    } catch {
    }
}

aplicarCambios();
