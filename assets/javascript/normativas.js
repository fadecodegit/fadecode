// Normativas: muestra los cambios de Uniforme y, debajo, las normativas
// publicadas desde el panel.

const contenedorNormativas = document.getElementById("normativasPublicadas");

// Crea un elemento con su clase y su texto
function elemento(etiqueta, clase, texto) {
    const nuevo = document.createElement(etiqueta);
    nuevo.className = clase;
    if (texto) nuevo.textContent = texto;
    return nuevo;
}

function crearTarjetaImagen(bloque) {
    const tarjeta = elemento("article", "norm-uniform-card");

    const marco = elemento("div", "norm-uniform-card__image-wrapper");
    const imagen = elemento("img", "norm-uniform-card__image");
    imagen.src = `../${bloque.imagen_bloque}`;
    imagen.alt = bloque.subtitulo_bloque || "";
    imagen.loading = "lazy";
    marco.appendChild(imagen);

    const cuerpo = elemento("div", "norm-uniform-card__body");
    if (bloque.subtitulo_bloque) cuerpo.appendChild(elemento("h3", "norm-uniform-card__title", bloque.subtitulo_bloque));
    if (bloque.texto_bloque) cuerpo.appendChild(elemento("p", "norm-uniform-card__text", bloque.texto_bloque));

    tarjeta.append(marco, cuerpo);
    return tarjeta;
}

function crearSeccion(normativa) {
    const seccion = elemento("section", "norm-section");
    seccion.append(
        elemento("h2", "norm-subtitle", normativa.titulo_normativa),
        elemento("p", "norm-text", normativa.texto_normativa)
    );

    let grilla = null; // fotos seguidas van juntas en una fila
    normativa.bloques.forEach((bloque) => {
        if (bloque.tipo_bloque === "imagen") {
            if (!grilla) {
                grilla = elemento("div", "norm-uniform-grid");
                seccion.appendChild(grilla);
            }
            grilla.appendChild(crearTarjetaImagen(bloque));
            return;
        }
        grilla = null;
        if (bloque.subtitulo_bloque) seccion.appendChild(elemento("h3", "norm-block-title", bloque.subtitulo_bloque));
        if (bloque.texto_bloque) seccion.appendChild(elemento("p", "norm-text", bloque.texto_bloque));
    });

    return seccion;
}

// Uniforme: si se cambió desde el panel se muestran sus textos e imágenes nuevos;
// si se eliminó, no se ve
function aplicarUniforme(cambio) {
    const seccion = document.querySelector('[data-normativa-fija="uniforme"]');
    if (!seccion) return;
    if (Number(cambio.eliminada)) {
        seccion.remove();
        return;
    }
    if (!cambio.titulo) return;

    const contenido = JSON.parse(cambio.contenido);
    seccion.querySelector(".norm-subtitle").textContent = cambio.titulo;
    seccion.querySelector(".norm-text").textContent = contenido.texto;
    const nota = seccion.querySelector(".norm-note");
    nota.textContent = contenido.nota;
    nota.hidden = !contenido.nota;

    seccion.querySelectorAll(".norm-uniform-card").forEach((tarjeta, indice) => {
        const datos = contenido.tarjetas[indice];
        if (!datos) return;
        tarjeta.querySelector(".norm-uniform-card__title").textContent = datos.titulo;
        tarjeta.querySelector(".norm-uniform-card__badge").textContent = datos.etiqueta;
        tarjeta.querySelector(".norm-uniform-card__text").textContent = datos.texto;
        const imagen = tarjeta.querySelector(".norm-uniform-card__image");
        if (datos.imagen) imagen.src = `../${datos.imagen}`;
        imagen.alt = `${datos.etiqueta} — ${datos.titulo}`;
    });
}

async function cargarNormativas() {
    try {
        const respuesta = await fetch("../backend/normativas.php?accion=listar");
        const datos = await respuesta.json();
        if (!datos.exito) return;
        if (datos.uniforme) aplicarUniforme(datos.uniforme);
        contenedorNormativas.replaceChildren(...datos.normativas.map(crearSeccion));
    } catch {
        // Si el servidor no responde, queda solo lo que ya trae la página
    }
}

if (contenedorNormativas) cargarNormativas();
