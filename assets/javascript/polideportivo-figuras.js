// Figuras importantes del Polideportivo: muestra los cambios hechos desde el panel
// en cada figura; las nuevas van al final.
// Si el servidor no responde, quedan las figuras que ya trae la página.

const grillaFiguras = document.querySelector(".pfig-grid");

function ponerFigura(tarjeta, figura) {
    const contenedorFoto = document.createElement("div");
    contenedorFoto.className = "pfig-item__image-wrapper";
    const foto = document.createElement("img");
    foto.className = "pfig-item__image";
    foto.src = figura.imagen;
    foto.alt = figura.nombre;
    contenedorFoto.appendChild(foto);

    const nombre = document.createElement("h2");
    nombre.className = "pfig-item__name";
    nombre.textContent = figura.nombre;

    const cargo = document.createElement("p");
    cargo.className = "pfig-item__cargo";
    cargo.textContent = figura.cargo;

    tarjeta.replaceChildren(contenedorFoto, nombre, cargo);

    // El número de contacto es opcional
    if (figura.telefono) {
        const contacto = document.createElement("div");
        contacto.className = "pfig-item__contacto";
        const numero = document.createElement("span");
        numero.textContent = figura.telefono;
        contacto.appendChild(numero);
        tarjeta.appendChild(contacto);
    }
}

async function cargarFiguras() {
    try {
        const respuesta = await fetch("../backend/polideportivo-figuras.php?accion=listar");
        const datos = await respuesta.json();
        if (!datos.exito) return;

        datos.fijas.forEach((cambio) => {
            const tarjeta = grillaFiguras.querySelector(`[data-figura-fija="${cambio.clave_fija}"]`);
            if (!tarjeta) return;
            if (Number(cambio.eliminada)) {
                tarjeta.remove();
                return;
            }
            if (!cambio.nombre) return;
            // Sin foto nueva queda la original
            const original = tarjeta.querySelector(".pfig-item__image").getAttribute("src");
            ponerFigura(tarjeta, { ...cambio, imagen: cambio.imagen ? `../${cambio.imagen}` : original });
        });

        datos.nuevas.forEach((figura) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "pfig-item";
            ponerFigura(tarjeta, { ...figura, imagen: `../${figura.imagen}` });
            grillaFiguras.appendChild(tarjeta);
        });
    } catch {
    }
}

if (grillaFiguras) cargarFiguras();
