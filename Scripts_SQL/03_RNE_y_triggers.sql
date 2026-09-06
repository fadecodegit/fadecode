-- RFE-01 y RFE-02: Renombrar columna 'curso_interés' para eliminar 'inscripción' y añadir aviso de cupo obligatorio
ALTER TABLE `Formularios_interes`
  CHANGE `curso_interés` `curso_lista_interes` VARCHAR(40) NOT NULL,
  ADD COLUMN `aviso_cupo_aceptado` TINYINT(1) NOT NULL DEFAULT 1
    COMMENT 'Indica que el usuario leyó que el registro no garantiza cupo';

-- RFE-03: Autorización obligatoria para menores de edad
-- RFE-04: Consentimiento para uso de imagen en difusión
ALTER TABLE `Alumnos`
  ADD COLUMN `es_menor` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN `autorizacion_adulto` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN `consentimiento_imagen` TINYINT(1) NOT NULL DEFAULT 0;

-- RFE-03: Restricción para garantizar autorización si el alumno es menor
ALTER TABLE `Alumnos`
  ADD CONSTRAINT `chk_menor_autorizado`
  CHECK (`es_menor` = 0 OR (`es_menor` = 1 AND `autorizacion_adulto` = 1));

-- RFE-06: Notificación visible sobre uso compartido del Polideportivo
ALTER TABLE `Noticias`
  ADD COLUMN `aviso_polideportivo_compartido` TINYINT(1) DEFAULT 0
    COMMENT 'Indica si aplica la aclaración de instalaciones compartidas';

-- RFE-07: Validación para asegurar que los adjuntos descargables sean exclusivamente .pdf
ALTER TABLE `Ofertas_educativas`
  ADD COLUMN `archivo_programa_pdf` VARCHAR(255) DEFAULT NULL,
  ADD CONSTRAINT `chk_formato_pdf`
  CHECK (`archivo_programa_pdf` IS NULL OR `archivo_programa_pdf` LIKE '%.pdf');

