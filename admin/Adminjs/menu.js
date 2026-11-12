// Menú lateral del panel: abre los submenús, se despliega en celular
// y muestra el nombre de quien inició sesión.

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

// El botón de la puerta cierra la sesión y vuelve al sitio
const botonSalir = document.querySelector(".admin-sidebar__logout");
botonSalir.addEventListener("click", async () => {
    botonSalir.disabled = true;
    try {
        const respuesta = await fetch("../backend/logout.php", { method: "POST" });
        const datos = await respuesta.json();
        if (!datos.exito) throw new Error("logout");
        window.location.href = "../html/index.html";
    } catch {
        // Si no se pudo cerrar la sesión, se queda en el panel y avisa
        botonSalir.disabled = false;
        window.alert("No se pudo cerrar la sesión. Intentá de nuevo.");
    }
});

// Muestra el nombre de quien inició sesión
fetch("../backend/sesion.php")
    .then((respuesta) => respuesta.json())
    .then((datos) => {
        if (datos.autenticado) {
            document.querySelector(".admin-sidebar__user-name").textContent = datos.usuario.nom_usuario;
        }
    })
    .catch(() => {});
