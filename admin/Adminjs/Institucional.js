/**
 * Institucional.js
 * Portada en vivo (imagen + título + bienvenida) y secciones de
 * subtítulo/texto que se van agregando a la vista previa.
 */

vincularImagen("instImagen", "instImagenThumb", "previewInstImageWrap", "previewInstImage");
vincularTexto("instHeroTitulo", "previewInstHeroTitulo");
vincularTexto("instHeroTexto", "previewInstHeroTexto");

porId("instAddBtn").addEventListener("click", () => {
    const subtitulo = porId("instSubtitulo").value.trim();
    const texto = porId("instTexto").value.trim();
    if (!subtitulo) {
        porId("instSubtitulo").focus();
        return;
    }

    const seccion = crear("div");
    const fila = crear("div", "admin-preview-institucional__section-row");
    const quitar = crear("button", "admin-preview-institucional__remove");
    fila.append(crear("h3", "admin-preview-institucional__subtitle", subtitulo), quitar);

    seccion.append(fila, crear("p", "admin-preview-institucional__text", texto));
    agregarALista("previewInstSections", "previewInstEmpty", seccion, quitar);

    limpiarCampos("instSubtitulo", "instTexto");
});
