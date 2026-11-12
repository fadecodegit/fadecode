// Actividades del Polideportivo: muestra los cambios hechos desde el panel
// en el texto de arriba y en cada actividad; las nuevas van al final.
// Si el servidor no responde, queda lo que ya trae la página.

const grillaActividades = document.querySelector(".pact-grid");

function ponerActividad(tarjeta, actividad) {
    const contenedorImagen = document.createElement("div");
    contenedorImagen.className = "pact-card-item__image-wrapper";
    const imagen = document.createElement("img");
    imagen.className = "pact-card-item__image";
    imagen.src = actividad.imagen;
    imagen.alt = `Actividad de ${actividad.nombre}`;
    contenedorImagen.appendChild(imagen);

    const cuerpo = document.createElement("div");
    cuerpo.className = "pact-card-item__body";
    const titulo = document.createElement("h2");
    titulo.className = "pact-card-item__title";
    titulo.textContent = actividad.nombre;
    cuerpo.appendChild(titulo);

    // El horario es opcional
    if (actividad.horario) {
        const horario = document.createElement("span");
        horario.className = "pact-card-item__schedule";
        horario.textContent = actividad.horario;
        cuerpo.appendChild(horario);
    }

    const texto = document.createElement("p");
    texto.className = "pact-card-item__text";
    texto.textContent = actividad.descripcion;
    cuerpo.appendChild(texto);

    tarjeta.replaceChildren(contenedorImagen, cuerpo);
}

async function cargarActividades() {
    try {
        const respuesta = await fetch("../backend/polideportivo-actividades.php?accion=listar");
        const datos = await respuesta.json();
        if (!datos.exito) return;

        datos.fijas.forEach((cambio) => {
            if (cambio.clave_fija === "intro") {
                const intro = document.querySelector(".pact-intro");
                if (intro && cambio.descripcion) intro.textContent = cambio.descripcion;
                return;
            }
            const tarjeta = grillaActividades.querySelector(`[data-actividad-fija="${cambio.clave_fija}"]`);
            if (!tarjeta) return;
            if (Number(cambio.eliminada)) {
                tarjeta.remove();
                return;
            }
            if (!cambio.nombre) return;
            // Sin imagen nueva queda la original
            const original = tarjeta.querySelector(".pact-card-item__image").getAttribute("src");
            ponerActividad(tarjeta, { ...cambio, imagen: cambio.imagen ? `../${cambio.imagen}` : original });
        });

        datos.nuevas.forEach((actividad) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "pact-card-item";
            ponerActividad(tarjeta, { ...actividad, imagen: `../${actividad.imagen}` });
            grillaActividades.appendChild(tarjeta);
        });
    } catch {
    }
}

if (grillaActividades) cargarActividades();
