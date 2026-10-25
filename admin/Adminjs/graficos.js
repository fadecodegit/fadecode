/**
 * graficos.js
 * -----------------------------------------------------------
 * Dibuja los gráficos de la página Estadísticas del panel
 * (admin/Estadisticas.html) usando Chart.js. Los valores son los
 * mismos que muestran las leyendas del HTML, por eso la
 * leyenda propia de Chart.js queda desactivada.
 * -----------------------------------------------------------
 */

// Los colores salen de las variables de Admincss/Estadisticas.css (--color-chart-*)
const estilos = getComputedStyle(document.documentElement);
const color = (nombre) => estilos.getPropertyValue(`--color-chart-${nombre}`).trim();

const COLORES = {
    azul: color("blue"),
    verde: color("green"),
    naranja: color("orange"),
    mostaza: color("mustard"),
    bordo: color("maroon"),
    violeta: color("purple")
};

// Opciones comunes: sin leyenda (ya está en el HTML) y tooltip con porcentaje
const opcionesBase = {
    responsive: true,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (contexto) => {
                    const valores = contexto.dataset.data;
                    const total = valores.reduce((suma, valor) => suma + valor, 0);
                    const valor = contexto.raw;
                    const porcentaje = Math.round((valor / total) * 100);
                    const nombre = contexto.dataset.label || contexto.label;
                    return `${nombre}: ${valor} (${porcentaje}%)`;
                }
            }
        }
    }
};

// Crea una dona en el canvas indicado
function crearDona(idCanvas, etiquetas, valores, colores) {
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return;

    new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: etiquetas,
            datasets: [{
                data: valores,
                backgroundColor: colores,
                borderWidth: 0
            }]
        },
        options: { ...opcionesBase, cutout: "60%" }
    });
}

// Estudiantes por curso
crearDona(
    "chartEstudiantesPorCurso",
    ["BT", "EMB", "BTP", "CTT", "FPB", "CPI", "Tecnólogo"],
    [413, 297, 216, 95, 85, 25, 15],
    [COLORES.azul, COLORES.verde, COLORES.naranja, COLORES.mostaza, COLORES.bordo, COLORES.violeta, COLORES.verde]
);

// Docentes por situación laboral: una sola barra horizontal apilada
const canvasLaboral = document.getElementById("chartDocentesLaboral");
if (canvasLaboral) {
    const situaciones = [
        { nombre: "Interinos", cantidad: 154, color: COLORES.azul },
        { nombre: "Efectivos", cantidad: 29, color: COLORES.verde },
        { nombre: "Suplentes", cantidad: 26, color: COLORES.naranja }
    ];
    const totalDocentes = situaciones.reduce((suma, s) => suma + s.cantidad, 0);

    new Chart(canvasLaboral, {
        type: "bar",
        data: {
            labels: ["Docentes"],
            datasets: situaciones.map((s) => ({
                label: s.nombre,
                data: [s.cantidad],
                backgroundColor: s.color,
                borderWidth: 0
            }))
        },
        options: {
            ...opcionesBase,
            indexAxis: "y",
            plugins: {
                ...opcionesBase.plugins,
                tooltip: {
                    callbacks: {
                        label: (contexto) => {
                            const porcentaje = Math.round((contexto.raw / totalDocentes) * 100);
                            return `${contexto.dataset.label}: ${contexto.raw} (${porcentaje}%)`;
                        }
                    }
                }
            },
            scales: {
                x: { stacked: true, display: false, max: totalDocentes },
                y: { stacked: true, display: false }
            }
        }
    });
}

// Distribución por género (hombres / mujeres)
const coloresGenero = [COLORES.azul, COLORES.naranja];
crearDona("chartGeneroDocentes", ["Hombres", "Mujeres"], [92, 117], coloresGenero);
crearDona("chartGeneroNoDocentes", ["Hombres", "Mujeres"], [3, 12], coloresGenero);
crearDona("chartGeneroIndirecta", ["Hombres", "Mujeres"], [7, 12], coloresGenero);
