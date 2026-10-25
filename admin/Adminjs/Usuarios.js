/**
 * Usuarios.js
 * -----------------------------------------------------------
 * Pestañas Estudiantes / Administradores y buscador de la
 * página Usuarios.html. Las filas de las tablas las carga
 * backend; el buscador filtra las que haya.
 * -----------------------------------------------------------
 */

const pestanas = document.querySelectorAll("[data-users-tab]");

pestanas.forEach((pestana) => {
    pestana.addEventListener("click", () => {
        pestanas.forEach((otra) => {
            const activa = otra === pestana;
            otra.classList.toggle("is-active", activa);
            otra.setAttribute("aria-selected", String(activa));
            document.getElementById(otra.getAttribute("aria-controls")).hidden = !activa;
        });
    });
});

// Oculta las filas que no contienen lo buscado (nombre, cédula, email...)
document.getElementById("usuariosSearch").addEventListener("input", (evento) => {
    const buscado = evento.target.value.trim().toLowerCase();
    document.querySelectorAll(".admin-users-table tbody tr").forEach((fila) => {
        fila.classList.toggle("is-hidden", !fila.textContent.toLowerCase().includes(buscado));
    });
});
