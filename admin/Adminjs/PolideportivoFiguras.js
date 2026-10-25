/**
 * PolideportivoFiguras.js
 * Arma las tarjetas de figuras importantes en la vista previa.
 * "Subir todo" lo conecta backend.
 */

vincularImagen("figuraFoto", "figuraFotoThumb");

porId("figuraAddBtn").addEventListener("click", () => {
    const nombre = porId("figuraNombre").value.trim();
    if (!nombre) {
        porId("figuraNombre").focus();
        return;
    }

    const campoFoto = porId("figuraFoto");
    const tarjeta = crear("article", "admin-figura-item");
    const quitar = crear("button", "admin-figura-item__remove");
    const foto = crear("div", "admin-figura-item__photo");
    if (campoFoto.files[0]) {
        foto.appendChild(crearImagen(campoFoto));
    }

    tarjeta.append(
        quitar,
        foto,
        crear("h3", "admin-figura-item__name", nombre),
        crear("p", "admin-figura-item__cargo", porId("figuraCargo").value.trim())
    );

    const telefono = porId("figuraTelefono").value.trim();
    if (telefono) {
        tarjeta.appendChild(crear("div", "admin-figura-item__contacto", `Contacto: ${telefono}`));
    }

    agregarALista("previewFigurasGrid", "previewFigurasEmpty", tarjeta, quitar);
    limpiarCampos("figuraFoto", "figuraNombre", "figuraCargo", "figuraTelefono");
});
