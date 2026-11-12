// Herramientas que comparten todas las pantallas del panel.

const porId = (id) => document.getElementById(id);

// "Subir" no recarga la página, así no se pierde lo cargado
document.querySelectorAll("form.admin-form-card").forEach((formulario) => {
    formulario.addEventListener("submit", (evento) => evento.preventDefault());
});

// Hace algo justo después de tocar "Limpiar"
function alLimpiar(formulario, funcion) {
    if (formulario) {
        formulario.addEventListener("reset", () => setTimeout(funcion));
    }
}

// Lo que se escribe en un campo aparece en la vista previa
function vincularTexto(idCampo, idVista, formato) {
    const campo = porId(idCampo);
    const vista = porId(idVista);
    if (!campo || !vista) return;

    const textoInicial = vista.textContent;
    const actualizar = () => {
        const valor = campo.value.trim();
        vista.textContent = valor ? (formato ? formato(valor) : valor) : textoInicial;
    };

    campo.addEventListener("input", actualizar);
    alLimpiar(campo.form, actualizar);
}

// Muestra la imagen elegida antes de subirla
function urlImagen(campo) {
    const archivo = campo.files && campo.files[0];
    return archivo ? URL.createObjectURL(archivo) : null;
}

// Pone o saca una imagen
function ponerImagen(imagen, url) {
    if (url) {
        imagen.src = url;
    } else {
        imagen.removeAttribute("src");
    }
}

// Muestra la imagen elegida en la miniatura y en la vista previa
function vincularImagen(idCampo, idMiniatura, idContenedorVista, idImagenVista) {
    const campo = porId(idCampo);
    const miniatura = porId(idMiniatura);
    const contenedorVista = idContenedorVista ? porId(idContenedorVista) : null;
    const imagenVista = idImagenVista ? porId(idImagenVista) : null;
    if (!campo || !miniatura) return;

    const mostrar = (url) => {
        miniatura.classList.toggle("has-image", Boolean(url));
        ponerImagen(miniatura.querySelector("img"), url);
        if (contenedorVista) contenedorVista.classList.toggle("has-image", Boolean(url));
        if (imagenVista) ponerImagen(imagenVista, url);
    };

    campo.addEventListener("change", () => mostrar(urlImagen(campo)));
    alLimpiar(campo.form, () => mostrar(null));
}

// Vacía solo los campos indicados
function limpiarCampos(...ids) {
    ids.forEach((id) => {
        const campo = porId(id);
        if (!campo) return;
        campo.value = "";
        campo.dispatchEvent(new Event(campo.type === "file" ? "change" : "input"));
    });
}

// Crea un elemento con su clase y su texto
function crear(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (texto) elemento.textContent = texto;
    return elemento;
}

// Crea una imagen con el archivo elegido
function crearImagen(campo) {
    const imagen = document.createElement("img");
    imagen.src = urlImagen(campo);
    imagen.alt = "";
    return imagen;
}

// Agrega una tarjeta a la vista previa con su "×" para quitarla
function agregarALista(idLista, idVacio, tarjeta, botonQuitar) {
    const lista = porId(idLista);
    const vacio = porId(idVacio);

    const actualizarVacio = () => {
        vacio.hidden = lista.children.length > 1;
    };

    botonQuitar.type = "button";
    botonQuitar.textContent = "×";
    botonQuitar.setAttribute("aria-label", "Quitar");
    botonQuitar.addEventListener("click", () => {
        tarjeta.remove();
        actualizarVacio();
    });

    lista.appendChild(tarjeta);
    actualizarVacio();
}

// Botones para elegir qué tipo de bloque se agrega (por ejemplo Imagen / Texto)
function interruptor(pares) {
    let activo = 0;

    const activar = (indice) => {
        activo = indice;
        pares.forEach(([idBoton, idBloque], i) => {
            porId(idBoton).classList.toggle("is-active", i === indice);
            porId(idBloque).hidden = i !== indice;
        });
    };

    pares.forEach(([idBoton], i) => porId(idBoton).addEventListener("click", () => activar(i)));
    activar(0);

    return () => activo;
}
