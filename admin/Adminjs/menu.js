/**
 * menu.js
 * -----------------------------------------------------------
 * Menú lateral del panel, común a todas las páginas:
 *  - Abre y cierra los submenús (Anexos, Polideportivo).
 *  - En celular/tablet, el botón de la barra superior abre el
 *    menú como panel deslizante; tocando el fondo se cierra.
 * -----------------------------------------------------------
 */

document.querySelectorAll("[data-toggle]").forEach((boton) => {
    boton.addEventListener("click", () => {
        const abierto = boton.getAttribute("aria-expanded") === "true";
        boton.setAttribute("aria-expanded", String(!abierto));
        boton.nextElementSibling.classList.toggle("is-open", !abierto);
    });
});

const sidebar = document.getElementById("adminSidebar");
const fondo = document.getElementById("adminSidebarBackdrop");
const botonMenu = document.getElementById("adminMenuBtn");

function abrirMenu(abrir) {
    sidebar.classList.toggle("is-open", abrir);
    fondo.classList.toggle("is-open", abrir);
}

botonMenu.addEventListener("click", () => abrirMenu(!sidebar.classList.contains("is-open")));
fondo.addEventListener("click", () => abrirMenu(false));
