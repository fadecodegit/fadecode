-- phpMyAdmin SQL Dump
-- version 5.2.2deb1+deb13u1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 07-09-2026 a las 17:58:18
-- Versión del servidor: 11.8.6-MariaDB-0+deb13u1 from Debian
-- Versión de PHP: 8.4.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bd_proyecto_utu`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Administradores`
--

CREATE TABLE `Administradores` (
  `id_usuario` int(11) NOT NULL,
  `cargo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Administradores`
--

INSERT INTO `Administradores` (`id_usuario`, `cargo`) VALUES
(1, 'Planificación'),
(4, 'organización');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Alumnos`
--

CREATE TABLE `Alumnos` (
  `id_usuario` int(11) NOT NULL,
  `curso_actual` varchar(50) DEFAULT NULL,
  `es_menor` tinyint(1) NOT NULL DEFAULT 0,
  `autorizacion_adulto` tinyint(1) NOT NULL DEFAULT 0,
  `consentimiento_imagen` tinyint(1) NOT NULL DEFAULT 0
) ;

--
-- Volcado de datos para la tabla `Alumnos`
--

INSERT INTO `Alumnos` (`id_usuario`, `curso_actual`, `es_menor`, `autorizacion_adulto`, `consentimiento_imagen`) VALUES
(2, 'Informática', 0, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Contienen`
--

CREATE TABLE `Contienen` (
  `id_oferta` int(11) NOT NULL,
  `id_curso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Contienen`
--

INSERT INTO `Contienen` (`id_oferta`, `id_curso`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Cursos`
--

CREATE TABLE `Cursos` (
  `id_curso` int(11) NOT NULL,
  `nom_curso` varchar(40) DEFAULT NULL,
  `descrip` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Cursos`
--

INSERT INTO `Cursos` (`id_curso`, `nom_curso`, `descrip`) VALUES
(1, 'informática', 'Curso informática'),
(2, 'Diseño Gráfico', 'Curso sobre diseño visual y maquetación');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Formularios_interes`
--

CREATE TABLE `Formularios_interes` (
  `id_formulario` int(11) NOT NULL,
  `curso_lista_interes` varchar(40) NOT NULL,
  `descrip_formulario` varchar(200) NOT NULL,
  `mensaje_usuario` varchar(200) DEFAULT NULL,
  `fecha_form` timestamp NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL,
  `aviso_cupo_aceptado` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Indica que el usuario leyó que el registro no garantiza cupo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Formularios_interes`
--

INSERT INTO `Formularios_interes` (`id_formulario`, `curso_lista_interes`, `descrip_formulario`, `mensaje_usuario`, `fecha_form`, `id_usuario`, `aviso_cupo_aceptado`) VALUES
(1, 'informática', 'Consulta de programa', 'Quisiera recibir más detalles de las asignaturas', '2026-09-01 16:00:00', 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Historiales`
--

CREATE TABLE `Historiales` (
  `id_historial` int(11) NOT NULL,
  `fecha_ingreso` datetime NOT NULL DEFAULT current_timestamp(),
  `descrip_historial` varchar(200) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_visitante` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Historiales`
--

INSERT INTO `Historiales` (`id_historial`, `fecha_ingreso`, `descrip_historial`, `id_usuario`, `id_visitante`) VALUES
(1, '2026-09-01 08:30:00', 'Inicio de sesión en el sistema', 1, NULL),
(2, '2026-09-01 09:15:00', 'Acceso anónimo a la portada', 3, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Horarios`
--

CREATE TABLE `Horarios` (
  `id_horario` int(11) NOT NULL,
  `día_semana` varchar(40) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Horarios`
--

INSERT INTO `Horarios` (`id_horario`, `día_semana`, `hora_inicio`, `hora_fin`) VALUES
(1, 'Lunes', '08:00:00', '12:00:00'),
(2, 'Martes', '13:00:00', '17:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Incluyen`
--

CREATE TABLE `Incluyen` (
  `id_horario` int(11) NOT NULL,
  `id_turno` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Incluyen`
--

INSERT INTO `Incluyen` (`id_horario`, `id_turno`) VALUES
(1, 1),
(2, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Materias`
--

CREATE TABLE `Materias` (
  `id_materia` int(11) NOT NULL,
  `nom_materia` varchar(40) DEFAULT NULL,
  `descrip_materia` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Materias`
--

INSERT INTO `Materias` (`id_materia`, `nom_materia`, `descrip_materia`) VALUES
(1, 'MatemáticasCTS', 'Matemáticas centrada en estadísticas'),
(2, 'Programación Web', 'Desarrollo de sitios y aplicaciones web');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Niveles_acceso`
--

CREATE TABLE `Niveles_acceso` (
  `id_nivel` int(11) NOT NULL,
  `nombre_nivel` varchar(60) NOT NULL,
  `descrip_nivel` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Niveles_acceso`
--

INSERT INTO `Niveles_acceso` (`id_nivel`, `nombre_nivel`, `descrip_nivel`) VALUES
(1, 'Administrador', 'El administrador puede acceder a todos los beneficios'),
(2, 'Alumno', 'El alumno puede acceder solo a la parte visual'),
(3, 'visitante', 'El visitante puede acceder solo a la parte visual sin algunos beneficios');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Noticias`
--

CREATE TABLE `Noticias` (
  `id_noticia` int(11) NOT NULL,
  `descrip_noticia` varchar(200) NOT NULL,
  `fecha_noticia` timestamp NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL,
  `aviso_polideportivo_compartido` tinyint(1) DEFAULT 0 COMMENT 'Indica si aplica la aclaración de instalaciones compartidas'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Noticias`
--

INSERT INTO `Noticias` (`id_noticia`, `descrip_noticia`, `fecha_noticia`, `id_usuario`, `aviso_polideportivo_compartido`) VALUES
(1, 'Inicio del período de inscripciones', '2026-09-01 14:00:00', 1, 0),
(2, 'Mantenimiento programado de la plataforma', '2026-09-01 15:30:00', 4, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Ofertas_educativas`
--

CREATE TABLE `Ofertas_educativas` (
  `id_oferta` int(11) NOT NULL,
  `nom_oferta` varchar(40) NOT NULL,
  `descrip_oferta` varchar(200) NOT NULL,
  `duración_oferta` varchar(50) NOT NULL,
  `estado_oferta` varchar(30) NOT NULL,
  `requisitos` varchar(200) DEFAULT NULL,
  `perfil_egreso` varchar(400) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_turno` int(11) NOT NULL,
  `archivo_programa_pdf` varchar(255) DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `Ofertas_educativas`
--

INSERT INTO `Ofertas_educativas` (`id_oferta`, `nom_oferta`, `descrip_oferta`, `duración_oferta`, `estado_oferta`, `requisitos`, `perfil_egreso`, `id_usuario`, `id_turno`, `archivo_programa_pdf`) VALUES
(1, 'informática', 'Curso informática', '3 años', 'vigente', 'Requisitos de ciclo básico', 'Perfil técnico en desarrollo', 2, 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Pertenecen`
--

CREATE TABLE `Pertenecen` (
  `id_curso` int(11) NOT NULL,
  `id_materia` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Pertenecen`
--

INSERT INTO `Pertenecen` (`id_curso`, `id_materia`) VALUES
(1, 1),
(1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Sugerencias`
--

CREATE TABLE `Sugerencias` (
  `id_sugerencia` int(11) NOT NULL,
  `contenido` varchar(200) NOT NULL,
  `fecha_sugerencia` datetime NOT NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) DEFAULT NULL,
  `id_visitante` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Sugerencias`
--

INSERT INTO `Sugerencias` (`id_sugerencia`, `contenido`, `fecha_sugerencia`, `id_usuario`, `id_visitante`) VALUES
(1, 'Añadir un calendario de exámenes visibles', '2026-09-01 10:00:00', 2, NULL),
(2, 'Facilitar el contacto vía correo institucional', '2026-09-01 10:30:00', NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Turnos`
--

CREATE TABLE `Turnos` (
  `id_turno` int(11) NOT NULL,
  `nom_turno` varchar(50) NOT NULL,
  `descrip_turno` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Turnos`
--

INSERT INTO `Turnos` (`id_turno`, `nom_turno`, `descrip_turno`) VALUES
(1, 'Turno 1', 'es el turno matutino'),
(2, 'Turno 2', 'es el turno vespertino');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Usuarios`
--

CREATE TABLE `Usuarios` (
  `id_usuario` int(11) NOT NULL,
  `cedula` int(11) NOT NULL,
  `nom_usuario` varchar(40) NOT NULL,
  `email` varchar(60) NOT NULL,
  `pass_usuario` varchar(60) NOT NULL,
  `pais` varchar(50) NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  `id_nivel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Usuarios`
--

INSERT INTO `Usuarios` (`id_usuario`, `cedula`, `nom_usuario`, `email`, `pass_usuario`, `pais`, `fecha_registro`, `id_nivel`) VALUES
(1, 12412414, 'Usuario de prueba', 'prueba@gmail.com', 'abcd1234', 'uruguay', '2026-08-03 12:24:27', 1),
(2, 123456, 'alumno prueba', 'prueba123@gmail.com', 'abcd1234', 'uruguay', '2026-08-03 12:25:28', 2),
(3, 32152335, 'visitante Prueba', 'prueba4321@gmail.com', 'abcd1234', 'uruguay', '2026-08-03 12:26:04', 3),
(4, 987421, 'Admin2', 'prueba123123@gmail.com', 'abcd1234', 'uruguay', '2026-08-03 12:26:57', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Visitantes`
--

CREATE TABLE `Visitantes` (
  `id_visitante` int(11) NOT NULL,
  `ip_anonima` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Volcado de datos para la tabla `Visitantes`
--

INSERT INTO `Visitantes` (`id_visitante`, `ip_anonima`) VALUES
(1, 90285309),
(2, 19216810);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `Administradores`
--
ALTER TABLE `Administradores`
  ADD PRIMARY KEY (`id_usuario`);

--
-- Indices de la tabla `Alumnos`
--
ALTER TABLE `Alumnos`
  ADD PRIMARY KEY (`id_usuario`);

--
-- Indices de la tabla `Contienen`
--
ALTER TABLE `Contienen`
  ADD PRIMARY KEY (`id_oferta`,`id_curso`),
  ADD KEY `id_curso` (`id_curso`);

--
-- Indices de la tabla `Cursos`
--
ALTER TABLE `Cursos`
  ADD PRIMARY KEY (`id_curso`);

--
-- Indices de la tabla `Formularios_interes`
--
ALTER TABLE `Formularios_interes`
  ADD PRIMARY KEY (`id_formulario`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `Historiales`
--
ALTER TABLE `Historiales`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_visitante` (`id_visitante`);

--
-- Indices de la tabla `Horarios`
--
ALTER TABLE `Horarios`
  ADD PRIMARY KEY (`id_horario`);

--
-- Indices de la tabla `Incluyen`
--
ALTER TABLE `Incluyen`
  ADD PRIMARY KEY (`id_horario`,`id_turno`),
  ADD KEY `id_turno` (`id_turno`);

--
-- Indices de la tabla `Materias`
--
ALTER TABLE `Materias`
  ADD PRIMARY KEY (`id_materia`);

--
-- Indices de la tabla `Niveles_acceso`
--
ALTER TABLE `Niveles_acceso`
  ADD PRIMARY KEY (`id_nivel`),
  ADD UNIQUE KEY `nombre_nivel` (`nombre_nivel`);

--
-- Indices de la tabla `Noticias`
--
ALTER TABLE `Noticias`
  ADD PRIMARY KEY (`id_noticia`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `Ofertas_educativas`
--
ALTER TABLE `Ofertas_educativas`
  ADD PRIMARY KEY (`id_oferta`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_turno` (`id_turno`);

--
-- Indices de la tabla `Pertenecen`
--
ALTER TABLE `Pertenecen`
  ADD PRIMARY KEY (`id_curso`,`id_materia`),
  ADD KEY `id_materia` (`id_materia`);

--
-- Indices de la tabla `Sugerencias`
--
ALTER TABLE `Sugerencias`
  ADD PRIMARY KEY (`id_sugerencia`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_visitante` (`id_visitante`);

--
-- Indices de la tabla `Turnos`
--
ALTER TABLE `Turnos`
  ADD PRIMARY KEY (`id_turno`);

--
-- Indices de la tabla `Usuarios`
--
ALTER TABLE `Usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD KEY `id_nivel` (`id_nivel`);

--
-- Indices de la tabla `Visitantes`
--
ALTER TABLE `Visitantes`
  ADD PRIMARY KEY (`id_visitante`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Formularios_interes`
--
ALTER TABLE `Formularios_interes`
  MODIFY `id_formulario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `Historiales`
--
ALTER TABLE `Historiales`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `Horarios`
--
ALTER TABLE `Horarios`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `Niveles_acceso`
--
ALTER TABLE `Niveles_acceso`
  MODIFY `id_nivel` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `Noticias`
--
ALTER TABLE `Noticias`
  MODIFY `id_noticia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `Ofertas_educativas`
--
ALTER TABLE `Ofertas_educativas`
  MODIFY `id_oferta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Sugerencias`
--
ALTER TABLE `Sugerencias`
  MODIFY `id_sugerencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `Turnos`
--
ALTER TABLE `Turnos`
  MODIFY `id_turno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `Usuarios`
--
ALTER TABLE `Usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `Visitantes`
--
ALTER TABLE `Visitantes`
  MODIFY `id_visitante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `Administradores`
--
ALTER TABLE `Administradores`
  ADD CONSTRAINT `Administradores_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id_usuario`);

--
-- Filtros para la tabla `Alumnos`
--
ALTER TABLE `Alumnos`
  ADD CONSTRAINT `Alumnos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id_usuario`);

--
-- Filtros para la tabla `Contienen`
--
ALTER TABLE `Contienen`
  ADD CONSTRAINT `Contienen_ibfk_1` FOREIGN KEY (`id_oferta`) REFERENCES `Ofertas_educativas` (`id_oferta`),
  ADD CONSTRAINT `Contienen_ibfk_2` FOREIGN KEY (`id_curso`) REFERENCES `Cursos` (`id_curso`);

--
-- Filtros para la tabla `Formularios_interes`
--
ALTER TABLE `Formularios_interes`
  ADD CONSTRAINT `Formularios_interes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id_usuario`);

--
-- Filtros para la tabla `Historiales`
--
ALTER TABLE `Historiales`
  ADD CONSTRAINT `Historiales_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id_usuario`),
  ADD CONSTRAINT `Historiales_ibfk_2` FOREIGN KEY (`id_visitante`) REFERENCES `Visitantes` (`id_visitante`);

--
-- Filtros para la tabla `Incluyen`
--
ALTER TABLE `Incluyen`
  ADD CONSTRAINT `Incluyen_ibfk_1` FOREIGN KEY (`id_horario`) REFERENCES `Horarios` (`id_horario`),
  ADD CONSTRAINT `Incluyen_ibfk_2` FOREIGN KEY (`id_turno`) REFERENCES `Turnos` (`id_turno`);

--
-- Filtros para la tabla `Noticias`
--
ALTER TABLE `Noticias`
  ADD CONSTRAINT `Noticias_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id_usuario`);

--
-- Filtros para la tabla `Ofertas_educativas`
--
ALTER TABLE `Ofertas_educativas`
  ADD CONSTRAINT `Ofertas_educativas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id_usuario`),
  ADD CONSTRAINT `Ofertas_educativas_ibfk_2` FOREIGN KEY (`id_turno`) REFERENCES `Turnos` (`id_turno`);

--
-- Filtros para la tabla `Pertenecen`
--
ALTER TABLE `Pertenecen`
  ADD CONSTRAINT `Pertenecen_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `Cursos` (`id_curso`),
  ADD CONSTRAINT `Pertenecen_ibfk_2` FOREIGN KEY (`id_materia`) REFERENCES `Materias` (`id_materia`);

--
-- Filtros para la tabla `Sugerencias`
--
ALTER TABLE `Sugerencias`
  ADD CONSTRAINT `Sugerencias_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id_usuario`),
  ADD CONSTRAINT `Sugerencias_ibfk_2` FOREIGN KEY (`id_visitante`) REFERENCES `Visitantes` (`id_visitante`);

--
-- Filtros para la tabla `Usuarios`
--
ALTER TABLE `Usuarios`
  ADD CONSTRAINT `Usuarios_ibfk_1` FOREIGN KEY (`id_nivel`) REFERENCES `Niveles_acceso` (`id_nivel`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
