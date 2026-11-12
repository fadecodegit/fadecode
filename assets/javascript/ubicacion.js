// Ubicación UTU y anexos: muestra los cambios hechos desde el panel.
// Si el servidor no responde, queda lo que ya trae la página.

const tarjetaUbicacion = document.querySelector("[data-pagina]");

function aplicarCambios(cambios) {
    tarjetaUbicacion.querySelector(".ubi-title__text").textContent = cambios.titulo_pagina;
    tarjetaUbicacion.querySelector(".ubi-info__text").textContent = cambios.texto_pagina;
    // Solo Ubicación UTU tiene subtítulo
    const subtitulo = tarjetaUbicacion.querySelector(".ubi-info__subtitle");
    if (subtitulo && cambios.subtitulo_pagina) {
        subtitulo.textContent = cambios.subtitulo_pagina;
    }
    if (cambios.imagen_pagina) {
        tarjetaUbicacion.querySelector(".ubi-map").src = `../${cambios.imagen_pagina}`;
    }

    const [localizacion, telefono, correo, director] = tarjetaUbicacion.querySelectorAll(".ubi-list__text");
    localizacion.textContent = cambios.localizacion;
    director.textContent = cambios.director;

    const enlaceCorreo = correo.querySelector("a");
    enlaceCorreo.textContent = cambios.correo;
    enlaceCorreo.href = `mailto:${cambios.correo}`;

    // Los números se llaman con el prefijo de Uruguay
    const digitos = cambios.telefono.replace(/\D/g, "");
    const enlaceTelefono = telefono.querySelector("a");
    enlaceTelefono.textContent = cambios.telefono;
    enlaceTelefono.href = digitos.startsWith("598") ? `tel:+${digitos}` : `tel:+598${digitos}`;
}

async function cargarCambios() {
    try {
        const pagina = encodeURIComponent(tarjetaUbicacion.dataset.pagina);
        const respuesta = await fetch(`../backend/ubicaciones.php?accion=leer&pagina=${pagina}`);
        const datos = await respuesta.json();
        if (datos.exito && datos.cambios) aplicarCambios(datos.cambios);
    } catch {
    }
}

if (tarjetaUbicacion) cargarCambios();
