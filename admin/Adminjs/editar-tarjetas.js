// Botón Editar de Noticias y Logros: lista las tarjetas subidas desde el panel
// y las que ya estaban en la página.
// Las subidas se editan o se eliminan; las que ya estaban se editan y se restauran.

const ISOTIPO = "../Recursos UTU/Isotipo-UTU-Color-Dorado-PNG.png";

function iniciarEdicionTarjetas({ boton, modal, modalConfirmar, modalCambios, direccion, paginaPublica, clave, nombre, normalizar }) {
    const buscar = (selector) => modal.querySelector(selector);
    const vistaLista = buscar("[data-vista-lista]");
    const lista = buscar("[data-lista]");
    const aviso = buscar("[data-aviso]");
    const form = buscar("[data-form]");
    const error = buscar("[data-error]");
    const miniatura = buscar("[data-miniatura]");
    const textoConfirmar = modalConfirmar.querySelector(".modal-exito__texto");
    const textoCambios = modalCambios.querySelector(".modal-exito__texto");
    let editando = null;
    let pendiente = null;

    function mostrarLista() {
        form.hidden = true;
        vistaLista.hidden = false;
    }

    function avisar(texto) {
        aviso.textContent = texto;
        aviso.hidden = !texto;
    }

    // Envía un cambio al servidor y devuelve la respuesta
    async function enviar(accion, datos) {
        datos.append("accion", accion);
        const respuesta = await fetch(direccion, { method: "POST", body: datos });
        return respuesta.json();
    }

    // Las tarjetas que ya trae la página pública, con sus cambios
    async function leerFijas(cambios) {
        const respuesta = await fetch(paginaPublica);
        const pagina = new DOMParser().parseFromString(await respuesta.text(), "text/html");
        const texto = (tarjeta, selector) => tarjeta.querySelector(selector).textContent.trim();

        return [...pagina.querySelectorAll("[data-fijo]")].map((tarjeta) => {
            const cambio = cambios.find((fila) => fila.clave === tarjeta.dataset.fijo);
            return {
                clave: tarjeta.dataset.fijo,
                editada: Boolean(cambio),
                fecha: cambio ? cambio.fecha_texto : texto(tarjeta, ".news-item__date"),
                titulo: cambio ? cambio.titulo : texto(tarjeta, ".news-item__title"),
                texto: cambio ? cambio.texto : texto(tarjeta, ".news-item__summary"),
                imagen: cambio && cambio.imagen ? `../${cambio.imagen}` : tarjeta.querySelector("img").getAttribute("src")
            };
        });
    }

    function confirmar(texto, accion) {
        pendiente = accion;
        textoConfirmar.textContent = texto;
        modalConfirmar.returnValue = "";
        modalConfirmar.showModal();
    }

    function crearFila(tarjeta) {
        const fila = crear("li", "admin-edicion__item");

        const imagen = crear("img", "admin-edicion__imagen");
        imagen.alt = "";
        imagen.src = tarjeta.imagen || ISOTIPO;

        const etiqueta = tarjeta.clave && tarjeta.editada ? " · Editada" : "";
        const datos = crear("div", "admin-edicion__datos");
        datos.append(
            crear("span", "admin-edicion__fecha", tarjeta.fecha + etiqueta),
            crear("p", "admin-edicion__titulo", tarjeta.titulo)
        );

        const acciones = crear("div", "admin-edicion__acciones");
        const botonEditar = crear("button", "admin-btn admin-btn--secondary", "Editar");
        botonEditar.type = "button";
        botonEditar.addEventListener("click", () => abrirEdicion(tarjeta));
        acciones.append(botonEditar);

        if (!tarjeta.clave) {
            const botonEliminar = crear("button", "admin-btn admin-btn--primary", "Eliminar");
            botonEliminar.type = "button";
            botonEliminar.addEventListener("click", () => confirmar(
                `¿Seguro que querés eliminar ${nombre}? No se puede deshacer.`,
                { accion: "eliminar", campo: "id", valor: tarjeta.id, aviso: `Se eliminó ${nombre} correctamente` }
            ));
            acciones.append(botonEliminar);
        } else if (tarjeta.editada) {
            const botonRestaurar = crear("button", "admin-btn admin-btn--primary", "Restaurar");
            botonRestaurar.type = "button";
            botonRestaurar.addEventListener("click", () => confirmar(
                "¿Querés volver a mostrarla como era originalmente? Se pierden los cambios.",
                { accion: "restaurar_fijo", campo: "clave", valor: tarjeta.clave, aviso: "Se restauró la tarjeta original" }
            ));
            acciones.append(botonRestaurar);
        }

        fila.append(imagen, datos, acciones);
        return fila;
    }

    async function cargar() {
        lista.replaceChildren();
        avisar("Cargando...");

        try {
            const respuesta = await fetch(`${direccion}?accion=listar`);
            const datos = await respuesta.json();
            if (!datos.exito) {
                avisar(datos.mensaje || "No se pudo cargar la lista.");
                return;
            }
            const tarjetas = [...datos[clave].map(normalizar), ...await leerFijas(datos.fijos || [])];
            avisar(tarjetas.length ? "" : "No hay nada para mostrar.");
            lista.replaceChildren(...tarjetas.map(crearFila));
        } catch {
            avisar("No se pudo conectar con el servidor.");
        }
    }

    function abrirEdicion(tarjeta) {
        editando = tarjeta;
        form.reset();
        error.hidden = true;
        form.elements.id.value = tarjeta.id || "";
        form.elements.clave.value = tarjeta.clave || "";
        form.elements.fecha.value = tarjeta.fecha;
        form.elements.titulo.value = tarjeta.titulo;
        form.elements.texto.value = tarjeta.texto;
        ponerImagen(miniatura, tarjeta.imagen || null);
        vistaLista.hidden = true;
        form.hidden = false;
    }

    function avisarCambio(texto) {
        textoCambios.textContent = texto;
        modalCambios.showModal();
        mostrarLista();
        cargar();
    }

    boton.addEventListener("click", () => {
        mostrarLista();
        modal.showModal();
        cargar();
    });

    buscar("[data-cerrar]").addEventListener("click", () => modal.close());
    buscar("[data-volver]").addEventListener("click", mostrarLista);

    form.elements.imagen.addEventListener("change", () => {
        const url = urlImagen(form.elements.imagen);
        if (url) ponerImagen(miniatura, url);
    });

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        error.hidden = true;
        const botonGuardar = form.querySelector('button[type="submit"]');
        botonGuardar.disabled = true;

        try {
            const resultado = await enviar(editando.clave ? "editar_fijo" : "editar", new FormData(form));
            if (resultado.exito) {
                avisarCambio("Se guardaron los cambios correctamente");
            } else {
                error.textContent = resultado.mensaje || "No se pudo guardar el cambio.";
                error.hidden = false;
            }
        } catch {
            error.textContent = "No se pudo conectar con el servidor. Los cambios no se guardaron.";
            error.hidden = false;
        } finally {
            botonGuardar.disabled = false;
        }
    });

    // Si confirmó, elimina o restaura lo elegido
    modalConfirmar.addEventListener("close", async () => {
        if (modalConfirmar.returnValue !== "si" || !pendiente) return;

        const datos = new FormData();
        datos.append(pendiente.campo, pendiente.valor);
        try {
            const resultado = await enviar(pendiente.accion, datos);
            if (resultado.exito) {
                avisarCambio(pendiente.aviso);
            } else {
                avisar(resultado.mensaje || "No se pudo completar el cambio.");
            }
        } catch {
            avisar("No se pudo conectar con el servidor. No se cambió nada.");
        }
    });

    [modal, modalConfirmar, modalCambios].forEach((dialogo) => {
        dialogo.addEventListener("click", (evento) => {
            if (evento.target === dialogo) dialogo.close();
        });
    });
}
