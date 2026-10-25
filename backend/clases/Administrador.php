<?php
require_once __DIR__ . "/Usuario.php";

/**
 * Administrador.php
 * -----------------------------------------------------------
 * Igual idea que Alumno: hereda de Usuario y agrega su propio
 * dato (cargo) más su propia tabla (Administradores).
 * -----------------------------------------------------------
 */

class Administrador extends Usuario {

    private string $cargo;

    public function __construct(
        string $cedula,
        string $nomUsuario,
        string $email,
        string $passwordPlano,
        string $pais,
        string $cargo
    ) {
        // El nivel de acceso 1 corresponde a "Administrador" (ver Niveles_acceso)
        parent::__construct($cedula, $nomUsuario, $email, $passwordPlano, $pais, 1);
        $this->cargo = $cargo;
    }

    public function registrar(): bool {
        if (!$this->guardarUsuarioBase()) {
            return false;
        }

        $pdo = Conexion::obtenerConexion();
        $stmt = $pdo->prepare("INSERT INTO Administradores (id_usuario, cargo) VALUES (:id, :cargo)");
        return $stmt->execute([
            ":id"    => $this->idUsuario,
            ":cargo" => $this->cargo
        ]);
    }
}
