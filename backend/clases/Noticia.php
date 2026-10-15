<?php
require_once __DIR__ . "/Conexion.php";
require_once __DIR__ . "/Crud.php";

/**
 * Noticia.php
 * -----------------------------------------------------------
 * Gestiona la tabla Noticias. Implementa la interfaz Crud,
 * o sea que garantiza los 4 métodos: crear, leer, actualizar
 * y eliminar.
 * -----------------------------------------------------------
 */

class Noticia implements Crud {

    private PDO $pdo;

    public function __construct() {
        $this->pdo = Conexion::obtenerConexion();
    }

    public function crear(array $datos): bool {
        // aviso_polideportivo_compartido es opcional (columna agregada por RFE-06);
        // si no se manda, queda en 0 gracias al valor por defecto de este arreglo.
        $sql = "INSERT INTO Noticias (descrip_noticia, id_usuario, aviso_polideportivo_compartido)
                VALUES (:descripcion, :idUsuario, :aviso)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            ":descripcion" => $datos["descripcion"],
            ":idUsuario"   => $datos["id_usuario"],
            ":aviso"       => $datos["aviso_polideportivo_compartido"] ?? 0
        ]);
    }

    public function leer(int $id): array {
        $stmt = $this->pdo->prepare("SELECT * FROM Noticias WHERE id_noticia = :id");
        $stmt->execute([":id" => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function listar(): array {
        $stmt = $this->pdo->query("SELECT * FROM Noticias ORDER BY fecha_noticia DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function actualizar(int $id, array $datos): bool {
        $sql = "UPDATE Noticias SET descrip_noticia = :descripcion WHERE id_noticia = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            ":descripcion" => $datos["descripcion"],
            ":id" => $id
        ]);
    }

    public function eliminar(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM Noticias WHERE id_noticia = :id");
        return $stmt->execute([":id" => $id]);
    }
}
