/**
 * OfertasEducativas.js
 * Arma la grilla de ícono + texto en la vista previa.
 */

vincularImagen("ofertaIcono", "ofertaIconoThumb");

porId("ofertaAddBtn").addEventListener("click", () => {
    const campoIcono = porId("ofertaIcono");
    const nombre = porId("ofertaNombre").value.trim();
    if (!campoIcono.files[0]) {
        campoIcono.focus();
        return;
    }
    if (!nombre) {
        porId("ofertaNombre").focus();
        return;
    }

    const tarjeta = crear("div", "admin-oferta-item");
    const icono = crear("div", "admin-oferta-item__icon");
    const quitar = crear("button", "admin-oferta-item__remove");
    icono.append(crearImagen(campoIcono), quitar);

    tarjeta.append(icono, crear("span", "admin-oferta-item__label", nombre));
    agregarALista("previewOfertasGrid", "previewOfertasEmpty", tarjeta, quitar);

    limpiarCampos("ofertaIcono", "ofertaNombre");
});
