<?php
/**
 * login.php
 * -----------------------------------------------------------
 * Recibe los datos del formulario de Login-in.html (cedula,
 * password), valida, autentica contra la tabla Usuarios y
 * guarda un registro en Historiales.
 * -----------------------------------------------------------
 */

session_start();
require_once __DIR__ . "/clases/Usuario.php";
require_once __DIR__ . "/validaciones.php";

header("Content-Type: application/json");

$cedula = trim($_POST["cedula"] ?? "");
$password = trim($_POST["password"] ?? "");

if (!validarCedula($cedula)) {
    enviarError("cedula_invalida", "La cédula ingresada no es válida.");
}
if ($password === "") {
    enviarError("password_vacia", "Debe ingresar una contraseña.");
}

$usuario = Usuario::autenticar($cedula, $password);

if (!$usuario) {
    // No decimos si falló la cédula o la contraseña, por seguridad
    enviarError("credenciales_incorrectas", "La cédula o la contraseña son incorrectas.");
}

// Guardamos los datos básicos en la sesión
$_SESSION["id_usuario"] = $usuario["id_usuario"];
$_SESSION["nom_usuario"] = $usuario["nom_usuario"];
$_SESSION["id_nivel"] = (int) $usuario["id_nivel"];

// Guardado de progreso: dejamos constancia del ingreso en Historiales
$pdo = Conexion::obtenerConexion();
$pdo->prepare("INSERT INTO Historiales (descrip_historial, id_usuario) VALUES (:descripcion, :idUsuario)")
    ->execute([
        ":descripcion" => "Inicio de sesión en el sistema",
        ":idUsuario" => $usuario["id_usuario"]
    ]);

enviarExito([
    "mensaje" => "Bienvenido/a " . $usuario["nom_usuario"],
    "id_nivel" => (int) $usuario["id_nivel"]
]);
