<?php
/**
 * noticias.php
 * -----------------------------------------------------------
 * Endpoint que recibe las acciones del panel de administración
 * (admin/panel.html -> formNoticia): crear, listar, editar,
 * eliminar. Solo un Administrador (id_nivel = 1) puede usarlo.
 * -----------------------------------------------------------
 */

session_start();
require_once __DIR__ . "/clases/Noticia.php";
require_once __DIR__ . "/validaciones.php";

header("Content-Type: application/json");

$accion = $_POST["accion"] ?? $_GET["accion"] ?? "listar";

// Listar es público (se usa en Noticias.html); el resto es solo admin
if ($accion !== "listar") {
    if (!isset($_SESSION["id_nivel"]) || $_SESSION["id_nivel"] !== 1) {
        enviarError("sin_permiso", "No tenés permisos para gestionar noticias.");
    }
}

$noticia = new Noticia();

switch ($accion) {

    case "listar":
        enviarExito(["noticias" => $noticia->listar()]);
        break;

    case "crear":
        $descripcion = trim($_POST["texto"] ?? "");
        if (!validarTexto($descripcion, 500)) {
            enviarError("descripcion_invalida", "La noticia debe tener texto, hasta 500 caracteres.");
        }

        $creado = $noticia->crear([
            "descripcion" => $descripcion,
            "id_usuario" => $_SESSION["id_usuario"]
        ]);

        if (!$creado) {
            // Ejemplo del mensaje contextualizado que pide la consigna:
            // "ocurrió un error debido al ingreso de..." con un código propio
            enviarError("error_insertar_noticia", "Ocurrió un error al guardar la noticia. Revisá el texto ingresado.");
        }

        $pdo = Conexion::obtenerConexion();
        $pdo->prepare("INSERT INTO Historiales (descrip_historial, id_usuario) VALUES (:d, :u)")
            ->execute([":d" => "Publicó una noticia", ":u" => $_SESSION["id_usuario"]]);

        enviarExito(["mensaje" => "Noticia publicada correctamente."]);
        break;

    case "editar":
        $id = (int) ($_POST["id"] ?? 0);
        $descripcion = trim($_POST["texto"] ?? "");
        if ($id <= 0 || !validarTexto($descripcion, 500)) {
            enviarError("datos_invalidos", "Faltan datos para editar la noticia.");
        }
        if (!$noticia->actualizar($id, ["descripcion" => $descripcion])) {
            enviarError("error_editar_noticia", "No se pudo editar la noticia.");
        }
        enviarExito(["mensaje" => "Noticia actualizada."]);
        break;

    case "eliminar":
        $id = (int) ($_POST["id"] ?? 0);
        if ($id <= 0 || !$noticia->eliminar($id)) {
            enviarError("error_eliminar_noticia", "No se pudo eliminar la noticia.");
        }
        enviarExito(["mensaje" => "Noticia eliminada."]);
        break;

    default:
        enviarError("accion_invalida", "Acción no reconocida.");
}
