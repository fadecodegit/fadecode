// Si la fecha de nacimiento indica menos de 18 años, aparecen los datos
// del adulto responsable y se bloquea el correo del alumno.

const fechaNacimiento = document.getElementById("reg-fecha-nacimiento");
const correo = document.getElementById("reg-correo");
const datosAdulto = document.getElementById("reg-adulto");

function revisarEdad() {
    let esMenor = false;

    if (fechaNacimiento.value) {
        const nacimiento = new Date(fechaNacimiento.value + "T00:00");
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();

        // Si todavía no cumplió años este año, tiene uno menos
        const yaCumplio = hoy.getMonth() > nacimiento.getMonth() ||
            (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
        if (!yaCumplio) {
            edad--;
        }

        esMenor = edad < 18;
    }

    datosAdulto.hidden = !esMenor;
    correo.disabled = esMenor;
    if (esMenor) {
        correo.value = "";
    }
}

fechaNacimiento.addEventListener("change", revisarEdad);

// El botón "Limpiar" borra la fecha: se vuelve a revisar después de limpiar
fechaNacimiento.form.addEventListener("reset", () => setTimeout(revisarEdad));
