// Carrusel del laboratorio: todas las imágenes están apiladas en el HTML
// y solo se ve la que tiene la clase is-active. Las flechas y los
// circulitos ocultan la actual y muestran otra, en orden.

const diapositivas = document.querySelectorAll("[data-carousel-slide]");
const contenedorPuntos = document.querySelector("[data-carousel-dots]");
let actual = 0;

// Un circulito por imagen
const puntos = Array.from(diapositivas, (diapositiva, indice) => {
    const punto = document.createElement("button");
    punto.type = "button";
    punto.className = "lab-carousel__dot";
    punto.setAttribute("aria-label", `Imagen ${indice + 1}`);
    punto.addEventListener("click", () => mostrar(indice));
    contenedorPuntos.appendChild(punto);
    return punto;
});

function mostrar(indice) {
    // Después de la última vuelve a la primera, y al revés
    actual = (indice + diapositivas.length) % diapositivas.length;

    diapositivas.forEach((diapositiva, i) => {
        diapositiva.classList.toggle("is-active", i === actual);
    });
    puntos.forEach((punto, i) => {
        punto.setAttribute("aria-current", String(i === actual));
    });
}

document.querySelector("[data-carousel-prev]").addEventListener("click", () => mostrar(actual - 1));
document.querySelector("[data-carousel-next]").addEventListener("click", () => mostrar(actual + 1));

mostrar(0);
