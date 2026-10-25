/**
 * CrearEvento.js
 * Vista previa en vivo de la tarjeta del evento.
 */

vincularTexto("eventoFecha", "previewEventoDate");
vincularTexto("eventoDescripcion", "previewEventoDescription");

// El color elegido pinta el recuadro de la fecha
const campoColor = porId("eventoColor");
const pintarFecha = () => {
    porId("previewEventoDate").style.backgroundColor = campoColor.value;
};
campoColor.addEventListener("input", pintarFecha);
alLimpiar(campoColor.form, pintarFecha);
