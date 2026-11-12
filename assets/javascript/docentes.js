// Muestra la lista de docentes.
// Si el servidor no responde, queda la lista que ya trae la página.

const cuerpoTabla = document.querySelector(".docentes-tabla tbody");

function crearFila(docente) {
    const fila = document.createElement("tr");

    const nombre = document.createElement("td");
    nombre.className = "docentes-tabla__nombre notranslate";
    nombre.translate = false;
    nombre.textContent = docente.nom_docente;

    const asignatura = document.createElement("td");
    asignatura.textContent = docente.asignatura_docente;

    const turnos = document.createElement("td");
    turnos.className = "docentes-tabla__turno";
    turnos.textContent = docente.turnos_docente;

    fila.append(nombre, asignatura, turnos);
    return fila;
}

async function cargarDocentes() {
    try {
        const respuesta = await fetch("../backend/docentes.php?accion=listar");
        const datos = await respuesta.json();
        if (!datos.exito || !datos.docentes.length) return;
        cuerpoTabla.replaceChildren(...datos.docentes.map(crearFila));
    } catch {
    }
}

if (cuerpoTabla) cargarDocentes();
