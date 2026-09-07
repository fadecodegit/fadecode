<?php
require_once __DIR__ . "/Usuario.php";

/**
 * Alumno.php
 * -----------------------------------------------------------
 * Hereda de Usuario. Se guarda primero la parte común
 * (tabla Usuarios) y después la parte propia (tabla Alumnos).
 *
 * La tabla Alumnos tiene 3 columnas agregadas por las RNE del
 * proyecto (03_RNE_y_triggers.sql):
 *   - es_menor: si el alumno es menor de 18 años.
 *   - autorizacion_adulto: obligatorio en 1 si es_menor = 1
 *     (la base tiene una restricción CHECK que lo exige).
 *   - consentimiento_imagen: si autoriza el uso de su imagen.
 * En este formulario simplificado, el checkbox único de
 * "Términos y Condiciones" de Registrarse.html cubre ambos
 * consentimientos.
 * -----------------------------------------------------------
 */

class Alumno extends Usuario {

    private string $cursoActual;
    private bool $esMenor;
    private bool $autorizacionAdulto;
    private bool $consentimientoImagen;

    public function __construct(
        string $cedula,
        string $nomUsuario,
        string $email,
        string $passwordPlano,
        string $pais,
        string $cursoActual,
        bool $esMenor,
        bool $consentimiento
    ) {
        // El nivel de acceso 2 corresponde a "Alumno" (ver Niveles_acceso)
        parent::__construct($cedula, $nomUsuario, $email, $passwordPlano, $pais, 2);
        $this->cursoActual = $cursoActual;
        $this->esMenor = $esMenor;
        $this->autorizacionAdulto = $consentimiento;
        $this->consentimientoImagen = $consentimiento;
    }

    public function registrar(): bool {
        if (!$this->guardarUsuarioBase()) {
            return false;
        }

        $pdo = Conexion::obtenerConexion();
        try {
            $sql = "INSERT INTO Alumnos (id_usuario, curso_actual, es_menor, autorizacion_adulto, consentimiento_imagen)
                    VALUES (:id, :curso, :esMenor, :autorizacion, :consentimiento)";
            $stmt = $pdo->prepare($sql);
            return $stmt->execute([
                ":id"            => $this->idUsuario,
                ":curso"         => $this->cursoActual,
                ":esMenor"       => $this->esMenor ? 1 : 0,
                ":autorizacion"  => $this->autorizacionAdulto ? 1 : 0,
                ":consentimiento" => $this->consentimientoImagen ? 1 : 0
            ]);
        } catch (PDOException $e) {
            // Salta si es_menor = 1 y autorizacion_adulto quedó en 0
            // (restricción chk_menor_autorizado de la base)
            $this->ultimoError = "No se pudo completar el registro: los menores de edad necesitan la autorización de un adulto.";
            return false;
        }
    }
}
