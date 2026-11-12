// Cambia el menú según si la persona inició sesión:
// sin sesión ve "Registrarse" e "Iniciar sesión"; con sesión, "Formulario de Interés" y "Cuenta".

const botonLogin = document.querySelector(".site-nav-actions .btn-nav--login:not([data-boton-sesion])");

// Si ya había sesión, "Iniciar sesión" no se muestra mientras se consulta al servidor
if (botonLogin && document.cookie.includes("sesionAbierta=1")) {
    botonLogin.style.visibility = "hidden";
}

async function consultarSesion() {
    try {
        const respuesta = await fetch("../backend/sesion.php");
        return await respuesta.json();
    } catch {
        // Si el servidor no responde, se toma como sin sesión
        return null;
    }
}

function mostrarFormularioInteres() {
    document.querySelectorAll("[data-boton-sesion]").forEach((boton) => {
        boton.href = boton.getAttribute("href").replace("Registrarse.html", "Preinscribirse.html");
        boton.textContent = "Formulario de Interés";
        boton.classList.replace("btn-nav--login", "btn-nav--preinscribir");
    });
}

function crearDato(titulo, valor) {
    const fila = document.createElement("div");
    fila.className = "cuenta-tarjeta__dato";

    const etiqueta = document.createElement("dt");
    etiqueta.textContent = titulo;
    const contenido = document.createElement("dd");
    contenido.textContent = valor;

    fila.append(etiqueta, contenido);
    return fila;
}

async function cerrarSesion() {
    try {
        await fetch("../backend/logout.php", { method: "POST" });
    } catch {
        // Recarga la página para mostrar el menú sin sesión
    }
    window.location.reload();
}

function agregarGestionarCuenta(usuario) {
    if (!botonLogin) {
        return;
    }

    const cuenta = document.createElement("div");
    cuenta.className = "cuenta";

    const boton = document.createElement("button");
    boton.className = "btn-nav btn-nav--login";
    boton.type = "button";
    boton.textContent = "Cuenta";
    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-controls", "cuentaTarjeta");

    const tarjeta = document.createElement("div");
    tarjeta.className = "cuenta-tarjeta";
    tarjeta.id = "cuentaTarjeta";
    tarjeta.hidden = true;

    const datos = document.createElement("dl");
    datos.className = "cuenta-tarjeta__datos";
    datos.append(
        crearDato("Nombre", usuario.nombre),
        crearDato("Apellido", usuario.apellido),
        crearDato("Cédula", usuario.cedula)
    );
    // Si la cuenta es de un menor, se muestran los datos del adulto responsable
    if (usuario.responsable) {
        datos.append(
            crearDato("Nombre Responsable", usuario.responsable.nombre),
            crearDato("Teléfono Responsable", usuario.responsable.telefono)
        );
    }
    datos.append(crearDato("Correo electrónico", usuario.email));

    const botonCerrar = document.createElement("button");
    botonCerrar.className = "cuenta-tarjeta__cerrar";
    botonCerrar.type = "button";
    botonCerrar.textContent = "Cerrar sesión";
    botonCerrar.addEventListener("click", cerrarSesion);

    tarjeta.append(datos);

    // Solo los administradores ven el botón "Panel Admin"
    if (usuario.id_nivel === 1) {
        const botonPanel = document.createElement("a");
        botonPanel.className = "cuenta-tarjeta__panel";
        botonPanel.href = "../admin/Institucional.html";
        botonPanel.textContent = "Panel Admin";
        tarjeta.append(botonPanel);
    }

    tarjeta.append(botonCerrar);
    cuenta.append(boton, tarjeta);
    botonLogin.replaceWith(cuenta);

    function mostrarTarjeta(visible) {
        tarjeta.hidden = !visible;
        boton.setAttribute("aria-expanded", String(visible));
    }

    boton.addEventListener("click", () => mostrarTarjeta(tarjeta.hidden));

    // Se cierra al tocar afuera o con Escape
    document.addEventListener("click", (evento) => {
        if (!cuenta.contains(evento.target)) {
            mostrarTarjeta(false);
        }
    });
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && !tarjeta.hidden) {
            mostrarTarjeta(false);
            boton.focus();
        }
    });
}

consultarSesion().then((respuesta) => {
    if (respuesta && respuesta.autenticado) {
        document.cookie = "sesionAbierta=1; path=/";

        // Separa el nombre del apellido
        const usuario = respuesta.usuario;
        const espacio = usuario.nom_usuario.indexOf(" ");
        usuario.nombre = espacio === -1 ? usuario.nom_usuario : usuario.nom_usuario.slice(0, espacio);
        usuario.apellido = espacio === -1 ? "" : usuario.nom_usuario.slice(espacio + 1);

        mostrarFormularioInteres();
        agregarGestionarCuenta(usuario);
    } else {
        document.cookie = "sesionAbierta=; path=/; max-age=0";
        if (botonLogin) botonLogin.style.visibility = "";
    }
});
