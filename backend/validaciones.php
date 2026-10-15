<?php
/**
 * validaciones.php
 * -----------------------------------------------------------
 * Funciones sueltas (no una clase) que se reutilizan en los
 * distintos archivos de acción. Son la "segunda barrera" de
 * validación: el navegador ya validó con JavaScript, pero acá
 * se vuelve a chequear del lado del servidor, por si alguien
 * manda datos directo sin pasar por el formulario.
 * -----------------------------------------------------------
 */

function validarNombre(string $nombre): bool {
    // Solo letras (con tildes/ñ) y espacios, entre 2 y 40 caracteres
    return preg_match('/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,40}$/', trim($nombre)) === 1;
}

function validarEmail(string $email): bool {
    return filter_var(trim($email), FILTER_VALIDATE_EMAIL) !== false;
}

function validarPassword(string $password): bool {
    // Mínimo 6 caracteres y al menos un número
    return strlen($password) >= 6 && preg_match('/[0-9]/', $password) === 1;
}

function validarCedula(string $cedula): bool {
    // Solo números, entre 6 y 8 dígitos
    return preg_match('/^[0-9]{6,8}$/', trim($cedula)) === 1;
}

function validarFecha(string $fecha): bool {
    // Espera formato AAAA-MM-DD (el que manda un <input type="date">)
    $partida = DateTime::createFromFormat('Y-m-d', $fecha);
    if (!$partida || $partida->format('Y-m-d') !== $fecha) {
        return false;
    }
    return $partida < new DateTime(); // no puede ser una fecha futura
}

function calcularEdad(string $fechaNacimiento): int {
    $nacimiento = new DateTime($fechaNacimiento);
    return (new DateTime())->diff($nacimiento)->y;
}

function validarTexto(string $texto, int $maximo = 200): bool {
    $largo = strlen(trim($texto));
    return $largo > 0 && $largo <= $maximo;
}

/**
 * Corta la ejecución y devuelve un error en formato JSON con un
 * código identificable (para que el JavaScript sepa qué mensaje
 * mostrar y en qué campo, sin tener que interpretar texto libre).
 */
function enviarError(string $codigo, string $mensaje): void {
    http_response_code(400);
    echo json_encode(["exito" => false, "error" => $codigo, "mensaje" => $mensaje]);
    exit;
}

function enviarExito(array $datos = []): void {
    echo json_encode(array_merge(["exito" => true], $datos));
    exit;
}
