document.addEventListener('DOMContentLoaded', function() {
    // Estado global de la aplicación
    const estado = {
        entradas: [],
        salidas: [],
        condiciones: []
    };

    // Funciones para gestionar el estado global
    function guardarEstado() {
        localStorage.setItem('plcSolverState', JSON.stringify(estado));
    }

    function cargarEstado() {
        const estadoGuardado = localStorage.getItem('plcSolverState');
        
        if (estadoGuardado) {
            const estadoObj = JSON.parse(estadoGuardado);
            
            estado.entradas = estadoObj.entradas || [];
            estado.salidas = estadoObj.salidas || [];
            estado.condiciones = estadoObj.condiciones || [];
            
            return true;
        }
        
        return false;
    }

    // Elementos DOM principales
    const btnGenerar = document.getElementById('btn-generar');
    const btnReset = document.getElementById('btn-reset');
    const btnExportar = document.getElementById('btn-exportar');
    const diagramaLadder = document.getElementById('diagrama-ladder');
    const expresionMinimizada = document.getElementById('expresion-minimizada');
    
    // Elementos DOM para módulos
    const elementosDOM = {
        btnAgregarEntrada: document.getElementById('btn-agregar-entrada'),
        entradasCuerpo: document.getElementById('entradas-cuerpo'),
        
        btnAgregarSalida: document.getElementById('btn-agregar-salida'),
        salidasCuerpo: document.getElementById('salidas-cuerpo'),
        
        btnAgregarCondicion: document.getElementById('btn-agregar-condicion'),
        condicionesContainer: document.getElementById('condiciones-container'),
        modalCondicion: document.getElementById('modal-condicion'),
        btnGuardarCondicion: document.getElementById('btn-guardar-condicion'),
        btnCancelarCondicion: document.getElementById('btn-cancelar-condicion'),
        condicionSalida: document.getElementById('condicion-salida'),
        condicionEntradasContainer: document.getElementById('condicion-entradas-container'),
        btnAgregarTermino: document.getElementById('btn-agregar-termino')
    };

    // Inicializar los módulos
    window.generarId = generarId; // Función utilitaria compartida con los módulos
    window.guardarEstado = guardarEstado; // Función compartida para guardar el estado

    // Inicializar los módulos con el estado y los elementos DOM
    inputTable.init(estado, elementosDOM);
    outputTable.init(estado, elementosDOM);
    conditions.init(estado, elementosDOM);

    // Inicialización principal
    function init() {
        // Asignar eventos a botones principales
        btnGenerar.addEventListener('click', generarDiagramaLadder);
        btnReset.addEventListener('click', resetearAplicacion);
        btnExportar.addEventListener('click', exportarDiagrama);
        
        // Intentar cargar estado guardado, si no existe crear valores por defecto
        if (!cargarEstado()) {
            inputTable.agregarFilaEntrada(); // Agregar una entrada por defecto
            outputTable.agregarFilaSalida(); // Agregar una salida por defecto
        } else {
            // Renderizar los elementos con el estado cargado
            inputTable.renderizarEntradas();
            outputTable.renderizarSalidas();
            conditions.renderizarCondiciones();
        }
    }

    // Funciones para diagrama Ladder
    async function generarDiagramaLadder() {
        if (estado.condiciones.length === 0) {
            alert('Debes definir al menos una condición para generar el diagrama.');
            return;
        }
        
        // Preparar los datos para el backend
        const datos = {
            entradas: estado.entradas,
            salidas: estado.salidas,
            condiciones: estado.condiciones
        };
        
        try {
            // Mostrar indicador de carga
            diagramaLadder.textContent = "Procesando...";
            expresionMinimizada.textContent = "Procesando...";
            
            // Llamar al backend
            const respuesta = await llamarAPI(datos);
            
            // Actualizar expresión minimizada
            expresionMinimizada.textContent = respuesta.expresion;
            
            // Limpiar el contenedor original de texto
            diagramaLadder.style.display = 'none';
            
            // Mostrar el contenedor del diagrama gráfico
            document.getElementById('ladderDiagram').style.display = 'block';
            
            // Crear el diagrama Ladder visual con D3.js
            window.ladderGraph = createLadderDiagram("ladderDiagram", datos);
            
            // Habilitar botón de exportar
            btnExportar.disabled = false;
            
            console.log("Diagrama generado correctamente");
        } catch (error) {
            console.error('Error al generar el diagrama:', error);
            diagramaLadder.textContent = "Error al generar el diagrama. Revisa la consola para más detalles.";
            expresionMinimizada.textContent = "Error: " + error.message;
            alert('Error al generar el diagrama: ' + error.message);
        }
    }

    // Función para llamar a la API REST
    async function llamarAPI(datos) {
        try {
            const response = await fetch('http://localhost:8080/api/optimizar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error en la llamada a la API:', error);
            throw new Error('No se pudo conectar al servidor: ' + error.message);
        }
    }

    // Función para exportar el diagrama
    function exportarDiagrama() {
        try {
            const formatoExportacion = document.getElementById('formato-exportacion').value;
            console.log("Formato seleccionado:", formatoExportacion);
            
            const svg = document.querySelector('#ladderDiagram svg');
            
            if (!svg) {
                alert('No hay un diagrama para exportar');
                return;
            }
            
            if (formatoExportacion === 'png' || formatoExportacion === 'jpg') {
                // Clonar SVG para manipulación
                const clonedSvg = svg.cloneNode(true);
                const container = document.createElement('div');
                container.style.display = 'none';
                container.appendChild(clonedSvg);
                document.body.appendChild(container);
                
                // Configurar para exportación
                clonedSvg.setAttribute('width', svg.getBoundingClientRect().width);
                clonedSvg.setAttribute('height', svg.getBoundingClientRect().height);
                
                // Convertir a imagen
                const svgData = new XMLSerializer().serializeToString(clonedSvg);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Configurar canvas
                const width = clonedSvg.width.baseVal.value;
                const height = clonedSvg.height.baseVal.value;
                canvas.width = width;
                canvas.height = height;
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, width, height);
                
                // Dibujar SVG en canvas
                const img = new Image();
                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                    
                    // Crear enlace de descarga
                    canvas.toBlob(function(blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `diagrama_ladder.${formatoExportacion}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        // Limpiar el DOM
                        document.body.removeChild(container);
                    }, `image/${formatoExportacion}`, 1);
                };
                
                const svgBlob = new Blob([svgData], {type: 'image/svg+xml'});
                const url = URL.createObjectURL(svgBlob);
                img.src = url;
            } else if (formatoExportacion === 'txt') {
                // Exportar como texto
                const texto = expresionMinimizada.textContent;
                const blob = new Blob([texto], {type: 'text/plain'});
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = 'diagrama_ladder.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error al exportar el diagrama:', error);
            alert('Error al exportar el diagrama: ' + error.message);
        }
    }

    // Función para resetear la aplicación
    function resetearAplicacion() {
        if (confirm('¿Estás seguro de que deseas reiniciar la aplicación? Se perderán todos los datos.')) {
            // Limpiar estado
            estado.entradas = [];
            estado.salidas = [];
            estado.condiciones = [];
            
            // Limpiar localStorage
            localStorage.removeItem('plcSolverState');
            
            // Limpiar UI
            inputTable.renderizarEntradas();
            outputTable.renderizarSalidas();
            conditions.renderizarCondiciones();
            
            // Agregar una entrada y salida por defecto
            inputTable.agregarFilaEntrada();
            outputTable.agregarFilaSalida();
            
            // Limpiar resultados
            diagramaLadder.textContent = "Esperando generación de diagrama...";
            expresionMinimizada.textContent = "Esperando generación de diagrama...";
            diagramaLadder.style.display = 'block';
            document.getElementById('ladderDiagram').style.display = 'none';
            document.getElementById('ladderDiagram').innerHTML = '';
            
            btnExportar.disabled = true;
        }
    }

    // Función auxiliar para generar IDs únicos
    function generarId(prefijo) {
        return prefijo + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }

    // Iniciar la aplicación
    init();
});
