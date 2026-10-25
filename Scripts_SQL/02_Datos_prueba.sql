-- 1. Niveles_acceso (id_nivel)
INSERT INTO `Niveles_acceso` (`id_nivel`, `nombre_nivel`, `descrip_nivel`) VALUES
(1, 'Administrador', 'El administrador puede acceder a todos los beneficios'),
(2, 'Alumno', 'El alumno puede acceder solo a la parte visual'),
(3, 'visitante', 'El visitante puede acceder solo a la parte visual sin algunos beneficios');

-- 2. Cursos (id_curso)
INSERT INTO `Cursos` (`id_curso`, `nom_curso`, `descrip`) VALUES
(1, 'informática', 'Curso informática'),
(2, 'Diseño Gráfico', 'Curso sobre diseño visual y maquetación');

-- 3. Materias (id_materia)
INSERT INTO `Materias` (`id_materia`, `nom_materia`, `descrip_materia`) VALUES
(1, 'MatemáticasCTS', 'Matemáticas centrada en estadísticas'),
(2, 'Programación Web', 'Desarrollo de sitios y aplicaciones web');

-- 4. Horarios (id_horario)
INSERT INTO `Horarios` (`id_horario`, `día_semana`, `hora_inicio`, `hora_fin`) VALUES
(1, 'Lunes', '08:00:00', '12:00:00'),
(2, 'Martes', '13:00:00', '17:00:00');

-- 5. Turnos (id_turno)
INSERT INTO `Turnos` (`id_turno`, `nom_turno`, `descrip_turno`) VALUES
(1, 'Turno 1', 'es el turno matutino'),
(2, 'Turno 2', 'es el turno vespertino');

-- 6. Visitantes (id_visitante)
INSERT INTO `Visitantes` (`id_visitante`, `ip_anonima`) VALUES
(1, 90285309),
(2, 19216810);

-- 7. Usuarios (id_usuario, cedula, nom_usuario, email, pass_usuario, pais, fecha_registro, id_nivel)
INSERT INTO `Usuarios` (`id_usuario`, `cedula`, `nom_usuario`, `email`, `pass_usuario`, `pais`, `fecha_registro`, `id_nivel`) VALUES
(1, 12412414, 'Usuario de prueba', 'prueba@gmail.com', 'abcd1234', 'uruguay', '2026-08-03 12:24:27', 1),
(2, 123456, 'alumno prueba', 'prueba123@gmail.com', 'abcd1234', 'uruguay', '2026-08-03 12:25:28', 2),
(3, 32152335, 'visitante Prueba', 'prueba4321@gmail.com', 'abcd1234', 'uruguay', '2026-08-03 12:26:04', 3),
(4, 987421, 'Admin2', 'prueba123123@gmail.com', 'abcd1234', 'uruguay', '2026-08-03 12:26:57', 1);

-- 8. Administradores (id_usuario, cargo) -> Referencia a Usuarios
INSERT INTO `Administradores` (`id_usuario`, `cargo`) VALUES
(1, 'Planificación'),
(4, 'organización');

-- 9. Alumnos (id_usuario, curso_actual) -> Referencia a Usuarios
INSERT INTO `Alumnos` (`id_usuario`, `curso_actual`) VALUES
(2, 'Informática');

-- 10. Ofertas_educativas (id_oferta, nom_oferta, descrip_oferta, duración_oferta, estado_oferta, requisitos, perfil_egreso, id_usuario, id_turno)
INSERT INTO `Ofertas_educativas` (`id_oferta`, `nom_oferta`, `descrip_oferta`, `duración_oferta`, `estado_oferta`, `requisitos`, `perfil_egreso`, `id_usuario`, `id_turno`) VALUES
(1, 'informática', 'Curso informática', '3 años', 'vigente', 'Requisitos de ciclo básico', 'Perfil técnico en desarrollo', 2, 1);

-- 11. Noticias (id_noticia, descrip_noticia, fecha_noticia, id_usuario)
INSERT INTO `Noticias` (`id_noticia`, `descrip_noticia`, `fecha_noticia`, `id_usuario`) VALUES
(1, 'Inicio del período de inscripciones', '2026-09-01 10:00:00', 1),
(2, 'Mantenimiento programado de la plataforma', '2026-09-01 11:30:00', 4);

-- 12. Formularios_interes (id_formulario, curso_interés, descrip_formulario, mensaje_usuario, fecha_form, id_usuario)
INSERT INTO `Formularios_interes` (`id_formulario`, `curso_interés`, `descrip_formulario`, `mensaje_usuario`, `fecha_form`, `id_usuario`) VALUES
(1, 'informática', 'Consulta de programa', 'Quisiera recibir más detalles de las asignaturas', '2026-09-01 12:00:00', 2);

-- 13. Historiales (id_historial, fecha_ingreso, descrip_historial, id_usuario, id_visitante)
INSERT INTO `Historiales` (`id_historial`, `fecha_ingreso`, `descrip_historial`, `id_usuario`, `id_visitante`) VALUES
(1, '2026-09-01 08:30:00', 'Inicio de sesión en el sistema', 1, NULL),
(2, '2026-09-01 09:15:00', 'Acceso anónimo a la portada', 3, 1);

-- 14. Sugerencias (id_sugerencia, contenido, fecha_sugerencia, id_usuario, id_visitante)
INSERT INTO `Sugerencias` (`id_sugerencia`, `contenido`, `fecha_sugerencia`, `id_usuario`, `id_visitante`) VALUES
(1, 'Añadir un calendario de exámenes visibles', '2026-09-01 10:00:00', 2, NULL),
(2, 'Facilitar el contacto vía correo institucional', '2026-09-01 10:30:00', NULL, 1);

-- 15. Pertenecen (id_curso, id_materia)
INSERT INTO `Pertenecen` (`id_curso`, `id_materia`) VALUES
(1, 1),
(1, 2);

-- 16. Contienen (id_oferta, id_curso)
INSERT INTO `Contienen` (`id_oferta`, `id_curso`) VALUES
(1, 1);

-- 17. Incluyen (id_horario, id_turno)
INSERT INTO `Incluyen` (`id_horario`, `id_turno`) VALUES
(1, 1),
(2, 2);
