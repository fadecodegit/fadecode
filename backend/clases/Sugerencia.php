<?php
require_once __DIR__ . "/Conexion.php";
require_once __DIR__ . "/Crud.php";

/**
 * Sugerencia.php
 * -----------------------------------------------------------
 * Gestiona la tabla Sugerencias. En el uso real del sistema
 * solo se usan crear() y leer() (cualquiera manda una sugerencia,
 * solo el administrador las lista), pero implementa la interfaz
 * completa igual que Noticia para mantener el mismo contrato.
 * -----------------------------------------------------------
 */

class Sugerencia implements Crud {

    private PDO $pdo;

    public function __construct() {
        $this->pdo = Conexion::obtenerConexion();
    }

    public function crear(array $datos): bool {
        $sql = "INSERT INTO Sugerencias (contenido, id_usuario) VALUES (:contenido, :idUsuario)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            ":contenido" => $datos["contenido"],
            ":idUsuario" => $datos["id_usuario"] // puede ser NULL (visitante anónimo)
        ]);
    }

    public function leer(int $id): array {
        $stmt = $this->pdo->prepare("SELECT * FROM Sugerencias WHERE id_sugerencia = :id");
        $stmt->execute([":id" => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function listar(): array {
        $stmt = $this->pdo->query("SELECT * FROM Sugerencias ORDER BY fecha_sugerencia DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function actualizar(int $id, array $datos): bool {
        $sql = "UPDATE Sugerencias SET contenido = :contenido WHERE id_sugerencia = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            ":contenido" => $datos["contenido"],
            ":id" => $id
        ]);
    }

    public function eliminar(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM Sugerencias WHERE id_sugerencia = :id");
        return $stmt->execute([":id" => $id]);
    }
}
