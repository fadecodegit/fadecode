/**
 * PolideportivoInicio.js
 * Datos básicos en vivo + secciones de texto o de tabla que se
 * van agregando a la vista previa.
 */

vincularTexto("polidTitulo", "previewPolidTitulo");
vincularTexto("polidInauguracion", "previewPolidInauguracion", (valor) => `Inauguración: ${valor}`);
vincularTexto("polidCoordinador", "previewPolidCoordinador", (valor) => `Coordinador/a: ${valor}`);
vincularTexto("polidDireccion", "previewPolidDireccion", (valor) => `Dirección: ${valor}`);
vincularTexto("polidTelefono", "previewPolidTelefono", (valor) => `Teléfono: ${valor}`);

interruptor([
    ["polidBtnTexto", "polidBlockTexto"],
    ["polidBtnTabla", "polidBlockTabla"]
]);

// Encabezado de cada sección: subtítulo + botón para quitarla
function crearSeccion(subtitulo) {
    const seccion = crear("div", "admin-polid-section");
    const fila = crear("div", "admin-polid-section__row");
    const quitar = crear("button", "admin-polid-section__remove");
    fila.append(crear("h3", "admin-polid-section__subtitle", subtitulo), quitar);
    seccion.appendChild(fila);
    return { seccion, quitar };
}

// --- Sección de texto ---
porId("polidAddTextoBtn").addEventListener("click", () => {
    const subtitulo = porId("polidTextoSubtitulo").value.trim();
    if (!subtitulo) {
        porId("polidTextoSubtitulo").focus();
        return;
    }

    const { seccion, quitar } = crearSeccion(subtitulo);
    seccion.appendChild(crear("p", "admin-polid-section__text", porId("polidTextoTexto").value.trim()));
    agregarALista("previewPolidSections", "previewPolidEmpty", seccion, quitar);

    limpiarCampos("polidTextoSubtitulo", "polidTextoTexto");
});

// --- Sección de tabla: primero se juntan las filas y después se agrega la tabla ---
let filasPendientes = [];

function mostrarFilasPendientes() {
    const lista = porId("polidPendingRows");
    lista.replaceChildren();

    filasPendientes.forEach((fila, indice) => {
        const item = crear("li", "admin-polid-pending-row");
        const quitar = crear("button", "", "×");
        quitar.type = "button";
        quitar.setAttribute("aria-label", "Quitar fila");
        quitar.addEventListener("click", () => {
            filasPendientes.splice(indice, 1);
            mostrarFilasPendientes();
        });
        item.append(crear("span", "", `${fila[0]} — ${fila[1]}`), quitar);
        lista.appendChild(item);
    });
}

porId("polidAddFilaBtn").addEventListener("click", () => {
    const valor1 = porId("polidFilaValor1").value.trim();
    const valor2 = porId("polidFilaValor2").value.trim();
    if (!valor1 && !valor2) {
        porId("polidFilaValor1").focus();
        return;
    }

    filasPendientes.push([valor1, valor2]);
    mostrarFilasPendientes();
    limpiarCampos("polidFilaValor1", "polidFilaValor2");
});

porId("polidAddTablaBtn").addEventListener("click", () => {
    const subtitulo = porId("polidTablaSubtitulo").value.trim();
    if (!subtitulo) {
        porId("polidTablaSubtitulo").focus();
        return;
    }

    const tabla = crear("table", "admin-polid-table");
    const encabezado = tabla.createTHead().insertRow();
    [porId("polidTablaCol1").value.trim(), porId("polidTablaCol2").value.trim()].forEach((columna) => {
        encabezado.appendChild(crear("th", "", columna));
    });

    const cuerpo = tabla.createTBody();
    filasPendientes.forEach((fila) => {
        const filaTabla = cuerpo.insertRow();
        fila.forEach((valor) => {
            filaTabla.insertCell().textContent = valor;
        });
    });

    const { seccion, quitar } = crearSeccion(subtitulo);
    seccion.appendChild(tabla);
    agregarALista("previewPolidSections", "previewPolidEmpty", seccion, quitar);

    limpiarCampos("polidTablaSubtitulo", "polidTablaCol1", "polidTablaCol2", "polidFilaValor1", "polidFilaValor2");
    filasPendientes = [];
    mostrarFilasPendientes();
});

// "Limpiar" también descarta las filas que no se llegaron a agregar
alLimpiar(porId("formPolideportivo"), () => {
    filasPendientes = [];
    mostrarFilasPendientes();
});
