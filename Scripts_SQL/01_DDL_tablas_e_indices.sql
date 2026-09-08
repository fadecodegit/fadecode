-- 1. Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS `bd_proyecto_utu`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_uca1400_ai_ci;

USE `bd_proyecto_utu`;

-- 2. Creación de Tablas
CREATE TABLE Niveles_acceso (
  id_nivel int(11) NOT NULL AUTO_INCREMENT,
  nombre_nivel varchar(60) NOT NULL,
  descrip_nivel varchar(255) NOT NULL,
  PRIMARY KEY (id_nivel),
  UNIQUE KEY nombre_nivel (nombre_nivel)
);

CREATE TABLE Usuarios (
  id_usuario int(11) NOT NULL AUTO_INCREMENT,
  cedula int(11) NOT NULL,
  nom_usuario varchar(40) NOT NULL,
  email varchar(60) NOT NULL,
  pass_usuario varchar(60) NOT NULL,
  pais varchar(50) NOT NULL,
  fecha_registro datetime NOT NULL DEFAULT current_timestamp(),
  id_nivel int(11) NOT NULL,
  PRIMARY KEY (id_usuario),
  KEY id_nivel (id_nivel),
  FOREIGN KEY (id_nivel) REFERENCES Niveles_acceso (id_nivel)
);

CREATE TABLE Administradores (
  id_usuario int(11) NOT NULL,
  cargo varchar(50) NOT NULL,
  PRIMARY KEY (id_usuario),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario)
);

CREATE TABLE Alumnos (
  id_usuario int(11) NOT NULL,
  curso_actual varchar(50) DEFAULT NULL,
  PRIMARY KEY (id_usuario),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario)
);

CREATE TABLE Visitantes (
  id_visitante int(11) NOT NULL AUTO_INCREMENT,
  ip_anonima varchar(45) NOT NULL,
  PRIMARY KEY (id_visitante)
);

CREATE TABLE Cursos (
  id_curso int(11) NOT NULL AUTO_INCREMENT,
  nom_curso varchar(40) DEFAULT NULL,
  descrip varchar(200) DEFAULT NULL,
  PRIMARY KEY (id_curso)
);

CREATE TABLE Materias (
  id_materia int(11) NOT NULL AUTO_INCREMENT,
  nom_materia varchar(40) DEFAULT NULL,
  descrip_materia varchar(200) DEFAULT NULL,
  PRIMARY KEY (id_materia)
);

CREATE TABLE Pertenecen (
  id_curso int(11) NOT NULL,
  id_materia int(11) NOT NULL,
  PRIMARY KEY (id_curso, id_materia),
  KEY id_materia (id_materia),
  FOREIGN KEY (id_curso) REFERENCES Cursos (id_curso),
  FOREIGN KEY (id_materia) REFERENCES Materias (id_materia)
);

CREATE TABLE Turnos (
  id_turno int(11) NOT NULL AUTO_INCREMENT,
  nom_turno varchar(50) NOT NULL,
  descrip_turno varchar(200) NOT NULL,
  PRIMARY KEY (id_turno)
);

CREATE TABLE Horarios (
  id_horario int(11) NOT NULL AUTO_INCREMENT,
  día_semana varchar(40) NOT NULL,
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  PRIMARY KEY (id_horario)
);

CREATE TABLE Incluyen (
  id_horario int(11) NOT NULL,
  id_turno int(11) NOT NULL,
  PRIMARY KEY (id_horario, id_turno),
  KEY id_turno (id_turno),
  FOREIGN KEY (id_horario) REFERENCES Horarios (id_horario),
  FOREIGN KEY (id_turno) REFERENCES Turnos (id_turno)
);

CREATE TABLE Ofertas_educativas (
  id_oferta int(11) NOT NULL AUTO_INCREMENT,
  nom_oferta varchar(40) NOT NULL,
  descrip_oferta varchar(200) NOT NULL,
  duración_oferta varchar(50) NOT NULL,
  estado_oferta varchar(30) NOT NULL,
  requisitos varchar(200) DEFAULT NULL,
  perfil_egreso varchar(400) NOT NULL,
  id_usuario int(11) NOT NULL,
  id_turno int(11) NOT NULL,
  PRIMARY KEY (id_oferta),
  KEY id_usuario (id_usuario),
  KEY id_turno (id_turno),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario),
  FOREIGN KEY (id_turno) REFERENCES Turnos (id_turno)
);

CREATE TABLE Contienen (
  id_oferta int(11) NOT NULL,
  id_curso int(11) NOT NULL,
  PRIMARY KEY (id_oferta, id_curso),
  KEY id_curso (id_curso),
  FOREIGN KEY (id_oferta) REFERENCES Ofertas_educativas (id_oferta),
  FOREIGN KEY (id_curso) REFERENCES Cursos (id_curso)
);

CREATE TABLE Formularios_interes (
  id_formulario int(11) NOT NULL AUTO_INCREMENT,
  curso_interés varchar(40) NOT NULL,
  descrip_formulario varchar(200) NOT NULL,
  mensaje_usuario varchar(200) DEFAULT NULL,
  fecha_form timestamp NULL DEFAULT current_timestamp(),
  id_usuario int(11) NOT NULL,
  PRIMARY KEY (id_formulario),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario)
);

CREATE TABLE Historiales (
  id_historial int(11) NOT NULL AUTO_INCREMENT,
  fecha_ingreso datetime NOT NULL DEFAULT current_timestamp(),
  descrip_historial varchar(200) DEFAULT NULL,
  id_usuario int(11) NOT NULL,
  id_visitante int(11) DEFAULT NULL,
  PRIMARY KEY (id_historial),
  KEY id_usuario (id_usuario),
  KEY id_visitante (id_visitante),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario),
  FOREIGN KEY (id_visitante) REFERENCES Visitantes (id_visitante)
);

CREATE TABLE Noticias (
  id_noticia int(11) NOT NULL AUTO_INCREMENT,
  descrip_noticia varchar(200) NOT NULL,
  fecha_noticia timestamp NULL DEFAULT current_timestamp(),
  id_usuario int(11) NOT NULL,
  PRIMARY KEY (id_noticia),
  KEY id_usuario (id_usuario),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario)
);

CREATE TABLE Sugerencias (
  id_sugerencia int(11) NOT NULL AUTO_INCREMENT,
  contenido varchar(200) NOT NULL,
  fecha_sugerencia datetime NOT NULL DEFAULT current_timestamp(),
  id_usuario int(11) DEFAULT NULL,
  id_visitante int(11) DEFAULT NULL,
  PRIMARY KEY (id_sugerencia),
  KEY id_usuario (id_usuario),
  KEY id_visitante (id_visitante),
  FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario),
  FOREIGN KEY (id_visitante) REFERENCES Visitantes (id_visitante)
);
