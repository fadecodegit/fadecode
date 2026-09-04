// Inicializa el panel de administración.
(function () {
  "use strict";

  let anexoEditorApi = null;
  /* Navegación entre vistas (sidebar) */
  function initViewSwitching() {
    const links = document.querySelectorAll("[data-view]");
    const panels = document.querySelectorAll("[data-view-panel]");
    const placeholderTitle = document.getElementById("placeholderTitle");

    function showView(viewName, label, activeLink) {
      panels.forEach((panel) => {
        panel.hidden = panel.id !== `view-${viewName}`;
      });

      if (viewName === "placeholder" && placeholderTitle) {
        placeholderTitle.textContent = label || "Sección";
      }

      if (viewName === "anexoeditor") {
        const viewTitle = document.getElementById("anexoEditorViewTitle");
        if (viewTitle) viewTitle.textContent = `Editar página — ${label}`;
        if (anexoEditorApi) anexoEditorApi.setTitulo(label);
      }

      // Marca como activo el enlace seleccionado.
      links.forEach((link) => link.classList.remove("is-active"));
      if (activeLink && viewName !== "placeholder") {
        activeLink.classList.add("is-active");
      }

      closeSidebarOnMobile();
    }

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const view = link.dataset.view || "placeholder";
        const label = link.dataset.label || link.textContent.trim();
        showView(view, label, link);
      });
    });
  }
  /* Sidebar móvil */
  function initMobileSidebar() {
    const sidebar = document.getElementById("adminSidebar");
    const backdrop = document.getElementById("adminSidebarBackdrop");
    const openBtn = document.getElementById("adminMenuBtn");
    if (!sidebar || !backdrop || !openBtn) return;

    openBtn.addEventListener("click", () => {
      sidebar.classList.add("is-open");
      backdrop.classList.add("is-open");
    });

    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("is-open");
      backdrop.classList.remove("is-open");
    });
  }

  function closeSidebarOnMobile() {
    const sidebar = document.getElementById("adminSidebar");
    const backdrop = document.getElementById("adminSidebarBackdrop");
    if (!sidebar || !backdrop) return;
    sidebar.classList.remove("is-open");
    backdrop.classList.remove("is-open");
  }
  /* Sidebar: ítems desplegables (Anexos > Polideportivo > ...) */
  function initNavToggles() {
    document.querySelectorAll("[data-toggle]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const submenu = btn.nextElementSibling;
        if (!submenu) return;
        const isOpen = submenu.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(isOpen));
      });
    });
  }
  /* Cambia el idioma seleccionado. */
  function initLangToggle() {
    const btn = document.getElementById("langToggle");
    if (!btn) return;
    const spans = btn.querySelectorAll("span");
    btn.addEventListener("click", () => {
      spans.forEach((span) => span.classList.toggle("is-active"));
    });
  }
  /* Dashboard / Estadísticas — Chart.js con datos de EJEMPLO */
  function initDashboardCharts() {
    if (typeof Chart === "undefined") return;

    // Estudiantes por curso.
    const cursoCanvas = document.getElementById("chartEstudiantesPorCurso");
    if (cursoCanvas) {
      new Chart(cursoCanvas, {
        type: "pie",
        data: {
          labels: ["BT", "EMB", "BTP", "CTT", "FPB", "CPI", "Tecnólogo"],
          datasets: [
            {
              data: [413, 297, 216, 95, 85, 25, 15],
              backgroundColor: [
                "#29abe2",
                "#2ecc71",
                "#e0592a",
                "#c9971f",
                "#8e2450",
                "#4b3fd1",
                "#2ecc71",
              ],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
        },
      });
    }

    // Situación laboral de los docentes.
    const laboralCanvas = document.getElementById("chartDocentesLaboral");
    if (laboralCanvas) {
      new Chart(laboralCanvas, {
        type: "bar",
        data: {
          labels: [""],
          datasets: [
            { label: "Interinos", data: [154], backgroundColor: "#29abe2" },
            { label: "Efectivos", data: [29], backgroundColor: "#2ecc71" },
            { label: "Suplentes", data: [26], backgroundColor: "#e0592a" },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          scales: {
            x: { stacked: true, display: false },
            y: { stacked: true, display: false },
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
        },
      });
    }

    // Personal por género.
    const generoCharts = [
      { id: "chartGeneroDocentes", data: [92, 117] },
      { id: "chartGeneroNoDocentes", data: [3, 12] },
      { id: "chartGeneroIndirecta", data: [7, 12] },
    ];

    generoCharts.forEach(({ id, data }) => {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      new Chart(canvas, {
        type: "pie",
        data: {
          labels: ["Hombres", "Mujeres"],
          datasets: [
            {
              data,
              backgroundColor: ["#29abe2", "#e0592a"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
        },
      });
    });
  }
  /* Crear Evento — vista previa en vivo */
  function initEventoForm() {
    const form = document.getElementById("formEvento");
    if (!form) return;

    const colorInput = document.getElementById("eventoColor");
    const fechaInput = document.getElementById("eventoFecha");
    const descInput = document.getElementById("eventoDescripcion");

    const previewDate = document.getElementById("previewEventoDate");
    const previewDesc = document.getElementById("previewEventoDescription");

    function updatePreview() {
      previewDate.style.backgroundColor = colorInput.value;
      previewDate.textContent = fechaInput.value.trim() || "Fecha";
      previewDesc.textContent = descInput.value.trim() || "Descripcion";
    }

    [colorInput, fechaInput, descInput].forEach((input) => {
      input.addEventListener("input", updatePreview);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
            alert("Diseño listo. Falta conectar esto a donde se guarden los eventos.");
    });

    form.addEventListener("reset", () => {
      window.setTimeout(updatePreview, 0);
    });

    updatePreview();
  }
  /* Crear Noticia — vista previa en vivo */
  function initNoticiaForm() {
    const form = document.getElementById("formNoticia");
    if (!form) return;

    const imageInput = document.getElementById("noticiaImagen");
    const fechaInput = document.getElementById("noticiaFecha");
    const subtituloInput = document.getElementById("noticiaSubtitulo");
    const textoInput = document.getElementById("noticiaTexto");

    const previewImageWrap = document.getElementById("previewNoticiaImageWrap");
    const previewImage = document.getElementById("previewNoticiaImage");
    const previewDate = document.getElementById("previewNoticiaDate");
    const previewTitle = document.getElementById("previewNoticiaTitle");
    const previewSummary = document.getElementById("previewNoticiaSummary");
    const thumb = document.getElementById("noticiaThumb");

    function updateTextPreview() {
      previewDate.textContent = fechaInput.value.trim() || "Fecha";
      previewTitle.textContent = subtituloInput.value.trim() || "Subtítulo";
      previewSummary.textContent = textoInput.value.trim() || "Texto de la noticia.";
    }

    [fechaInput, subtituloInput, textoInput].forEach((input) => {
      input.addEventListener("input", updateTextPreview);
    });

    imageInput.addEventListener("change", () => {
      const file = imageInput.files && imageInput.files[0];
      if (!file) {
        previewImage.src = "";
        previewImage.removeAttribute("src");
        previewImageWrap.classList.remove("has-image");
        thumb.classList.remove("has-image");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        previewImage.src = reader.result;
        previewImageWrap.classList.add("has-image");
        thumb.querySelector("img").src = reader.result;
        thumb.classList.add("has-image");
      };
      reader.readAsDataURL(file);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
            alert("Diseño listo. Falta conectar esto a donde se guarden las noticias.");
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        updateTextPreview();
        previewImageWrap.classList.remove("has-image");
        thumb.classList.remove("has-image");
      }, 0);
    });

    updateTextPreview();
  }
  /* Laboratorio — galería de imagen + texto explicativo */
  function initLaboratorioForm() {
    const addBtn = document.getElementById("labAddBtn");
    if (!addBtn) return;

    const imageInput = document.getElementById("labImagen");
    const textoInput = document.getElementById("labTexto");
    const thumb = document.getElementById("labThumb");
    const uploadAllBtn = document.getElementById("labUploadAllBtn");
    const gallery = document.getElementById("labGallery");
    const emptyMsg = document.getElementById("labGalleryEmpty");
    const form = document.getElementById("formLaboratorio");

    let pendingImageData = "";

    imageInput.addEventListener("change", () => {
      const file = imageInput.files && imageInput.files[0];
      if (!file) {
        pendingImageData = "";
        thumb.classList.remove("has-image");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        pendingImageData = reader.result;
        thumb.querySelector("img").src = pendingImageData;
        thumb.classList.add("has-image");
      };
      reader.readAsDataURL(file);
    });

    addBtn.addEventListener("click", () => {
      const texto = textoInput.value.trim();
      if (!pendingImageData || !texto) {
        alert("Elegí una imagen y escribí el texto explicativo antes de agregar.");
        return;
      }

      if (emptyMsg) emptyMsg.hidden = true;

      const item = document.createElement("article");
      item.className = "admin-lab-item";
      item.innerHTML =
        '<div class="admin-lab-item__image"><img src="" alt=""></div>' +
        '<p class="admin-lab-item__text"></p>' +
        '<button type="button" class="admin-lab-item__remove" aria-label="Quitar">×</button>';

      item.querySelector(".admin-lab-item__image img").src = pendingImageData;
      item.querySelector(".admin-lab-item__text").textContent = texto;
      item.querySelector(".admin-lab-item__remove").addEventListener("click", () => {
        item.remove();
        if (emptyMsg && !gallery.querySelector(".admin-lab-item")) {
          emptyMsg.hidden = false;
        }
      });

      gallery.appendChild(item);

      // Limpiar los campos para cargar la próxima imagen
      textoInput.value = "";
      pendingImageData = "";
      thumb.classList.remove("has-image");
      imageInput.value = "";
    });

    if (form) {
      form.addEventListener("reset", () => {
        window.setTimeout(() => {
          pendingImageData = "";
          thumb.classList.remove("has-image");
        }, 0);
      });
    }

    if (uploadAllBtn) {
      uploadAllBtn.addEventListener("click", () => {
                alert("Diseño listo. Falta conectar esto a donde se guarden las imágenes del Laboratorio.");
      });
    }
  }
  /* Normativas — encabezado + bloques Imagen/Texto */
  function initNormativaForm() {
    const form = document.getElementById("formNormativa");
    if (!form) return;

    const tituloInput = document.getElementById("normativaTitulo");
    const introInput = document.getElementById("normativaTextoIntro");
    const previewTitulo = document.getElementById("previewNormativaTitulo");
    const previewIntro = document.getElementById("previewNormativaIntro");
    const blocksContainer = document.getElementById("previewNormativaBlocks");
    const emptyMsg = document.getElementById("previewNormativaEmpty");

    const btnImagen = document.getElementById("normBtnImagen");
    const btnTexto = document.getElementById("normBtnTexto");
    const blockImagen = document.getElementById("normBlockImagen");
    const blockTexto = document.getElementById("normBlockTexto");

    const imagenArchivo = document.getElementById("normImagenArchivo");
    const imagenThumb = document.getElementById("normImagenThumb");
    const imagenSubtitulo = document.getElementById("normImagenSubtitulo");
    const imagenTexto = document.getElementById("normImagenTexto");

    const textoSubtitulo = document.getElementById("normTextoSubtitulo");
    const textoTexto = document.getElementById("normTextoTexto");

    const addBlockBtn = document.getElementById("normAddBlockBtn");

    let currentType = "imagen";
    let pendingImageData = "";

    function updateHeader() {
      previewTitulo.textContent = tituloInput.value.trim() || "Subtítulo";
      previewIntro.textContent = introInput.value.trim() || "Texto introductorio.";
    }

    function setType(type) {
      currentType = type;
      const isImagen = type === "imagen";
      blockImagen.hidden = !isImagen;
      blockTexto.hidden = isImagen;
      btnImagen.classList.toggle("is-active", isImagen);
      btnTexto.classList.toggle("is-active", !isImagen);
    }

    function resetImagenFields() {
      imagenSubtitulo.value = "";
      imagenTexto.value = "";
      imagenArchivo.value = "";
      pendingImageData = "";
      imagenThumb.classList.remove("has-image");
    }

    function addRemovable(block) {
      block.querySelector(".admin-normativa-block__remove").addEventListener("click", () => {
        block.remove();
        if (emptyMsg && !blocksContainer.querySelector(".admin-normativa-block")) {
          emptyMsg.hidden = false;
        }
      });
      blocksContainer.appendChild(block);
      if (emptyMsg) emptyMsg.hidden = true;
    }

    function addImagenBlock() {
      const subt = imagenSubtitulo.value.trim();
      const texto = imagenTexto.value.trim();
      if (!pendingImageData || !subt || !texto) {
        alert("Elegí una imagen, escribí el subtítulo y el texto antes de agregar.");
        return;
      }

      const block = document.createElement("article");
      block.className = "admin-normativa-block admin-normativa-block--imagen";
      block.innerHTML =
        '<div class="admin-normativa-block__image"><img src="" alt=""></div>' +
        '<div class="admin-normativa-block__body">' +
        '<h3 class="admin-normativa-block__subtitle"></h3>' +
        '<p class="admin-normativa-block__text"></p>' +
        "</div>" +
        '<button type="button" class="admin-normativa-block__remove" aria-label="Quitar">×</button>';

      block.querySelector("img").src = pendingImageData;
      block.querySelector(".admin-normativa-block__subtitle").textContent = subt;
      block.querySelector(".admin-normativa-block__text").textContent = texto;

      addRemovable(block);
      resetImagenFields();
    }

    function addTextoBlock() {
      const subt = textoSubtitulo.value.trim();
      const texto = textoTexto.value.trim();
      if (!subt || !texto) {
        alert("Escribí el subtítulo y el texto antes de agregar.");
        return;
      }

      const block = document.createElement("article");
      block.className = "admin-normativa-block admin-normativa-block--texto";
      block.innerHTML =
        '<h3 class="admin-normativa-block__subtitle"></h3>' +
        '<p class="admin-normativa-block__text"></p>' +
        '<button type="button" class="admin-normativa-block__remove" aria-label="Quitar">×</button>';

      block.querySelector(".admin-normativa-block__subtitle").textContent = subt;
      block.querySelector(".admin-normativa-block__text").textContent = texto;

      addRemovable(block);
      textoSubtitulo.value = "";
      textoTexto.value = "";
    }

    tituloInput.addEventListener("input", updateHeader);
    introInput.addEventListener("input", updateHeader);

    btnImagen.addEventListener("click", () => setType("imagen"));
    btnTexto.addEventListener("click", () => setType("texto"));

    imagenArchivo.addEventListener("change", () => {
      const file = imagenArchivo.files && imagenArchivo.files[0];
      if (!file) {
        pendingImageData = "";
        imagenThumb.classList.remove("has-image");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        pendingImageData = reader.result;
        imagenThumb.querySelector("img").src = pendingImageData;
        imagenThumb.classList.add("has-image");
      };
      reader.readAsDataURL(file);
    });

    addBlockBtn.addEventListener("click", () => {
      if (currentType === "imagen") {
        addImagenBlock();
      } else {
        addTextoBlock();
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
            alert("Diseño listo. Falta conectar esto a donde se guarden las normativas.");
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        updateHeader();
        blocksContainer.querySelectorAll(".admin-normativa-block").forEach((el) => el.remove());
        if (emptyMsg) emptyMsg.hidden = false;
        resetImagenFields();
        textoSubtitulo.value = "";
        textoTexto.value = "";
        setType("imagen");
      }, 0);
    });

    setType("imagen");
    updateHeader();
  }
  /* Ubicacion UTU / Anexos — imagen + texto + datos de contacto */
  function initAnexoEditorForm() {
    const form = document.getElementById("formAnexoEditor");
    if (!form) return;

    const tituloInput = document.getElementById("anexoTitulo");
    const imagenInput = document.getElementById("anexoImagen");
    const imagenThumb = document.getElementById("anexoImagenThumb");
    const textoInput = document.getElementById("anexoTexto");
    const localizacionInput = document.getElementById("anexoLocalizacion");
    const telefonoInput = document.getElementById("anexoTelefono");
    const correoInput = document.getElementById("anexoCorreo");
    const directorInput = document.getElementById("anexoDirector");

    const previewTitulo = document.getElementById("previewAnexoTitulo");
    const previewImageWrap = document.getElementById("previewAnexoImageWrap");
    const previewImage = document.getElementById("previewAnexoImage");
    const previewTexto = document.getElementById("previewAnexoTexto");
    const previewLocalizacion = document.getElementById("previewAnexoLocalizacion");
    const previewTelefono = document.getElementById("previewAnexoTelefono");
    const previewCorreo = document.getElementById("previewAnexoCorreo");
    const previewDirector = document.getElementById("previewAnexoDirector");

    function update() {
      previewTitulo.textContent = tituloInput.value.trim() || "Título";
      previewTexto.textContent = textoInput.value.trim() || "Descripción del anexo/ubicación.";
      previewLocalizacion.textContent = localizacionInput.value.trim() || "Localización";
      previewTelefono.textContent = telefonoInput.value.trim() || "Teléfono";
      previewCorreo.textContent = correoInput.value.trim() || "Correo";
      previewDirector.textContent = directorInput.value.trim() || "Director/a";
    }

    [tituloInput, textoInput, localizacionInput, telefonoInput, correoInput, directorInput].forEach((input) => {
      input.addEventListener("input", update);
    });

    imagenInput.addEventListener("change", () => {
      const file = imagenInput.files && imagenInput.files[0];
      if (!file) {
        previewImage.removeAttribute("src");
        previewImageWrap.classList.remove("has-image");
        imagenThumb.classList.remove("has-image");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        previewImage.src = reader.result;
        previewImageWrap.classList.add("has-image");
        imagenThumb.querySelector("img").src = reader.result;
        imagenThumb.classList.add("has-image");
      };
      reader.readAsDataURL(file);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
            alert("Diseño listo. Falta conectar esto a donde se guarden los datos de la página.");
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        update();
        previewImageWrap.classList.remove("has-image");
        imagenThumb.classList.remove("has-image");
      }, 0);
    });

    update();

    anexoEditorApi = {
      setTitulo(label) {
        tituloInput.value = label;
        update();
      },
    };
  }
  /* Institucional — imagen de portada + secciones subtítulo/texto */
  function initInstitucionalForm() {
    const form = document.getElementById("formInstitucional");
    if (!form) return;

    const imagenInput = document.getElementById("instImagen");
    const imagenThumb = document.getElementById("instImagenThumb");
    const heroTituloInput = document.getElementById("instHeroTitulo");
    const heroTextoInput = document.getElementById("instHeroTexto");
    const subtituloInput = document.getElementById("instSubtitulo");
    const textoInput = document.getElementById("instTexto");
    const addBtn = document.getElementById("instAddBtn");

    const previewImageWrap = document.getElementById("previewInstImageWrap");
    const previewImage = document.getElementById("previewInstImage");
    const previewHeroTitulo = document.getElementById("previewInstHeroTitulo");
    const previewHeroTexto = document.getElementById("previewInstHeroTexto");
    const sectionsContainer = document.getElementById("previewInstSections");
    const emptyMsg = document.getElementById("previewInstEmpty");

    function updateHero() {
      previewHeroTitulo.textContent = heroTituloInput.value.trim() || "Título";
      previewHeroTexto.textContent = heroTextoInput.value.trim() || "Texto de bienvenida.";
    }

    heroTituloInput.addEventListener("input", updateHero);
    heroTextoInput.addEventListener("input", updateHero);

    imagenInput.addEventListener("change", () => {
      const file = imagenInput.files && imagenInput.files[0];
      if (!file) {
        previewImage.removeAttribute("src");
        previewImageWrap.classList.remove("has-image");
        imagenThumb.classList.remove("has-image");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        previewImage.src = reader.result;
        previewImageWrap.classList.add("has-image");
        imagenThumb.querySelector("img").src = reader.result;
        imagenThumb.classList.add("has-image");
      };
      reader.readAsDataURL(file);
    });

    addBtn.addEventListener("click", () => {
      const subt = subtituloInput.value.trim();
      const texto = textoInput.value.trim();
      if (!subt || !texto) {
        alert("Escribí el subtítulo y el texto antes de agregar.");
        return;
      }

      if (emptyMsg) emptyMsg.hidden = true;

      const section = document.createElement("article");
      section.innerHTML =
        '<div class="admin-preview-institucional__section-row">' +
        '<h3 class="admin-preview-institucional__subtitle"></h3>' +
        '<button type="button" class="admin-preview-institucional__remove" aria-label="Quitar">×</button>' +
        "</div>" +
        '<p class="admin-preview-institucional__text"></p>';

      section.querySelector(".admin-preview-institucional__subtitle").textContent = subt;
      section.querySelector(".admin-preview-institucional__text").textContent = texto;
      section.querySelector(".admin-preview-institucional__remove").addEventListener("click", () => {
        section.remove();
        if (emptyMsg && !sectionsContainer.children.length) {
          emptyMsg.hidden = false;
        }
      });

      sectionsContainer.appendChild(section);

      subtituloInput.value = "";
      textoInput.value = "";
      subtituloInput.focus();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
            alert("Diseño listo. Falta conectar esto a donde se guarde el contenido de Institucional.");
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        previewImageWrap.classList.remove("has-image");
        imagenThumb.classList.remove("has-image");
        sectionsContainer.querySelectorAll("article").forEach((el) => el.remove());
        if (emptyMsg) emptyMsg.hidden = false;
        updateHero();
      }, 0);
    });

    updateHero();
  }
  /* Polideportivo — Inicio: datos básicos + secciones texto/tabla */
  function initPolideportivoForm() {
    const form = document.getElementById("formPolideportivo");
    if (!form) return;

    const tituloInput = document.getElementById("polidTitulo");
    const inauguracionInput = document.getElementById("polidInauguracion");
    const coordinadorInput = document.getElementById("polidCoordinador");
    const direccionInput = document.getElementById("polidDireccion");
    const telefonoInput = document.getElementById("polidTelefono");

    const previewTitulo = document.getElementById("previewPolidTitulo");
    const previewInauguracion = document.getElementById("previewPolidInauguracion");
    const previewCoordinador = document.getElementById("previewPolidCoordinador");
    const previewDireccion = document.getElementById("previewPolidDireccion");
    const previewTelefono = document.getElementById("previewPolidTelefono");

    const sectionsContainer = document.getElementById("previewPolidSections");
    const emptyMsg = document.getElementById("previewPolidEmpty");

    const btnTexto = document.getElementById("polidBtnTexto");
    const btnTabla = document.getElementById("polidBtnTabla");
    const blockTexto = document.getElementById("polidBlockTexto");
    const blockTabla = document.getElementById("polidBlockTabla");

    const textoSubtitulo = document.getElementById("polidTextoSubtitulo");
    const textoTexto = document.getElementById("polidTextoTexto");
    const addTextoBtn = document.getElementById("polidAddTextoBtn");

    const tablaSubtitulo = document.getElementById("polidTablaSubtitulo");
    const tablaCol1 = document.getElementById("polidTablaCol1");
    const tablaCol2 = document.getElementById("polidTablaCol2");
    const filaValor1 = document.getElementById("polidFilaValor1");
    const filaValor2 = document.getElementById("polidFilaValor2");
    const addFilaBtn = document.getElementById("polidAddFilaBtn");
    const pendingRowsList = document.getElementById("polidPendingRows");
    const addTablaBtn = document.getElementById("polidAddTablaBtn");

    let pendingRows = [];

    function updateMeta() {
      previewTitulo.textContent = tituloInput.value.trim() || "Título";
      previewInauguracion.textContent = "Inauguración: " + (inauguracionInput.value.trim() || "—");
      previewCoordinador.textContent = "Coordinador/a: " + (coordinadorInput.value.trim() || "—");
      previewDireccion.textContent = "Dirección: " + (direccionInput.value.trim() || "—");
      previewTelefono.textContent = "Teléfono: " + (telefonoInput.value.trim() || "—");
    }

    [tituloInput, inauguracionInput, coordinadorInput, direccionInput, telefonoInput].forEach((input) => {
      input.addEventListener("input", updateMeta);
    });

    function setType(type) {
      const isTexto = type === "texto";
      blockTexto.hidden = !isTexto;
      blockTabla.hidden = isTexto;
      btnTexto.classList.toggle("is-active", isTexto);
      btnTabla.classList.toggle("is-active", !isTexto);
    }

    btnTexto.addEventListener("click", () => setType("texto"));
    btnTabla.addEventListener("click", () => setType("tabla"));

    function addRemovableSection(section) {
      section.querySelector(".admin-polid-section__remove").addEventListener("click", () => {
        section.remove();
        if (emptyMsg && !sectionsContainer.querySelector(".admin-polid-section")) {
          emptyMsg.hidden = false;
        }
      });
      if (emptyMsg) emptyMsg.hidden = true;
      sectionsContainer.appendChild(section);
    }

    addTextoBtn.addEventListener("click", () => {
      const subt = textoSubtitulo.value.trim();
      const texto = textoTexto.value.trim();
      if (!subt || !texto) {
        alert("Escribí el subtítulo y el texto antes de agregar.");
        return;
      }

      const section = document.createElement("article");
      section.className = "admin-polid-section";
      section.innerHTML =
        '<div class="admin-polid-section__row">' +
        '<h3 class="admin-polid-section__subtitle"></h3>' +
        '<button type="button" class="admin-polid-section__remove" aria-label="Quitar">×</button>' +
        "</div>" +
        '<p class="admin-polid-section__text"></p>';

      section.querySelector(".admin-polid-section__subtitle").textContent = subt;
      section.querySelector(".admin-polid-section__text").textContent = texto;

      addRemovableSection(section);

      textoSubtitulo.value = "";
      textoTexto.value = "";
    });

    function renderPendingRows() {
      pendingRowsList.innerHTML = "";
      pendingRows.forEach((row, index) => {
        const li = document.createElement("li");
        li.className = "admin-polid-pending-row";
        li.innerHTML = `<span></span><button type="button" aria-label="Quitar fila">×</button>`;
        li.querySelector("span").textContent = `${row[0]} — ${row[1]}`;
        li.querySelector("button").addEventListener("click", () => {
          pendingRows.splice(index, 1);
          renderPendingRows();
        });
        pendingRowsList.appendChild(li);
      });
    }

    addFilaBtn.addEventListener("click", () => {
      const v1 = filaValor1.value.trim();
      const v2 = filaValor2.value.trim();
      if (!v1 || !v2) {
        alert("Completá los dos valores de la fila antes de añadirla.");
        return;
      }
      pendingRows.push([v1, v2]);
      renderPendingRows();
      filaValor1.value = "";
      filaValor2.value = "";
      filaValor1.focus();
    });

    addTablaBtn.addEventListener("click", () => {
      const subt = tablaSubtitulo.value.trim();
      const c1 = tablaCol1.value.trim();
      const c2 = tablaCol2.value.trim();
      if (!subt || !c1 || !c2 || pendingRows.length === 0) {
        alert("Completá el subtítulo, las dos columnas y agregá al menos una fila.");
        return;
      }

      const section = document.createElement("article");
      section.className = "admin-polid-section";

      let rowsHtml = "";
      pendingRows.forEach((row) => {
        rowsHtml += `<tr><td></td><td></td></tr>`;
      });

      section.innerHTML =
        '<div class="admin-polid-section__row">' +
        '<h3 class="admin-polid-section__subtitle"></h3>' +
        '<button type="button" class="admin-polid-section__remove" aria-label="Quitar">×</button>' +
        "</div>" +
        '<table class="admin-polid-table"><thead><tr><th></th><th></th></tr></thead><tbody>' +
        rowsHtml +
        "</tbody></table>";

      section.querySelector(".admin-polid-section__subtitle").textContent = subt;
      const ths = section.querySelectorAll("th");
      ths[0].textContent = c1;
      ths[1].textContent = c2;
      const trs = section.querySelectorAll("tbody tr");
      trs.forEach((tr, i) => {
        const tds = tr.querySelectorAll("td");
        tds[0].textContent = pendingRows[i][0];
        tds[1].textContent = pendingRows[i][1];
      });

      addRemovableSection(section);

      tablaSubtitulo.value = "";
      tablaCol1.value = "";
      tablaCol2.value = "";
      pendingRows = [];
      renderPendingRows();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
            alert("Diseño listo. Falta conectar esto a donde se guarde el contenido de Polideportivo.");
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        updateMeta();
        sectionsContainer.querySelectorAll(".admin-polid-section").forEach((el) => el.remove());
        if (emptyMsg) emptyMsg.hidden = false;
        pendingRows = [];
        renderPendingRows();
        setType("texto");
      }, 0);
    });

    setType("texto");
    updateMeta();
  }
  /* Polideportivo — Figuras importantes */

  function initFigurasForm() {
    const form = document.getElementById("formFiguras");
    if (!form) return;

    const fotoInput = document.getElementById("figuraFoto");
    const fotoThumb = document.getElementById("figuraFotoThumb");
    const nombreInput = document.getElementById("figuraNombre");
    const cargoInput = document.getElementById("figuraCargo");
    const telefonoInput = document.getElementById("figuraTelefono");
    const addBtn = document.getElementById("figuraAddBtn");
    const uploadAllBtn = document.getElementById("figuraUploadAllBtn");
    const grid = document.getElementById("previewFigurasGrid");
    const emptyMsg = document.getElementById("previewFigurasEmpty");

    let pendingPhotoData = "";

    fotoInput.addEventListener("change", () => {
      const file = fotoInput.files && fotoInput.files[0];
      if (!file) {
        pendingPhotoData = "";
        fotoThumb.classList.remove("has-image");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        pendingPhotoData = reader.result;
        fotoThumb.querySelector("img").src = pendingPhotoData;
        fotoThumb.classList.add("has-image");
      };
      reader.readAsDataURL(file);
    });

    addBtn.addEventListener("click", () => {
      const nombre = nombreInput.value.trim();
      const cargo = cargoInput.value.trim();
      const telefono = telefonoInput.value.trim();

      if (!pendingPhotoData || !nombre || !cargo) {
        alert("Elegí una foto y completá nombre y cargo antes de agregar.");
        return;
      }

      if (emptyMsg) emptyMsg.hidden = true;

      const item = document.createElement("article");
      item.className = "admin-figura-item";
      item.innerHTML =
        '<button type="button" class="admin-figura-item__remove" aria-label="Quitar">×</button>' +
        '<div class="admin-figura-item__photo"><img src="" alt=""></div>' +
        '<h3 class="admin-figura-item__name"></h3>' +
        '<p class="admin-figura-item__cargo"></p>';

      item.querySelector("img").src = pendingPhotoData;
      item.querySelector(".admin-figura-item__name").textContent = nombre;
      item.querySelector(".admin-figura-item__cargo").textContent = cargo;

      if (telefono) {
        const contacto = document.createElement("p");
        contacto.className = "admin-figura-item__contacto";
        contacto.textContent = telefono;
        item.appendChild(contacto);
      }

      item.querySelector(".admin-figura-item__remove").addEventListener("click", () => {
        item.remove();
        if (emptyMsg && !grid.querySelector(".admin-figura-item")) {
          emptyMsg.hidden = false;
        }
      });

      grid.appendChild(item);

      nombreInput.value = "";
      cargoInput.value = "";
      telefonoInput.value = "";
      fotoInput.value = "";
      pendingPhotoData = "";
      fotoThumb.classList.remove("has-image");
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        pendingPhotoData = "";
        fotoThumb.classList.remove("has-image");
      }, 0);
    });

    if (uploadAllBtn) {
      uploadAllBtn.addEventListener("click", () => {
                alert("Diseño listo. Falta conectar esto a donde se guarden las figuras del Polideportivo.");
      });
    }
  }

  /* Polideportivo — Actividades: texto arriba + tarjetas de actividad */

  function initActividadesForm() {
    const form = document.getElementById("formActividades");
    if (!form) return;

    const introInput = document.getElementById("actividadesIntro");
    const previewIntro = document.getElementById("previewActividadesIntro");

    const imagenInput = document.getElementById("actividadImagen");
    const imagenThumb = document.getElementById("actividadImagenThumb");
    const nombreInput = document.getElementById("actividadNombre");
    const instructorInput = document.getElementById("actividadInstructor");
    const fechasInput = document.getElementById("actividadFechas");
    const descripcionInput = document.getElementById("actividadDescripcion");
    const addBtn = document.getElementById("actividadAddBtn");
    const uploadAllBtn = document.getElementById("actividadUploadAllBtn");

    const grid = document.getElementById("previewActividadesGrid");
    const emptyMsg = document.getElementById("previewActividadesEmpty");

    let pendingImageData = "";

    function updateIntro() {
      previewIntro.textContent = introInput.value.trim() || "Texto arriba de las actividades.";
    }

    introInput.addEventListener("input", updateIntro);

    imagenInput.addEventListener("change", () => {
      const file = imagenInput.files && imagenInput.files[0];
      if (!file) {
        pendingImageData = "";
        imagenThumb.classList.remove("has-image");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        pendingImageData = reader.result;
        imagenThumb.querySelector("img").src = pendingImageData;
        imagenThumb.classList.add("has-image");
      };
      reader.readAsDataURL(file);
    });

    addBtn.addEventListener("click", () => {
      const nombre = nombreInput.value.trim();
      const instructor = instructorInput.value.trim();
      const fechas = fechasInput.value.trim();
      const descripcion = descripcionInput.value.trim();

      if (!pendingImageData || !nombre || !descripcion) {
        alert("Elegí una imagen y completá al menos el nombre y la descripción antes de agregar.");
        return;
      }

      if (emptyMsg) emptyMsg.hidden = true;

      const item = document.createElement("article");
      item.className = "admin-actividad-item";

      let html =
        '<button type="button" class="admin-actividad-item__remove" aria-label="Quitar">×</button>' +
        '<div class="admin-actividad-item__image"><img src="" alt=""></div>' +
        '<div class="admin-actividad-item__body">' +
        '<h3 class="admin-actividad-item__title"></h3>';

      if (instructor) {
        html += '<p class="admin-actividad-item__instructor"><strong>Instructor:</strong> <span class="admin-actividad-item__instructor-name"></span></p>';
      } else {
        html += '<p class="admin-actividad-item__instructor admin-actividad-item__instructor--pending">Instructor a confirmar</p>';
      }

      if (fechas) {
        html += '<span class="admin-actividad-item__schedule"></span>';
      }

      html += '<p class="admin-actividad-item__text"></p></div>';

      item.innerHTML = html;

      item.querySelector(".admin-actividad-item__image img").src = pendingImageData;
      item.querySelector(".admin-actividad-item__title").textContent = nombre;
      if (instructor) {
        item.querySelector(".admin-actividad-item__instructor-name").textContent = instructor;
      }
      if (fechas) {
        item.querySelector(".admin-actividad-item__schedule").textContent = fechas;
      }
      item.querySelector(".admin-actividad-item__text").textContent = descripcion;

      item.querySelector(".admin-actividad-item__remove").addEventListener("click", () => {
        item.remove();
        if (emptyMsg && !grid.querySelector(".admin-actividad-item")) {
          emptyMsg.hidden = false;
        }
      });

      grid.appendChild(item);

      nombreInput.value = "";
      instructorInput.value = "";
      fechasInput.value = "";
      descripcionInput.value = "";
      imagenInput.value = "";
      pendingImageData = "";
      imagenThumb.classList.remove("has-image");
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        updateIntro();
        pendingImageData = "";
        imagenThumb.classList.remove("has-image");
      }, 0);
    });

    if (uploadAllBtn) {
      uploadAllBtn.addEventListener("click", () => {
                alert("Diseño listo. Falta conectar esto a donde se guarden las actividades del Polideportivo.");
      });
    }

    updateIntro();
  }

  /* Ofertas Educativas — grilla de ícono + texto */
  function initOfertaEducativaForm() {
    const form = document.getElementById("formOfertaEducativa");
    if (!form) return;

    const iconoInput = document.getElementById("ofertaIcono");
    const iconoThumb = document.getElementById("ofertaIconoThumb");
    const nombreInput = document.getElementById("ofertaNombre");
    const addBtn = document.getElementById("ofertaAddBtn");
    const grid = document.getElementById("previewOfertasGrid");
    const emptyMsg = document.getElementById("previewOfertasEmpty");

    let pendingIconData = "";

    iconoInput.addEventListener("change", () => {
      const file = iconoInput.files && iconoInput.files[0];
      if (!file) {
        pendingIconData = "";
        iconoThumb.classList.remove("has-image");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        pendingIconData = reader.result;
        iconoThumb.querySelector("img").src = pendingIconData;
        iconoThumb.classList.add("has-image");
      };
      reader.readAsDataURL(file);
    });

    addBtn.addEventListener("click", () => {
      const nombre = nombreInput.value.trim();
      if (!pendingIconData || !nombre) {
        alert("Elegí un ícono y escribí el texto antes de agregar.");
        return;
      }

      if (emptyMsg) emptyMsg.hidden = true;

      const item = document.createElement("div");
      item.className = "admin-oferta-item";
      item.innerHTML =
        '<div class="admin-oferta-item__icon">' +
        '<img src="" alt="">' +
        '<button type="button" class="admin-oferta-item__remove" aria-label="Quitar">×</button>' +
        "</div>" +
        '<span class="admin-oferta-item__label"></span>';

      item.querySelector("img").src = pendingIconData;
      item.querySelector(".admin-oferta-item__label").textContent = nombre;
      item.querySelector(".admin-oferta-item__remove").addEventListener("click", () => {
        item.remove();
        if (emptyMsg && !grid.querySelector(".admin-oferta-item")) {
          emptyMsg.hidden = false;
        }
      });

      grid.appendChild(item);

      nombreInput.value = "";
      iconoInput.value = "";
      pendingIconData = "";
      iconoThumb.classList.remove("has-image");
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
            alert("Diseño listo. Falta conectar esto a donde se guarden las Ofertas Educativas.");
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        grid.querySelectorAll(".admin-oferta-item").forEach((el) => el.remove());
        if (emptyMsg) emptyMsg.hidden = false;
        pendingIconData = "";
        iconoThumb.classList.remove("has-image");
      }, 0);
    });
  }

  /* Ver Usuarios — tablas listas para conectar con SQL */
  function initUsuariosView() {
    const tabButtons = document.querySelectorAll("[data-users-tab]");
    const panelEstudiantes = document.getElementById("panel-estudiantes");
    const panelAdmins = document.getElementById("panel-admins");
    const searchInput = document.getElementById("usuariosSearch");
    const tbodyEstudiantes = document.getElementById("tbodyEstudiantes");
    const tbodyAdmins = document.getElementById("tbodyAdmins");
    const estudiantesEmpty = document.getElementById("estudiantesEmpty");
    const adminsEmpty = document.getElementById("adminsEmpty");

    if (!tabButtons.length || !tbodyEstudiantes || !tbodyAdmins) return;

    const API_ESTUDIANTES = "/api/alumnos";
    const API_ADMINS = "/api/administradores";

    const estudiantesEjemplo = [
      { id_usuario: 101, cedula: "12345678", nombre_completo: "María Fernández López", email: "maria.fernandez@email.com", pais: "Uruguay", fecha_registro: "2025-03-14", curso_actual: "BT - Informática" },
      { id_usuario: 102, cedula: "23456789", nombre_completo: "Juan Pablo Rodríguez", email: "juan.rodriguez@email.com", pais: "Uruguay", fecha_registro: "2025-04-02", curso_actual: "Ciclo Básico" },
      { id_usuario: 103, cedula: "34567890", nombre_completo: "Camila Suárez", email: "camila.suarez@email.com", pais: "Argentina", fecha_registro: "2025-05-20", curso_actual: "BTP - Mecánica" },
    ];

    const adminsEjemplo = [
      { id_usuario: 1, cedula: "45678901", nombre_completo: "Gabriel Chaves", email: "gchaves@utu.edu.uy", pais: "Uruguay", fecha_registro: "2024-01-10", cargo: "Director" },
      { id_usuario: 2, cedula: "56789012", nombre_completo: "Ana Belén Martínez", email: "abmartinez@utu.edu.uy", pais: "Uruguay", fecha_registro: "2024-02-15", cargo: "Secretaría" },
    ];

    function renderRow(cells) {
      const tr = document.createElement("tr");
      cells.forEach((text) => {
        const td = document.createElement("td");
        td.textContent = text ?? "—";
        tr.appendChild(td);
      });
      return tr;
    }

    function renderEstudiantes(list) {
      tbodyEstudiantes.innerHTML = "";
      list.forEach((user) => {
        tbodyEstudiantes.appendChild(
          renderRow([
            user.id_usuario,
            user.cedula,
            user.nombre_completo,
            user.email,
            user.pais,
            user.fecha_registro,
            user.curso_actual,
          ])
        );
      });
      if (estudiantesEmpty) estudiantesEmpty.hidden = list.length > 0;
    }

    function renderAdmins(list) {
      tbodyAdmins.innerHTML = "";
      list.forEach((user) => {
        tbodyAdmins.appendChild(
          renderRow([
            user.id_usuario,
            user.cedula,
            user.nombre_completo,
            user.email,
            user.pais,
            user.fecha_registro,
            user.cargo,
          ])
        );
      });
      if (adminsEmpty) adminsEmpty.hidden = list.length > 0;
    }

    async function loadUsuarios() {
      try {
        const [resEst, resAdm] = await Promise.all([
          fetch(API_ESTUDIANTES),
          fetch(API_ADMINS),
        ]);

        if (resEst.ok) {
          const data = await resEst.json();
          renderEstudiantes(Array.isArray(data) ? data : data.estudiantes || []);
        } else {
          renderEstudiantes(estudiantesEjemplo);
        }

        if (resAdm.ok) {
          const data = await resAdm.json();
          renderAdmins(Array.isArray(data) ? data : data.administradores || []);
        } else {
          renderAdmins(adminsEjemplo);
        }
      } catch {
        renderEstudiantes(estudiantesEjemplo);
        renderAdmins(adminsEjemplo);
      }
    }

    function setActiveTab(tab) {
      const isEstudiantes = tab === "estudiantes";
      tabButtons.forEach((btn) => {
        const active = btn.dataset.usersTab === tab;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });
      if (panelEstudiantes) panelEstudiantes.hidden = !isEstudiantes;
      if (panelAdmins) panelAdmins.hidden = isEstudiantes;
      if (searchInput) searchInput.value = "";
      filterRows("");
    }

    function filterRows(query) {
      const activePanel = panelEstudiantes && !panelEstudiantes.hidden ? panelEstudiantes : panelAdmins;
      if (!activePanel) return;
      const normalized = query.trim().toLowerCase();
      activePanel.querySelectorAll("tbody tr").forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.classList.toggle("is-hidden", normalized !== "" && !text.includes(normalized));
      });
    }

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => setActiveTab(btn.dataset.usersTab));
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => filterRows(searchInput.value));
    }

    loadUsuarios();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initViewSwitching();
    initMobileSidebar();
    initNavToggles();
    initLangToggle();
    initDashboardCharts();
    initEventoForm();
    initNoticiaForm();
    initLaboratorioForm();
    initOfertaEducativaForm();
    initNormativaForm();
    initAnexoEditorForm();
    initInstitucionalForm();
    initPolideportivoForm();
    initFigurasForm();
    initActividadesForm();
    initUsuariosView();
  });
})();