// Botón PO / ES: traduce la página al portugués con Google
// y se mantiene al cambiar de página.

function idiomaActual() {
    return document.cookie.includes("googtrans=/es/pt") ? "pt" : "es";
}

function cambiarIdioma(idioma) {
    if (idioma === "pt") {
        document.cookie = "googtrans=/es/pt; path=/";
    } else {
        const vencida = "googtrans=; path=/; max-age=0";
        document.cookie = vencida;
        document.cookie = `${vencida}; domain=${location.hostname}`;
        document.cookie = `${vencida}; domain=.${location.hostname}`;
    }
    location.reload();
}

// Marca el idioma elegido y lo cambia al tocar el botón
document.querySelectorAll("[data-traductor]").forEach((boton) => {
    boton.querySelectorAll("[data-idioma]").forEach((opcion) => {
        opcion.classList.toggle("is-active", opcion.dataset.idioma === idiomaActual());
    });
    boton.addEventListener("click", () => cambiarIdioma(idiomaActual() === "es" ? "pt" : "es"));
});

// El traductor solo se carga si hay que mostrar la página en portugués
if (idiomaActual() === "pt") {
    const contenedor = document.createElement("div");
    contenedor.id = "traductor-google";
    contenedor.hidden = true;
    document.body.appendChild(contenedor);

    window.iniciarTraductor = () => {
        new google.translate.TranslateElement(
            { pageLanguage: "es", includedLanguages: "pt", autoDisplay: false },
            "traductor-google"
        );
    };

    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=iniciarTraductor";
    document.body.appendChild(script);
}
