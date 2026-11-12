// Página del Polideportivo: muestra los cambios hechos desde el panel en los datos
// y en las secciones; las secciones nuevas van antes de los botones del final.
// Si el servidor no responde, queda el contenido que ya trae la página.

const tarjetaPoli = document.querySelector(".poli-card");

function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (texto) elemento.textContent = texto;
    return elemento;
}

// Texto: un párrafo por línea; la línea que empieza con "#" es un subtítulo chico
function contenidoTexto(texto) {
    return texto.split("\n").filter(Boolean).map((linea) => linea.startsWith("#")
        ? crearElemento("h3", "poli-subsubtitle", linea.replace(/^#+\s*/, ""))
        : crearElemento("p", "poli-text", linea));
}

function contenidoTabla(json) {
    const { columnas, filas } = JSON.parse(json);
    const tabla = crearElemento("table", "poli-table");
    const encabezado = tabla.createTHead().insertRow();
    columnas.forEach((columna) => {
        const celda = crearElemento("th", "", columna);
        celda.scope = "col";
        encabezado.appendChild(celda);
    });
    const cuerpo = tabla.createTBody();
    filas.forEach((fila) => {
        const filaTabla = cuerpo.insertRow();
        fila.forEach((valor) => {
            filaTabla.insertCell().textContent = valor;
        });
    });
    const contenedor = crearElemento("div", "poli-table-wrapper");
    contenedor.appendChild(tabla);
    return [contenedor];
}

function ponerSeccion(panel, seccion) {
    const contenido = seccion.tipo === "tabla" ? contenidoTabla(seccion.contenido) : contenidoTexto(seccion.contenido);
    panel.replaceChildren(crearElemento("h2", "poli-subtitle", seccion.titulo), ...contenido);
}

function aplicarDatos(cambio) {
    const datos = JSON.parse(cambio.contenido);
    document.getElementById("poli-heading").textContent = cambio.titulo;
    const filas = tarjetaPoli.querySelectorAll('[data-poli-fijo="datos"] .poli-datos__row');
    const valores = [datos.inauguracion, datos.coordinador, datos.direccion, datos.telefono];
    filas.forEach((fila, indice) => {
        fila.querySelector("dd").textContent = valores[indice];
    });
    filas[1].querySelector("dt").textContent = `${datos.etiqueta_coordinador}:`;
}

async function cargarPolideportivo() {
    try {
        const respuesta = await fetch("../backend/polideportivo.php?accion=listar");
        const datos = await respuesta.json();
        if (!datos.exito) return;

        datos.fijas.forEach((cambio) => {
            if (cambio.clave_fija === "datos") {
                aplicarDatos(cambio);
                return;
            }
            const panel = tarjetaPoli.querySelector(`[data-poli-fijo="${cambio.clave_fija}"]`);
            if (!panel) return;
            if (Number(cambio.eliminada)) {
                panel.remove();
            } else if (cambio.titulo) {
                ponerSeccion(panel, cambio);
            }
        });

        const botones = tarjetaPoli.querySelector(".poli-links");
        datos.nuevas.forEach((seccion) => {
            const panel = crearElemento("div", "poli-panel");
            ponerSeccion(panel, seccion);
            tarjetaPoli.insertBefore(panel, botones);
        });
    } catch {
    }
}

if (tarjetaPoli) cargarPolideportivo();
