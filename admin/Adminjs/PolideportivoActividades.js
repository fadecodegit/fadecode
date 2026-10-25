/**
 * PolideportivoActividades.js
 * Texto de introducción en vivo + tarjetas de actividades que se
 * van agregando a la vista previa. "Subir todo" lo conecta backend.
 */

vincularTexto("actividadesIntro", "previewActividadesIntro");
vincularImagen("actividadImagen", "actividadImagenThumb");

porId("actividadAddBtn").addEventListener("click", () => {
    const nombre = porId("actividadNombre").value.trim();
    if (!nombre) {
        porId("actividadNombre").focus();
        return;
    }

    const campoImagen = porId("actividadImagen");
    const tarjeta = crear("article", "admin-actividad-item");
    const quitar = crear("button", "admin-actividad-item__remove");
    tarjeta.appendChild(quitar);

    if (campoImagen.files[0]) {
        const contenedorImagen = crear("div", "admin-actividad-item__image");
        contenedorImagen.appendChild(crearImagen(campoImagen));
        tarjeta.appendChild(contenedorImagen);
    }

    const cuerpo = crear("div", "admin-actividad-item__body");
    cuerpo.appendChild(crear("h3", "admin-actividad-item__title", nombre));

    const fechas = porId("actividadFechas").value.trim();
    if (fechas) {
        cuerpo.appendChild(crear("span", "admin-actividad-item__schedule", fechas));
    }
    cuerpo.appendChild(crear("p", "admin-actividad-item__text", porId("actividadDescripcion").value.trim()));

    tarjeta.appendChild(cuerpo);
    agregarALista("previewActividadesGrid", "previewActividadesEmpty", tarjeta, quitar);

    limpiarCampos("actividadImagen", "actividadNombre", "actividadFechas", "actividadDescripcion");
});
