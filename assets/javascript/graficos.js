// Dibuja los gráficos de Estadísticas, en el panel y en el sitio.

// Los colores cambian con el modo invierno
const VARIABLES = {
    azul: "blue",
    verde: "green",
    naranja: "orange",
    mostaza: "mustard",
    bordo: "maroon",
    violeta: "purple"
};

function colorDe(nombre) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(`--color-chart-${VARIABLES[nombre]}`).trim();
}

// Convierte el nombre de cada color en el color real
const pintar = (nombres) => Array.isArray(nombres) ? nombres.map(colorDe) : colorDe(nombres);

// Al pasar el mouse muestra el valor y su porcentaje
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

// Crea un gráfico de dona
function crearDona(idCanvas, etiquetas, valores, nombresColor) {
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return;

    new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: etiquetas,
            datasets: [{
                data: valores,
                nombresColor,
                backgroundColor: pintar(nombresColor),
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
    ["azul", "verde", "naranja", "mostaza", "bordo", "violeta", "verde"]
);

// Docentes por situación laboral
const canvasLaboral = document.getElementById("chartDocentesLaboral");
if (canvasLaboral) {
    const situaciones = [
        { nombre: "Interinos", cantidad: 154, color: "azul" },
        { nombre: "Efectivos", cantidad: 29, color: "verde" },
        { nombre: "Suplentes", cantidad: 26, color: "naranja" }
    ];
    const totalDocentes = situaciones.reduce((suma, s) => suma + s.cantidad, 0);

    new Chart(canvasLaboral, {
        type: "bar",
        data: {
            labels: ["Docentes"],
            datasets: situaciones.map((s) => ({
                label: s.nombre,
                data: [s.cantidad],
                nombresColor: s.color,
                backgroundColor: pintar(s.color),
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

// Hombres y mujeres por grupo
const coloresGenero = ["azul", "naranja"];
crearDona("chartGeneroDocentes", ["Hombres", "Mujeres"], [92, 117], coloresGenero);
crearDona("chartGeneroNoDocentes", ["Hombres", "Mujeres"], [3, 12], coloresGenero);
crearDona("chartGeneroIndirecta", ["Hombres", "Mujeres"], [7, 12], coloresGenero);

// Con el modo invierno se vuelven a pintar los gráficos
document.addEventListener("cambio-modo", () => {
    Object.values(Chart.instances).forEach((grafico) => {
        grafico.data.datasets.forEach((datos) => {
            datos.backgroundColor = pintar(datos.nombresColor);
        });
        grafico.update();
    });
});
