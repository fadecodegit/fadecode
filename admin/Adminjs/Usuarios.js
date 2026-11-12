// Pantalla de Usuarios: tablas de estudiantes y administradores.
// Se puede buscar, cambiar el nivel de un usuario y eliminarlo.

const urlUsuarios = "../backend/usuarios.php";

// Pide datos al servidor; si algo sale mal, muestra el motivo
async function pedirUsuarios(url, opciones = {}) {
    let datos;
    try {
        const respuesta = await fetch(url, opciones);
        datos = await respuesta.json();
    } catch {
        throw new Error("No se pudo conectar con el servidor. Revisá que Apache y MySQL estén encendidos.");
    }
    if (!datos.exito) {
        throw new Error(datos.mensaje || "No se pudo completar la operación.");
    }
    return datos;
}

function crearBoton(texto, clase, accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = `admin-btn ${clase}`;
    boton.textContent = texto;
    boton.addEventListener("click", accion);
    return boton;
}

function crearFila(usuario, valores) {
    const fila = document.createElement("tr");
    valores.forEach((valor) => {
        const celda = document.createElement("td");
        celda.textContent = valor ?? "—";
        fila.append(celda);
    });

    const acciones = document.createElement("td");
    const contenedor = document.createElement("div");
    contenedor.className = "admin-users-actions";
    contenedor.append(
        crearBoton("Editar", "admin-btn--secondary", () => editarUsuario(usuario)),
        crearBoton("Eliminar", "admin-btn--danger", () => eliminarUsuario(usuario))
    );
    acciones.append(contenedor);
    fila.append(acciones);
    return fila;
}

function llenarTabla(idTbody, idVacio, filas) {
    document.getElementById(idTbody).replaceChildren(...filas);
    document.getElementById(idVacio).hidden = filas.length > 0;
}

function mostrarErrorUsuarios(texto) {
    document.querySelectorAll("[data-users-error]").forEach((aviso) => {
        aviso.textContent = texto;
        aviso.hidden = false;
    });
}

async function cargarUsuarios() {
    let datos;
    try {
        datos = await pedirUsuarios(`${urlUsuarios}?accion=listar`);
    } catch (error) {
        mostrarErrorUsuarios(error.message);
        return;
    }

    // 1 = Administrador, 2 = Alumno
    const alumnos = datos.usuarios.filter((usuario) => Number(usuario.id_nivel) === 2);
    const admins = datos.usuarios.filter((usuario) => Number(usuario.id_nivel) === 1);

    llenarTabla("tbodyEstudiantes", "estudiantesEmpty", alumnos.map((u) =>
        crearFila(u, [u.id_usuario, u.cedula, u.nom_usuario, u.email, u.pais, u.fecha_registro, u.curso_actual])
    ));
    llenarTabla("tbodyAdmins", "adminsEmpty", admins.map((u) =>
        crearFila(u, [u.id_usuario, u.cedula, u.nom_usuario, u.email, u.pais, u.fecha_registro, u.cargo])
    ));
    filtrarUsuarios();
}

// Envía un cambio y vuelve a cargar las tablas
async function enviarAccion(campos) {
    const formulario = new FormData();
    Object.entries(campos).forEach(([clave, valor]) => formulario.set(clave, valor));
    try {
        const respuesta = await pedirUsuarios(urlUsuarios, { method: "POST", body: formulario });
        await cargarUsuarios();
        return respuesta.mensaje;
    } catch (error) {
        alert(error.message);
        return null;
    }
}

// Ventana "Editar": se completa con los datos de la fila
const modalEditar = document.getElementById("modalEditarUsuario");
const formEditar = document.getElementById("formEditarUsuario");
const errorEditar = document.getElementById("modalEditarError");
let usuarioEditado = null;

function mostrarErrorEditar(texto) {
    errorEditar.textContent = texto;
    errorEditar.hidden = !texto;
}

