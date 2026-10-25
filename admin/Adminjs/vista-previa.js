/**
 * vista-previa.js
 * -----------------------------------------------------------
 * Funciones comunes para las vistas previas en vivo del panel.
 * Cada página (CrearNoticia.js, Laboratorio.js, etc.) carga
 * este archivo antes que el suyo y usa estas funciones.
 * -----------------------------------------------------------
 */

const porId = (id) => document.getElementById(id);

// El envío real de los formularios lo conecta backend. Mientras tanto,
// "Subir" no recarga la página para no perder lo armado en la vista previa.
document.querySelectorAll("form.admin-form-card").forEach((formulario) => {
    formulario.addEventListener("submit", (evento) => evento.preventDefault());
});

// Ejecuta una función justo después de que el botón "Limpiar" vacía el formulario
function alLimpiar(formulario, funcion) {
    if (formulario) {
        formulario.addEventListener("reset", () => setTimeout(funcion));
    }
}

// Copia lo que se escribe en un campo a un elemento de la vista previa.
// Si el campo queda vacío, vuelve a mostrar el texto original del HTML.
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

// URL temporal de la imagen elegida en un <input type="file"> (o null)
function urlImagen(campo) {
    const archivo = campo.files && campo.files[0];
    return archivo ? URL.createObjectURL(archivo) : null;
}

// Pone (o saca) una imagen en un <img>
function ponerImagen(imagen, url) {
    if (url) {
        imagen.src = url;
    } else {
        imagen.removeAttribute("src");
    }
}

// Muestra la imagen elegida en la miniatura del campo y, si se indica,
// también en la vista previa (contenedor con la clase has-image + <img>)
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

// Vacía solo los campos indicados (no todo el formulario) y avisa a la
// vista previa para que se actualice
function limpiarCampos(...ids) {
    ids.forEach((id) => {
        const campo = porId(id);
        if (!campo) return;
        campo.value = "";
        campo.dispatchEvent(new Event(campo.type === "file" ? "change" : "input"));
    });
}

// Atajo para crear un elemento con clase y texto
function crear(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (texto) elemento.textContent = texto;
    return elemento;
}

// Crea una imagen a partir del archivo elegido en un campo
function crearImagen(campo) {
    const imagen = document.createElement("img");
    imagen.src = urlImagen(campo);
    imagen.alt = "";
    return imagen;
}

// Agrega una tarjeta a una lista de la vista previa, con su botón "×" para
// quitarla, y muestra u oculta el mensaje "Todavía no agregaste..."
function agregarALista(idLista, idVacio, tarjeta, botonQuitar) {
    const lista = porId(idLista);
    const vacio = porId(idVacio);

    const actualizarVacio = () => {
        // El mensaje de vacío también es hijo de la lista
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

// Botones "Imagen / Texto" o "Texto / Tabla": muestran un bloque u otro.
// Recibe pares [idBoton, idBloque] y devuelve una función que dice cuál está activo.
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
