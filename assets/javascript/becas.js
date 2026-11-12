// Becas: muestra los cambios hechos desde el panel en el texto de arriba y en cada beca.
// Si el servidor no responde, queda lo que ya trae la página.

function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (texto) elemento.textContent = texto;
    return elemento;
}

function ponerBeca(articulo, titulo, beca) {
    // El título conserva su identificador para los lectores de pantalla
    const encabezado = crearElemento("h2", "beca__titulo", titulo);
    encabezado.id = articulo.getAttribute("aria-labelledby");

    const pasos = crearElemento("ol", "beca__pasos");
    pasos.append(...beca.pasos.map((paso) => crearElemento("li", "", paso)));

    const contenido = [
        encabezado,
        crearElemento("span", "beca__etiqueta", beca.etiqueta),
        crearElemento("p", "beca__texto", beca.texto),
        crearElemento("h3", "beca__subtitulo", "Pasos para postularte"),
        pasos
    ];
    if (beca.nota) contenido.push(crearElemento("p", "beca__nota", beca.nota));

    const boton = crearElemento("a", "beca__btn", "Preinscribirse");
    boton.href = beca.enlace;
    boton.target = "_blank";
    boton.rel = "noopener noreferrer";
    contenido.push(boton);

    articulo.replaceChildren(...contenido);
}

async function cargarBecas() {
    try {
        const respuesta = await fetch("../backend/becas.php?accion=listar");
        const datos = await respuesta.json();
        if (!datos.exito) return;

        datos.cambios.forEach((cambio) => {
            if (cambio.clave_fija === "intro") {
                const intro = document.querySelector(".becas-intro");
                if (intro) intro.textContent = cambio.contenido;
                return;
            }
            const articulo = document.querySelector(`[data-beca-fija="${cambio.clave_fija}"]`);
            if (articulo) ponerBeca(articulo, cambio.titulo, JSON.parse(cambio.contenido));
        });
    } catch {
    }
}

if (document.querySelector(".becas-lista")) cargarBecas();