function editarUsuario(usuario) {
    usuarioEditado = usuario;
    document.getElementById("modalEditarSubtitulo").textContent = `ID ${usuario.id_usuario} · Cédula ${usuario.cedula}`;
    formEditar.nombre.value = usuario.nom_usuario ?? "";
    formEditar.email.value = usuario.email ?? "";
    formEditar.pais.value = usuario.pais ?? "";
    formEditar.id_nivel.value = String(usuario.id_nivel);
    // Los datos del adulto responsable solo aparecen si la cuenta tiene uno
    document.getElementById("editarResponsable").hidden = !usuario.nombre_adulto;
    formEditar.adulto_nombre.value = usuario.nombre_adulto ?? "";
    formEditar.adulto_telefono.value = usuario.telefono_adulto ?? "";
    mostrarErrorEditar("");
    modalEditar.showModal();
}

formEditar.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const campos = {
        nombre: formEditar.nombre.value.trim(),
        email: formEditar.email.value.trim(),
        pais: formEditar.pais.value.trim()
    };

    // Revisa los datos antes de guardar
    if (!campos.nombre || !campos.email || !campos.pais) {
        mostrarErrorEditar("Completá nombre, correo y país.");
        return;
    }
    if (!formEditar.email.checkValidity()) {
        mostrarErrorEditar("Ingresá un correo electrónico válido.");
        return;
    }
    if (usuarioEditado.nombre_adulto) {
        campos.adulto_nombre = formEditar.adulto_nombre.value.trim();
        campos.adulto_telefono = formEditar.adulto_telefono.value.trim();
        if (!campos.adulto_nombre || !campos.adulto_telefono) {
            mostrarErrorEditar("Completá el nombre y el teléfono del responsable.");
            return;
        }
    }

    // Pasar a alguien a Administrador pide confirmación
    let nivel = formEditar.id_nivel.value;
    const nivelAnterior = String(usuarioEditado.id_nivel);
    if (nivel === "1" && nivelAnterior !== "1" && !(await confirmarAdministrador(campos.nombre))) {
        nivel = nivelAnterior;
    }

    modalEditar.close();
    const guardado = await enviarAccion({
        accion: "actualizar",
        id: usuarioEditado.id_usuario,
        ...campos,
        id_nivel: nivel
    });
    if (guardado) {
        modalGuardado.showModal();
    }
});

// Pregunta "¿Seguro?" y espera la respuesta
const modalConfirmar = document.getElementById("modalConfirmarAdmin");
const modalGuardado = document.getElementById("modalCambiosGuardados");

function confirmarAdministrador(nombre) {
    document.getElementById("modalConfirmarTexto").textContent =
        `¿Seguro que querés asignar el rol Administrador a ${nombre}?`;
    modalConfirmar.returnValue = "";
    modalConfirmar.showModal();
    return new Promise((resolver) => {
        modalConfirmar.addEventListener("close", () => resolver(modalConfirmar.returnValue === "si"), { once: true });
    });
}

[modalConfirmar, modalGuardado].forEach((modal) => {
    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) modal.close();
    });
});

document.getElementById("modalEditarCancelar").addEventListener("click", () => modalEditar.close());

// Tocar afuera de la ventana la cierra
modalEditar.addEventListener("click", (evento) => {
    if (evento.target === modalEditar) modalEditar.close();
});

async function eliminarUsuario(usuario) {
    if (!confirm(`¿Eliminar al usuario ${usuario.nom_usuario}, ID ${usuario.id_usuario}? Esta acción no se puede deshacer.`)) return;
    const mensaje = await enviarAccion({ accion: "eliminar", id: usuario.id_usuario });
    if (mensaje) alert(mensaje);
}

// Buscador: oculta las filas que no coinciden
function filtrarUsuarios() {
    const buscado = document.getElementById("usuariosSearch").value.trim().toLowerCase();
    document.querySelectorAll(".admin-users-table tbody tr").forEach((fila) => {
        fila.classList.toggle("is-hidden", !fila.textContent.toLowerCase().includes(buscado));
    });
}

cargarUsuarios();

const pestanas = document.querySelectorAll("[data-users-tab]");

pestanas.forEach((pestana) => {
    pestana.addEventListener("click", () => {
        pestanas.forEach((otra) => {
            const activa = otra === pestana;
            otra.classList.toggle("is-active", activa);
            otra.setAttribute("aria-selected", String(activa));
            document.getElementById(otra.getAttribute("aria-controls")).hidden = !activa;
        });
    });
});

document.getElementById("usuariosSearch").addEventListener("input", filtrarUsuarios);
