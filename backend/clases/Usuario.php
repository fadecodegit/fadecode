<?php
require_once __DIR__ . "/Conexion.php";
require_once __DIR__ . "/Crud.php";

/**
 * Usuario.php
 * -----------------------------------------------------------
 * Clase ABSTRACTA: no se puede crear un "new Usuario(...)"
 * directamente. Guarda los datos y las operaciones que son
 * comunes a cualquier tipo de usuario del sistema (Alumno o
 * Administrador). Cada tipo concreto agrega lo suyo y define
 * cómo se guarda en su propia tabla (registrar()).
 *
 * Implementa Crud sobre la tabla Usuarios: como Alumno y
 * Administrador heredan de acá, quedan con el CRUD básico
 * ya resuelto sin tener que repetirlo.
 * -----------------------------------------------------------
 */

abstract class Usuario implements Crud {

    protected int $idUsuario = 0;
    protected string $cedula;
    protected string $nomUsuario;
    protected string $email;
    protected string $passUsuario; // ya encriptada
    protected string $pais;
    protected int $idNivel;
    protected string $ultimoError = "";

    public function __construct(
        string $cedula,
        string $nomUsuario,
        string $email,
        string $passwordPlano,
        string $pais,
        int $idNivel
    ) {
        $this->cedula = $cedula;
        $this->nomUsuario = $nomUsuario;
        $this->email = $email;
        $this->pais = $pais;
        $this->idNivel = $idNivel;
        // La contraseña nunca se guarda en texto plano
        $this->passUsuario = password_hash($passwordPlano, PASSWORD_DEFAULT);
    }

    public function getIdUsuario(): int {
        return $this->idUsuario;
    }

    public function getNomUsuario(): string {
        return $this->nomUsuario;
    }

    // Mensaje del último error de base de datos, para mostrarlo contextualizado
    public function getUltimoError(): string {
        return $this->ultimoError;
    }

    /**
     * Inserta la parte común en la tabla Usuarios.
     * Es "protected" porque solo las clases hijas la usan,
     * como paso previo a guardar sus datos específicos.
     */
    protected function guardarUsuarioBase(): bool {
        $pdo = Conexion::obtenerConexion();
        try {
            $sql = "INSERT INTO Usuarios (cedula, nom_usuario, email, pass_usuario, pais, id_nivel)
                    VALUES (:cedula, :nombre, :email, :pass, :pais, :nivel)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ":cedula" => $this->cedula,
                ":nombre" => $this->nomUsuario,
                ":email"  => $this->email,
                ":pass"   => $this->passUsuario,
                ":pais"   => $this->pais,
                ":nivel"  => $this->idNivel
            ]);
            $this->idUsuario = (int) $pdo->lastInsertId();
            return true;
        } catch (PDOException $e) {
            // Código 23000 = violación de clave única (cédula o email repetidos)
            $this->ultimoError = ($e->getCode() === "23000")
                ? "La cédula o el correo ya están registrados."
                : "No se pudo guardar el usuario en la base de datos.";
            return false;
        }
    }

    /**
     * Busca un usuario por cédula y valida la contraseña.
     * Se usa desde login.php. Es estático porque todavía no
     * tenemos un objeto Usuario armado en ese momento.
     */
    public static function autenticar(string $cedula, string $passwordIngresada): array|false {
        $pdo = Conexion::obtenerConexion();
        $stmt = $pdo->prepare("SELECT * FROM Usuarios WHERE cedula = :cedula");
        $stmt->execute([":cedula" => $cedula]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            return false;
        }
        if (!password_verify($passwordIngresada, $usuario["pass_usuario"])) {
            return false;
        }
        return $usuario;
    }

    // --- Implementación de Crud sobre la tabla Usuarios ---

    // Cada subclase ya sabe cómo guardarse (guardarUsuarioBase + su tabla propia)
    public function crear(array $datos): bool {
        return $this->registrar();
    }

    public function leer(int $id): array {
        $pdo = Conexion::obtenerConexion();
        $stmt = $pdo->prepare("SELECT * FROM Usuarios WHERE id_usuario = :id");
        $stmt->execute([":id" => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
    }

    public function listar(): array {
        $pdo = Conexion::obtenerConexion();
        return $pdo->query("SELECT id_usuario, nom_usuario, email, id_nivel FROM Usuarios")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function actualizar(int $id, array $datos): bool {
        // Solo se permite actualizar nombre y correo desde acá (lo básico)
        $pdo = Conexion::obtenerConexion();
        $stmt = $pdo->prepare("UPDATE Usuarios SET nom_usuario = :nombre, email = :email WHERE id_usuario = :id");
        return $stmt->execute([
            ":nombre" => $datos["nombre"],
            ":email"  => $datos["email"],
            ":id"     => $id
        ]);
    }

    public function eliminar(int $id): bool {
        $pdo = Conexion::obtenerConexion();
        try {
            return $pdo->prepare("DELETE FROM Usuarios WHERE id_usuario = :id")->execute([":id" => $id]);
        } catch (PDOException $e) {
            // Falla si tiene noticias, sugerencias, etc. asociadas (claves foráneas)
            return false;
        }
    }

    // Cada tipo de usuario define cómo termina de guardarse
    // (Alumno -> tabla Alumnos, Administrador -> tabla Administradores)
    abstract public function registrar(): bool;
}
