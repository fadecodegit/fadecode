<?php
/**
 * registro.php
 * Recibe los datos del formulario de Registrarse.html.
 * Todo registro nuevo se crea como Alumno 
 *
 * Usa fecha_nacimiento (ya existe en el formulario) para calcular
 * si es menor de edad, y el checkbox de "terminos" (también ya
 * existe) como la autorización/consentimiento que pide la base
 * de datos para menores (ver clases/Alumno.php).
 */

require_once __DIR__ . "/clases/Alumno.php";
require_once __DIR__ . "/validaciones.php";

header("Content-Type: application/json");

$nombre = trim($_POST["nombre"] ?? "");
$apellido = trim($_POST["apellido"] ?? "");
$cedula = trim($_POST["cedula"] ?? "");
$correo = trim($_POST["correo"] ?? "");
$password = trim($_POST["password"] ?? "");
$confirmarPassword = trim($_POST["confirmar_password"] ?? "");
$fechaNacimiento = trim($_POST["fecha_nacimiento"] ?? "");
$terminosAceptados = isset($_POST["terminos"]); // el checkbox solo llega si está tildado

if (!validarNombre($nombre) || !validarNombre($apellido)) {
    enviarError("nombre_invalido", "El nombre y el apellido solo pueden contener letras.");
}
if (!validarCedula($cedula)) {
    enviarError("cedula_invalida", "La cédula ingresada no es válida.");
}
if (!validarEmail($correo)) {
    enviarError("email_invalido", "El correo electrónico no tiene un formato válido.");
}
if (!validarPassword($password)) {
    enviarError("password_invalida", "La contraseña debe tener al menos 6 caracteres y un número.");
}
if ($password !== $confirmarPassword) {
    enviarError("password_no_coincide", "Las contraseñas ingresadas no coinciden.");
}
if (!validarFecha($fechaNacimiento)) {
    enviarError("fecha_invalida", "La fecha de nacimiento no es válida.");
}
if (!$terminosAceptados) {
    enviarError("terminos_no_aceptados", "Debés aceptar los Términos y Condiciones para registrarte.");
}

// Primera letra en mayúscula, resto en minúscula
$nombreCompleto = ucfirst(strtolower($nombre)) . " " . ucfirst(strtolower($apellido));

$edad = calcularEdad($fechaNacimiento);
$esMenor = $edad < 18;

$alumno = new Alumno(
    $cedula,
    $nombreCompleto,
    $correo,
    $password,
    "Uruguay",
    "Sin asignar",
    $esMenor,
    $terminosAceptados
);

if (!$alumno->registrar()) {
    // Mensaje real de la clase: puede ser cédula/correo repetidos,
    // o falta de autorización si es menor de edad.
    enviarError("registro_fallido", $alumno->getUltimoError() ?: "No se pudo completar el registro.");
}

enviarExito(["mensaje" => "Cuenta creada correctamente. Ya podés iniciar sesión."]);
