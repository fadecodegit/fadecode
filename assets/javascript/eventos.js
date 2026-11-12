// Eventos: muestra primero los cargados desde el panel, cada uno en el lugar
// de una tarjeta vacía. Los eventos de la página que se editaron o eliminaron
// desde el panel se muestran con ese cambio.
// Si el servidor no responde, queda lo que trae la página.

const grillaEventos = document.querySelector(".events-grid");

function crearTarjeta(evento) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "event-item";

    const fecha = document.createElement("div");
    fecha.className = "event-item__date";
    fecha.textContent = evento.fecha_texto;
    fecha.style.backgroundColor = evento.color_evento;

    const descripcion = document.createElement("p");
    descripcion.className = "event-item__description";
    descripcion.textContent = evento.descripcion;

    tarjeta.append(fecha, descripcion);
    return tarjeta;
}

function crearTarjetaVacia() {
    const tarjeta = crearTarjeta({ fecha_texto: "Fecha", descripcion: "Descripcion", color_evento: "" });
    tarjeta.classList.add("event-item--empty");
    return tarjeta;
}

function quitarFijos(claves) {
    claves.forEach((clave) => {
        const tarjeta = grillaEventos.querySelector(`[data-evento-fijo="${clave}"]`);
        if (!tarjeta) return;
        tarjeta.remove();
        grillaEventos.append(crearTarjetaVacia());
    });
}

// Los eventos que ya trae la página y se editaron desde el panel
function editarFijos(cambios) {
    cambios.forEach((cambio) => {
        const tarjeta = grillaEventos.querySelector(`[data-evento-fijo="${cambio.clave_evento}"]`);
        if (!tarjeta) return;
        const fecha = tarjeta.querySelector(".event-item__date");
        fecha.textContent = cambio.fecha_texto;
        fecha.style.backgroundColor = cambio.color_evento;
        tarjeta.querySelector(".event-item__description").textContent = cambio.descripcion;
    });
}

async function cargarEventos() {
    try {
        const respuesta = await fetch("../backend/eventos.php?accion=listar");
        const datos = await respuesta.json();
        if (!datos.exito) return;

        editarFijos(datos.fijos_editados || []);
        quitarFijos(datos.fijos_borrados);
        grillaEventos.prepend(...datos.eventos.map(crearTarjeta));
        const vacias = [...grillaEventos.querySelectorAll(".event-item--empty")];
        vacias.slice(0, datos.eventos.length).forEach((tarjeta) => tarjeta.remove());
    } catch {
    }
}

if (grillaEventos) cargarEventos();
