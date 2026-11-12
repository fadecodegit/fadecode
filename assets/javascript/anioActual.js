// Pone el año actual en el pie de página.
document.querySelectorAll("[data-anio-actual]").forEach((anio) => {
    anio.textContent = new Date().getFullYear();
});
