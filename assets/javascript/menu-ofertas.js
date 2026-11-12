// Menú de ofertas educativas: muestra los cambios hechos desde el panel
// y agrega al final las ofertas nuevas.
// Una oferta sin horario lleva a "Oferta en desarrollo".
// Si el servidor no responde, queda el menú que ya trae la página.

const grillaOfertas = document.querySelector(".offers-grid");
const EN_DESARROLLO = "../html/OfertaEnDesarrollo.html";

const tieneHorario = (oferta) => Boolean(oferta.horario_1 || oferta.horario_2 || oferta.horario_3);

function crearTarjetaOferta(oferta) {
    const tarjeta = document.createElement("a");
    tarjeta.className = "offer-item";
    tarjeta.href = tieneHorario(oferta) ? `oferta.html?id=${oferta.id_oferta_panel}` : EN_DESARROLLO;

    const icono = document.createElement("span");
    icono.className = "offer-item__icon";
    const imagen = document.createElement("img");
    imagen.src = `../${oferta.icono}`;
    imagen.alt = oferta.nombre;
    imagen.width = 48;
    imagen.height = 48;
    imagen.loading = "lazy";
    icono.appendChild(imagen);

    const texto = document.createElement("span");
    texto.className = "offer-item__label";
    texto.textContent = oferta.nombre;

    tarjeta.append(icono, texto);
    return tarjeta;
}

function aplicarCambiosFijos(fijas) {
    fijas.forEach((oferta) => {
        const tarjeta = grillaOfertas.querySelector(`[data-oferta-fija="${oferta.clave_fija}"]`);
        if (!tarjeta) return;
        if (Number(oferta.eliminada)) {
            tarjeta.remove();
            return;
        }
        if (!oferta.nombre) return;
        tarjeta.querySelector(".offer-item__label").textContent = oferta.nombre;
        const imagen = tarjeta.querySelector("img");
        imagen.src = `../${oferta.icono}`;
        imagen.alt = oferta.nombre;
        tarjeta.href = tieneHorario(oferta) ? tarjeta.dataset.pagina : EN_DESARROLLO;
    });
}

async function cargarOfertas() {
    try {
        const respuesta = await fetch("../backend/ofertas.php?accion=listar");
        const datos = await respuesta.json();
        if (!datos.exito) return;
        aplicarCambiosFijos(datos.fijas);
        grillaOfertas.append(...datos.nuevas.map(crearTarjetaOferta));
    } catch {
    }
}

if (grillaOfertas) cargarOfertas();
