
CREATE TABLE `Administradores` (
  `id_usuario` int(11) NOT NULL,
  `cargo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Alumnos` (
  `id_usuario` int(11) NOT NULL,
  `curso_actual` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Contienen` (
  `id_oferta` int(11) NOT NULL,
  `id_curso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Cursos` (
  `id_curso` int(11) NOT NULL,
  `nom_curso` varchar(40) DEFAULT NULL,
  `descrip` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Formularios_interes` (
  `id_formulario` int(11) NOT NULL,
  `curso_interés` varchar(40) NOT NULL,
  `descrip_formulario` varchar(200) NOT NULL,
  `mensaje_usuario` varchar(200) DEFAULT NULL,
  `fecha_form` timestamp NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Historiales` (
  `id_historial` int(11) NOT NULL,
  `fecha_ingreso` datetime NOT NULL DEFAULT current_timestamp(),
  `descrip_historial` varchar(200) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_visitante` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Horarios` (
  `id_horario` int(11) NOT NULL,
  `día_semana` varchar(40) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


CREATE TABLE `Incluyen` (
  `id_horario` int(11) NOT NULL,
  `id_turno` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Materias` (
  `id_materia` int(11) NOT NULL,
  `nom_materia` varchar(40) DEFAULT NULL,
  `descrip_materia` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Niveles_acceso` (
  `id_nivel` int(11) NOT NULL,
  `nombre_nivel` varchar(60) NOT NULL,
  `descrip_nivel` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Noticias` (
  `id_noticia` int(11) NOT NULL,
  `descrip_noticia` varchar(200) NOT NULL,
  `fecha_noticia` timestamp NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Ofertas_educativas` (
  `id_oferta` int(11) NOT NULL,
  `nom_oferta` varchar(40) NOT NULL,
  `descrip_oferta` varchar(200) NOT NULL,
  `duración_oferta` varchar(50) NOT NULL,
  `estado_oferta` varchar(30) NOT NULL,
  `requisitos` varchar(200) DEFAULT NULL,
  `perfil_egreso` varchar(400) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_turno` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Pertenecen` (
  `id_curso` int(11) NOT NULL,
  `id_materia` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Sugerencias` (
  `id_sugerencia` int(11) NOT NULL,
  `contenido` varchar(200) NOT NULL,
  `fecha_sugerencia` datetime NOT NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) DEFAULT NULL,
  `id_visitante` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `Turnos` (
  `id_turno` int(11) NOT NULL,
  `nom_turno` varchar(50) NOT NULL,
  `descrip_turno` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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

CREATE TABLE `Visitantes` (
  `id_visitante` int(11) NOT NULL,
  `ip_anonima` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Indices de la tabla `Administradores`
--
ALTER TABLE `Administradores`
  ADD PRIMARY KEY (`id_usuario`);

  -- Indices de la tabla `Alumnos`
--
ALTER TABLE `Alumnos`
  ADD PRIMARY KEY (`id_usuario`);

  -- Indices de la tabla `Contienen`
--
ALTER TABLE `Contienen`
  ADD PRIMARY KEY (`id_oferta`,`id_curso`),
  ADD KEY `id_curso` (`id_curso`);

  -- Indices de la tabla `Cursos`
--
ALTER TABLE `Cursos`
  ADD PRIMARY KEY (`id_curso`);

  -- Indices de la tabla `Formularios_interes`
--
ALTER TABLE `Formularios_interes`
  ADD PRIMARY KEY (`id_formulario`),
  ADD KEY `id_usuario` (`id_usuario`);

  -- Indices de la tabla `Historiales`
--
ALTER TABLE `Historiales`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_visitante` (`id_visitante`);

  -- Indices de la tabla `Horarios`
--
ALTER TABLE `Horarios`
  ADD PRIMARY KEY (`id_horario`);

  -- Indices de la tabla `Incluyen`
--
ALTER TABLE `Incluyen`
  ADD PRIMARY KEY (`id_horario`,`id_turno`),
  ADD KEY `id_turno` (`id_turno`);

  -- Indices de la tabla `Materias`
--
ALTER TABLE `Materias`
  ADD PRIMARY KEY (`id_materia`);

  -- Indices de la tabla `Niveles_acceso`
--
ALTER TABLE `Niveles_acceso`
  ADD PRIMARY KEY (`id_nivel`),
  ADD UNIQUE KEY `nombre_nivel` (`nombre_nivel`);

  -- Indices de la tabla `Noticias`
--
ALTER TABLE `Noticias`
  ADD PRIMARY KEY (`id_noticia`),
  ADD KEY `id_usuario` (`id_usuario`);


  -- Indices de la tabla `Ofertas_educativas`
--
ALTER TABLE `Ofertas_educativas`
  ADD PRIMARY KEY (`id_oferta`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_turno` (`id_turno`);

  -- Indices de la tabla `Pertenecen`
--
ALTER TABLE `Pertenecen`
  ADD PRIMARY KEY (`id_curso`,`id_materia`),
  ADD KEY `id_materia` (`id_materia`);

  -- Indices de la tabla `Sugerencias`
--
ALTER TABLE `Sugerencias`
  ADD PRIMARY KEY (`id_sugerencia`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_visitante` (`id_visitante`);

  -- Indices de la tabla `Turnos`
--
ALTER TABLE `Turnos`
  ADD PRIMARY KEY (`id_turno`);

  -- Indices de la tabla `Usuarios`
--
ALTER TABLE `Usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD KEY `id_nivel` (`id_nivel`);


  -- Indices de la tabla `Visitantes`
--
ALTER TABLE `Visitantes`
  ADD PRIMARY KEY (`id_visitante`);

  -- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Formularios_interes`
--
ALTER TABLE `Formularios_interes`
  MODIFY `id_formulario` int(11) NOT NULL AUTO_INCREMENT;

  -- AUTO_INCREMENT de la tabla `Historiales`
--
ALTER TABLE `Historiales`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT;

  -- AUTO_INCREMENT de la tabla `Horarios`
--
ALTER TABLE `Horarios`
  MODIFY `id_horario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

  -- AUTO_INCREMENT de la tabla `Niveles_acceso`
--
ALTER TABLE `Niveles_acceso`
  MODIFY `id_nivel` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

  -- AUTO_INCREMENT de la tabla `Noticias`
--
ALTER TABLE `Noticias`
  MODIFY `id_noticia` int(11) NOT NULL AUTO_INCREMENT;

  -- AUTO_INCREMENT de la tabla `Ofertas_educativas`
--
ALTER TABLE `Ofertas_educativas`
  MODIFY `id_oferta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

  -- AUTO_INCREMENT de la tabla `Sugerencias`
--
ALTER TABLE `Sugerencias`
  MODIFY `id_sugerencia` int(11) NOT NULL AUTO_INCREMENT;

  -- AUTO_INCREMENT de la tabla `Turnos`
--
ALTER TABLE `Turnos`
  MODIFY `id_turno` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

  -- AUTO_INCREMENT de la tabla `Usuarios`
--
ALTER TABLE `Usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

  -- AUTO_INCREMENT de la tabla `Visitantes`
--
ALTER TABLE `Visitantes`
  MODIFY `id_visitante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;


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
