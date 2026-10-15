<?php


class Conexion {

    private static ?Conexion $instancia = null;
    private PDO $pdo;

    // Datos de conexión de XAMPP
    private string $host = "localhost";
    private string $puerto = "3306";
    private string $baseDatos = "bd_proyecto_utu"; 
    private string $usuario = "root";
    private string $clave = "";

    // El constructor es privado: nadie puede hacer "new Conexion()" desde afuera
    private function __construct() {
        try {
            $dsn = "mysql:host={$this->host};port={$this->puerto};dbname={$this->baseDatos};charset=utf8mb4";
            $this->pdo = new PDO($dsn, $this->usuario, $this->clave);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            // Si XAMPP no está corriendo o el servicio MySQL está apagado, cae acá
            header("Content-Type: application/json");
            http_response_code(500);
            echo json_encode([
                "exito" => false,
                "error" => "conexion_fallida",
                "mensaje" => "No se pudo conectar a la base de datos. Verificá que Apache y MySQL estén iniciados en XAMPP."
            ]);
            exit;
        }
    }

    // Punto de acceso único a la conexión
    public static function obtenerConexion(): PDO {
        if (self::$instancia === null) {
            self::$instancia = new Conexion();
        }
        return self::$instancia->pdo;
    }
}
