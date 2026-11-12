// Formulario de Interés: arma la lista de cursos con las ofertas que tienen horario,
// incluidas las que se suben desde el panel.
// Si el servidor no responde, queda la lista que ya trae la página.

const selectorCurso = document.getElementById("pre-curso");

async function cargarCursos() {
    try {
        const respuesta = await fetch("../backend/cursos-disponibles.php");
        const datos = await respuesta.json();
        if (!datos.exito || !datos.cursos.length) return;

        const elegido = selectorCurso.value;
        const opciones = datos.cursos.map((curso) => {
            const opcion = document.createElement("option");
            opcion.value = curso.valor;
            opcion.textContent = curso.nombre;
            return opcion;
        });
        // La primera opción, "Seleccioná un curso", se mantiene
        selectorCurso.replaceChildren(selectorCurso.options[0], ...opciones);
        if (datos.cursos.some((curso) => curso.valor === elegido)) selectorCurso.value = elegido;
    } catch {
    }
}

if (selectorCurso) cargarCursos();
