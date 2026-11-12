// Protección de los formularios: agrega a cada envío una clave secreta de la sesión,
// para que el servidor sepa que el pedido sale de este sitio y no de otro.
// Se carga primero en todas las páginas y funciona solo, sin tocar los formularios.

(function () {
    "use strict";

    const scriptActual = document.currentScript;
    if (!scriptActual || !window.fetch) return;

    // Ubica la carpeta principal del sitio
    const baseBackend = new URL("../../backend/", scriptActual.src).href;
    const fetchOriginal = window.fetch.bind(window);
    let promesaToken = null;
    let tokenActual = null;

    function pedirToken(forzar) {
        if (!promesaToken || forzar) {
            promesaToken = fetchOriginal(baseBackend + "csrf.php", { credentials: "same-origin", cache: "no-store" })
                .then((respuesta) => respuesta.json())
                .then((datos) => {
                    tokenActual = datos.token || null;
                    return tokenActual;
                })
                .catch((error) => {
                    promesaToken = null;
                    throw error;
                });
        }
        return promesaToken;
    }

    function esPeticionABackend(entrada) {
        const url = typeof entrada === "string" ? entrada : (entrada && entrada.url) || String(entrada);
        try {
            return new URL(url, document.baseURI).href.startsWith(baseBackend);
        } catch {
            return false;
        }
    }

    function metodoDe(entrada, opciones) {
        const metodo = (opciones && opciones.method) || (entrada && entrada.method) || "GET";
        return String(metodo).toUpperCase();
    }

    window.fetch = async function (entrada, opciones) {
        const metodo = metodoDe(entrada, opciones);
        if (["GET", "HEAD", "OPTIONS"].includes(metodo) || !esPeticionABackend(entrada)) {
            return fetchOriginal(entrada, opciones);
        }

        const enviar = async (forzarToken) => {
            const token = await pedirToken(forzarToken);
            const cabeceras = new Headers((opciones && opciones.headers) || (entrada && entrada.headers) || undefined);
            cabeceras.set("X-CSRF-Token", token);
            return fetchOriginal(entrada, { ...(opciones || {}), headers: cabeceras, credentials: "same-origin" });
        };

        const respuesta = await enviar(false);
        if (respuesta.status === 403) {
            // Si la clave venció, pide una nueva y vuelve a intentar una vez
            const datos = await respuesta.clone().json().catch(() => null);
            if (datos && datos.error === "csrf_invalido") {
                return enviar(true);
            }
        }
        return respuesta;
    };

    // Formularios que se envían sin JavaScript: se les agrega la clave en un campo oculto
    document.addEventListener("submit", (evento) => {
        const formulario = evento.target;
        if (!(formulario instanceof HTMLFormElement) || !tokenActual) return;
        if ((formulario.getAttribute("method") || "get").toLowerCase() === "get") return;

        const accion = formulario.getAttribute("action") || "";
        if (!esPeticionABackend(new URL(accion, document.baseURI).href)) return;

        let campo = formulario.querySelector('input[name="csrf_token"]');
        if (!campo) {
            campo = document.createElement("input");
            campo.type = "hidden";
            campo.name = "csrf_token";
            formulario.appendChild(campo);
        }
        campo.value = tokenActual;
    }, true);

    // Pide la clave apenas carga la página, para tenerla lista
    pedirToken(false).catch(() => {});
})();
