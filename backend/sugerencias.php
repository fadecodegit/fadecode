<?php
/**
 * sugerencias.php
 * -----------------------------------------------------------
 * Endpoint que recibe el formulario de Sugerencias.html
 * (cualquier visitante o alumno puede enviar una) y, aparte,
 * permite que el administrador liste las sugerencias recibidas.
 * -----------------------------------------------------------
 */

session_start();
require_once __DIR__ . "/clases/Sugerencia.php";
require_once __DIR__ . "/validaciones.php";

header("Content-Type: application/json");

$sugerencia = new Sugerencia();
$accion = $_POST["accion"] ?? "crear";

if ($accion === "listar") {
    if (!isset($_SESSION["id_nivel"]) || $_SESSION["id_nivel"] !== 1) {
        enviarError("sin_permiso", "No tenés permisos para ver las sugerencias.");
    }
    enviarExito(["sugerencias" => $sugerencia->listar()]);
    exit;
}

// Enviar una sugerencia nueva
$contenido = trim($_POST["sugerencia"] ?? "");
if (!validarTexto($contenido, 200)) {
    enviarError("sugerencia_invalida", "La sugerencia no puede estar vacía y debe tener hasta 200 caracteres.");
}

// Si hay sesión iniciada guardamos quién la mandó; si no, queda anónima
$idUsuario = $_SESSION["id_usuario"] ?? null;

$creado = $sugerencia->crear([
    "contenido" => $contenido,
    "id_usuario" => $idUsuario
]);

if (!$creado) {
    enviarError("error_insertar_sugerencia", "Ocurrió un error al guardar la sugerencia.");
}

enviarExito(["mensaje" => "¡Gracias! Tu sugerencia fue enviada."]);
