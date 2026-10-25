/**
 * CrearNormativa.js
 * Encabezado en vivo + bloques de imagen o de texto que se van
 * agregando a la vista previa.
 */

vincularTexto("normativaTitulo", "previewNormativaTitulo");
vincularTexto("normativaTextoIntro", "previewNormativaIntro");
vincularImagen("normImagenArchivo", "normImagenThumb");

const bloqueActivo = interruptor([
    ["normBtnImagen", "normBlockImagen"],
    ["normBtnTexto", "normBlockTexto"]
]);

function agregarBloqueImagen() {
    const campoImagen = porId("normImagenArchivo");
    if (!campoImagen.files[0]) {
        campoImagen.focus();
        return;
    }

    const bloque = crear("div", "admin-normativa-block admin-normativa-block--imagen");
    const quitar = crear("button", "admin-normativa-block__remove");
    const contenedorImagen = crear("div", "admin-normativa-block__image");
    contenedorImagen.appendChild(crearImagen(campoImagen));

    const cuerpo = crear("div", "admin-normativa-block__body");
    cuerpo.append(
        crear("h3", "admin-normativa-block__subtitle", porId("normImagenSubtitulo").value.trim()),
        crear("p", "admin-normativa-block__text", porId("normImagenTexto").value.trim())
    );

    bloque.append(quitar, contenedorImagen, cuerpo);
    agregarALista("previewNormativaBlocks", "previewNormativaEmpty", bloque, quitar);
    limpiarCampos("normImagenArchivo", "normImagenSubtitulo", "normImagenTexto");
}

function agregarBloqueTexto() {
    const subtitulo = porId("normTextoSubtitulo").value.trim();
    const texto = porId("normTextoTexto").value.trim();
    if (!subtitulo && !texto) {
        porId("normTextoSubtitulo").focus();
        return;
    }

    const bloque = crear("div", "admin-normativa-block admin-normativa-block--texto");
    const quitar = crear("button", "admin-normativa-block__remove");
    bloque.append(
        quitar,
        crear("h3", "admin-normativa-block__subtitle", subtitulo),
        crear("p", "admin-normativa-block__text", texto)
    );

    agregarALista("previewNormativaBlocks", "previewNormativaEmpty", bloque, quitar);
    limpiarCampos("normTextoSubtitulo", "normTextoTexto");
}

porId("normAddBlockBtn").addEventListener("click", () => {
    if (bloqueActivo() === 0) {
        agregarBloqueImagen();
    } else {
        agregarBloqueTexto();
    }
});
