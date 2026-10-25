/**
 * Laboratorio.js
 * Arma la galería de imagen + texto explicativo en la vista previa.
 * "Subir todo" lo conecta backend.
 */

vincularImagen("labImagen", "labThumb");

porId("labAddBtn").addEventListener("click", () => {
    const campoImagen = porId("labImagen");
    if (!campoImagen.files[0]) {
        campoImagen.focus();
        return;
    }

    const tarjeta = crear("article", "admin-lab-item");
    const quitar = crear("button", "admin-lab-item__remove");
    const contenedorImagen = crear("div", "admin-lab-item__image");
    contenedorImagen.appendChild(crearImagen(campoImagen));

    tarjeta.append(quitar, contenedorImagen, crear("p", "admin-lab-item__text", porId("labTexto").value.trim()));
    agregarALista("labGallery", "labGalleryEmpty", tarjeta, quitar);

    limpiarCampos("labImagen", "labTexto");
});
