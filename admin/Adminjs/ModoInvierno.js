// Modo invierno del panel: el botón de la nube cambia a colores fríos
// y la página recuerda la elección.

const CLAVE_MODO = "modoInvierno";

function modoGuardado() {
    try {
        return localStorage.getItem(CLAVE_MODO) === "si";
    } catch {
        return false;
    }
}

document.documentElement.classList.toggle("modo-invierno", modoGuardado());

document.addEventListener("DOMContentLoaded", () => {
    const botonNube = document.querySelector(".admin-topbar__icon");
    if (!botonNube) return;

    const marcarBoton = (activo) => {
        botonNube.setAttribute("aria-pressed", String(activo));
        botonNube.setAttribute("aria-label", activo ? "Desactivar modo invierno" : "Activar modo invierno");
    };
    marcarBoton(modoGuardado());

    botonNube.addEventListener("click", () => {
        const activo = document.documentElement.classList.toggle("modo-invierno");
        try {
            localStorage.setItem(CLAVE_MODO, activo ? "si" : "no");
        } catch {
            // Si el navegador no deja guardar, el modo dura solo en esta página
        }
        marcarBoton(activo);

        // Avisa que cambiaron los colores, para que los gráficos se vuelvan a pintar
        document.dispatchEvent(new Event("cambio-modo"));
    });
});
