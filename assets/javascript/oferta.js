// Página de una oferta educativa.
// Si se cambió desde el panel muestra la versión nueva; si se eliminó, vuelve al menú.
// Las ofertas nuevas se arman con los datos cargados en el panel.

const paginaOferta = document.querySelector(".oferta-page");
const ANIOS = ["Primer Año", "Segundo Año", "Tercer Año"];

function nodo(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    if (clase) elemento.className = clase;
    if (texto) elemento.textContent = texto;
    return elemento;
}

// En cada punto, lo que va antes de los dos puntos se ve en negrita
function crearLista(items, clase) {
    const lista = nodo("ul", clase);
    (items || "").split("\n").map((linea) => linea.trim()).filter(Boolean).forEach((linea) => {
        const punto = nodo("li", "mb-2");
        const dos = linea.indexOf(":");
        if (dos > 0) {
            punto.append(nodo("strong", "", linea.slice(0, dos + 1)), ` ${linea.slice(dos + 1).trim()}`);
        } else {
            punto.textContent = linea;
        }
        lista.appendChild(punto);
    });
    return lista;
}

function crearArticulo(titulo, intro, items, claseLista) {
    const articulo = nodo("article", "mb-4");
    articulo.append(nodo("h2", "h4 fw-bold mb-3", titulo), nodo("p", "mb-3", intro), crearLista(items, claseLista));
    return articulo;
}

function crearHorarios(oferta) {
    const seccion = nodo("div", "oferta-section oferta-tabs");
    seccion.appendChild(nodo("h2", "oferta-section__title", "Horarios con Materias"));

    ANIOS.forEach((_, i) => {
        const radio = nodo("input", "oferta-tabs__radio");
        radio.type = "radio";
        radio.name = "ofertaAnio";
        radio.id = `ofertaAnio${i + 1}`;
        radio.checked = i === 0;
        seccion.appendChild(radio);
    });

    const control = nodo("div", "oferta-tabs__control");
    const paneles = nodo("div", "oferta-tabs__panels");
    ANIOS.forEach((anio, i) => {
        const etiqueta = nodo("label", `oferta-tabs__label oferta-tabs__label--${i + 1}`, anio);
        etiqueta.htmlFor = `ofertaAnio${i + 1}`;
        control.appendChild(etiqueta);

        const panel = nodo("div", "oferta-tabs__panel");
        panel.id = `ofertaPanel${i + 1}`;
        const marco = nodo("div", "oferta-section__image");
        const horario = oferta[`horario_${i + 1}`];
        if (horario) {
            const imagen = nodo("img");
            imagen.src = `../${horario}`;
            imagen.alt = `Horarios y materias de ${anio.toLowerCase()}`;
            imagen.loading = "lazy";
            marco.appendChild(imagen);
        } else {
            marco.appendChild(nodo("p", "", "Todavía no hay horario publicado para este año."));
        }
        panel.append(nodo("h3", "oferta-tabs__panel-title", anio), marco);
        paneles.appendChild(panel);
    });

    seccion.append(control, paneles);
    return seccion;
}

function pintarOferta(oferta) {
    const banner = nodo("div", "oferta-banner");
    const icono = nodo("div", "oferta-banner__icon");
    const imagen = nodo("img");
    imagen.src = `../${oferta.icono}`;
    imagen.alt = "";
    imagen.setAttribute("aria-hidden", "true");
    icono.appendChild(imagen);
    const textos = nodo("div", "oferta-banner__text");
    textos.append(nodo("h1", "oferta-banner__title", oferta.titulo), nodo("p", "oferta-banner__subtitle", oferta.subtitulo));
    banner.append(icono, textos);

    const descripcion = nodo("section", "mb-5");
    descripcion.append(
        crearArticulo("¿Qué ofrece esta propuesta educativa?", oferta.ofrece_intro, oferta.ofrece_items, "mb-4"),
        crearArticulo("¿Qué lograrán los estudiantes al egresar?", oferta.logros_intro, oferta.logros_items, "")
    );
    const cuerpo = nodo("div", "oferta-body");
    cuerpo.append(descripcion, crearHorarios(oferta));

    paginaOferta.replaceChildren(banner, cuerpo);
    document.title = `${oferta.titulo} Escuela Técnica 1 "Mtro. Téc. Sergio González Olaizola"`;
}

async function cargarOferta() {
    const clave = paginaOferta.dataset.ofertaFija;
    const id = new URLSearchParams(location.search).get("id");
    const consulta = clave ? `clave=${encodeURIComponent(clave)}` : `id=${encodeURIComponent(id || "")}`;

    try {
        const respuesta = await fetch(`../backend/ofertas.php?accion=leer&${consulta}`);
        const datos = await respuesta.json();
        if (!datos.exito) return;
        const oferta = datos.oferta;

        // Eliminada, o una oferta nueva que no existe: se vuelve al menú
        if ((!oferta && !clave) || (oferta && Number(oferta.eliminada))) {
            location.replace("Menu-de-Ofertas.html");
            return;
        }
        if (oferta && oferta.nombre) pintarOferta(oferta);
    } catch {
    }
}

if (paginaOferta) cargarOferta();
