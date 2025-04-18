// frontend/public/js/ladderDiagram.js

function withTimeout(milliseconds, promise) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Tiempo de operación excedido (${milliseconds}ms)`));
        }, milliseconds);
        
        promise.then(value => {
            clearTimeout(timer);
            resolve(value);
        }).catch(error => {
            clearTimeout(timer);
            reject(error);
        });
    });
}

if (typeof mxGraph === 'undefined') {
    console.error('¡Error! mxGraph no está cargado correctamente.');
    console.log('Variables globales disponibles:', Object.keys(window));
}

function createLadderDiagram(containerId, data) {
    // Comprobar si mxGraph está disponible
    if (typeof mxGraph === 'undefined') {
        console.error('mxGraph no está cargado');
        return;
    }
    
    // Obtener el contenedor
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Contenedor no encontrado:', containerId);
        return;
    }
    
    // Limpiar el contenedor
    container.innerHTML = '';
    
    // Establecer una altura mínima basada en el número de condiciones
    const minHeight = Math.max(800, (data.condiciones.length * 300));
    container.style.height = minHeight + 'px';
    container.style.overflow = 'auto'; // Permitir desplazamiento en ambas direcciones
    
    // Configurar mxGraph
    if (!mxClient.isBrowserSupported()) {
        container.innerHTML = 'El navegador no es compatible con mxGraph';
        return;
    }
    
    // Crear el editor de gráficos
    const graph = new mxGraph(container);
    
    // Desactivar eventos temporalmente
    graph.getView().setEventsEnabled(false);
    
    // Configuración del gráfico
    graph.setConnectable(false);
    graph.setCellsEditable(false);
    graph.setCellsMovable(false);
    graph.setCellsResizable(false);
    graph.setCellsDeletable(false);
    graph.setDropEnabled(false);
    graph.setPanning(true);
    graph.centerZoom = false;
    graph.setHtmlLabels(true);
    
    // Añadir zoom con rueda del ratón
    graph.mouseWheelEnabled = true;
    
    // AJUSTE CRÍTICO: Eliminar flechas en las conexiones
    const edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
    edgeStyle[mxConstants.STYLE_ROUNDED] = false;
    edgeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
    edgeStyle[mxConstants.STYLE_STROKECOLOR] = '#333333';
    edgeStyle[mxConstants.STYLE_EDGE] = mxEdgeStyle.OrthConnector;
    edgeStyle[mxConstants.STYLE_ENDARROW] = mxConstants.NONE; // Eliminar flechas
    edgeStyle[mxConstants.STYLE_STARTARROW] = mxConstants.NONE; // Eliminar flechas
    
    // Crear estilos para los elementos de Ladder
    const railStyle = 'strokeWidth=3;strokeColor=#333333;';
    
    // Crear parentVertex como contenedor principal
    const parent = graph.getDefaultParent();
    
    // Iniciar modificación del modelo
    graph.getModel().beginUpdate();
    
    try {
        // Dimensiones y espaciado
        const railHeight = 100;  // Altura entre rieles horizontales
        const contactWidth = 80;  // Aumentado de 60 a 80
        const contactSpacing = 60;  // Aumentado de 40 a 60
        const railLeftMargin = 70;  // Aumentado de 50 a 70
        const railRightMargin = 120;  // Aumentado de 50 a 120 para dar más espacio a la bobina
        const marginTop = 40;  // Margen superior

        
        // Ancho total disponible
        const minWidth = 1200;  // Ancho mínimo garantizado
        const totalWidth = Math.max(minWidth, container.offsetWidth - railLeftMargin - railRightMargin);
        
        // Para cada condición (una por salida)
        data.condiciones.forEach((condicion, condIdx) => {
            const salida = data.salidas.find(s => s.id === condicion.salidaId);
            const verticalSpacing = 150; // Espacio adicional entre condiciones
            const startY = marginTop + condIdx * (railHeight * (condicion.terminos.length + 1) + verticalSpacing);
            
            // Rieles verticales (bus de alimentación izquierdo)
            const leftBus = graph.insertVertex(
                parent, null, '', 
                railLeftMargin, startY, 
                5, (condicion.terminos.length * railHeight) + railHeight/2, 
                railStyle
            );
            
            // Riel vertical derecho (cerca de la bobina)
            const rightBus = graph.insertVertex(
                parent, null, '', 
                totalWidth - railRightMargin, startY, 
                5, (condicion.terminos.length * railHeight) + railHeight/2, 
                railStyle
            );
            
            // Posición central para la bobina
            const coilY = startY + railHeight/2; // Alinear con el primer término
            
            // Crear la etiqueta de salida
            graph.insertVertex(
                parent, null, 
                `<div style="text-align:center;">
                    <div style="font-size:11px;color:#444;">${salida.direccion}</div>
                    <div style="font-weight:bold;">${salida.nombre}</div>
                </div>`, 
                totalWidth - railRightMargin - 120, coilY - 40, 
                100, 30, 'strokeColor=none;fillColor=none;'
            );
            
            // Crear la bobina (dibujo manual más claro)
            const coilX = totalWidth - railRightMargin - 100; // Mover más a la izquierda

            // Círculo de la bobina con paréntesis claros
            const coil = graph.insertVertex(
                parent, null, '( )', 
                coilX, coilY - 20, 
                50, 40, 'shape=ellipse;perimeter=ellipsePerimeter;strokeWidth=2;fillColor=white;fontStyle=1;fontSize=16;align=center;'
            );
            
            // Línea horizontal conectando la bobina con el riel derecho
            const coilRightConn = graph.insertVertex(
                parent, null, '', 
                coilX + 40, coilY, 
                totalWidth - railRightMargin - (coilX + 40), 3, 
                railStyle
            );
            
            // Crear un array para almacenar los rieles horizontales
            const horizontalRails = [];
            
            // Para cada término (OR)
            condicion.terminos.forEach((termino, termIdx) => {
                const railY = startY + termIdx * railHeight;
                
                // Rail horizontal principal (línea del término)
                const leftRail = graph.insertVertex(
                    parent, null, '',
                    railLeftMargin + 5, railY + railHeight/2,
                    termIdx === 0 ? coilX - (railLeftMargin + 5) : coilX - 100 - (railLeftMargin + 5), 3,
                    railStyle
                );
                
                // Guardar referencia al rail horizontal en el array
                horizontalRails.push(leftRail);
                
                // Diferentes conexiones según sea el primer término o no
                if (termIdx === 0) {
                    // Para el primer término, conexión directa a la bobina
                    // No se necesita crear conexiones adicionales
                } else {
                    // Línea vertical de conexión (forma la estructura de escalera)
                    const vertConn = graph.insertVertex(
                        parent, null, '',
                        coilX - 100, startY + railHeight/2, // Inicia desde la altura del primer término
                        3, railY + railHeight/2 - (startY + railHeight/2), // Se extiende hasta el término actual
                        railStyle
                    );
                    
                    // Conexión horizontal desde el riel del término hasta la línea vertical
                    const horizConn = graph.insertVertex(
                        parent, null, '',
                        leftRail.geometry.x + leftRail.geometry.width, railY + railHeight/2,
                        coilX - 100 - (leftRail.geometry.x + leftRail.geometry.width), 3,
                        railStyle
                    );
                }
                
                // Crear entradas (contactos en serie - AND)
                let lastContactEnd = railLeftMargin + 5; // Inicio desde el riel izquierdo
                
                // Modifica la sección donde se calculan las posiciones de los contactos:
                // Calcular mejor el espacio disponible para contactos
                const spaceForContacts = coilX - (railLeftMargin + 30);
                const totalContactsInTerm = termino.entradas.length;

                // Distribuir mejor los contactos si hay muchos
                const contactsWidth = (totalContactsInTerm * contactWidth) + ((totalContactsInTerm - 1) * contactSpacing);
                const scaleFactorIfNeeded = contactsWidth > spaceForContacts ? spaceForContacts / contactsWidth : 1;
                const adjustedContactWidth = contactWidth * scaleFactorIfNeeded;
                const adjustedSpacing = contactSpacing * scaleFactorIfNeeded;

                termino.entradas.forEach((entrada, entradaIdx) => {
                    const entradaObj = data.entradas.find(e => e.id === entrada.id);
                    const invertida = (entrada.estado === 'desactivado');
                    const normalmente = entradaObj.normalmente || 'abierto';
                    const usarInvertida = (normalmente === 'abierto') ? invertida : !invertida;
                    
                    // Posición para este contacto
                    const spacing = entradaIdx > 0 ? adjustedSpacing : 20;
                    const posX = lastContactEnd + spacing;
                    const contactHeight = 40;
                    
                    // Etiqueta del contacto (encima)
                    graph.insertVertex(
                        parent, null,
                        `<div style="text-align:center;">
                            <div style="font-size:11px;color:#444;">${entradaObj.direccion}</div>
                            <div style="font-weight:bold;">${entradaObj.nombre}</div>
                        </div>`,
                        posX, railY + railHeight/2 - contactHeight - 10,
                        adjustedContactWidth, 30,
                        'strokeColor=none;fillColor=none;'
                    );
                    
                    // Dibujar el contacto manualmente para mejor control
                    // Líneas conectoras laterales
                    graph.insertVertex(
                        parent, null, '',
                        posX, railY + railHeight/2,
                        10, 3,
                        railStyle
                    );
                    
                    graph.insertVertex(
                        parent, null, '',
                        posX + adjustedContactWidth - 10, railY + railHeight/2,
                        10, 3,
                        railStyle
                    );
                    
                    // Rectángulo del contacto con corchetes visibles [ ]
                    const contactStyle = usarInvertida 
                        ? 'strokeWidth=2;fillColor=white;fontStyle=1;fontSize=14;align=center;verticalAlign=middle;' 
                        : 'strokeWidth=2;fillColor=white;fontStyle=1;fontSize=14;align=center;verticalAlign=middle;';

                    const contactLabel = usarInvertida ? '[/]' : '[ ]';

                    const contact = graph.insertVertex(
                        parent, null, contactLabel,
                        posX + 10, railY + railHeight/2 - 15,
                        adjustedContactWidth - 20, 30,
                        contactStyle
                    );
                    
                    // Actualizar la posición para el siguiente contacto
                    lastContactEnd = posX + adjustedContactWidth;
                });
            });
            
            // Conectar la bobina al riel horizontal del término del medio
            if (condicion.terminos.length === 1) {
                // Si solo hay un término, conectar directamente
                const leftRail = horizontalRails[0]; // Usar la referencia guardada
                
                graph.insertVertex(
                    parent, null, '',
                    leftRail.geometry.x + leftRail.geometry.width, coilY,
                    coilX - (leftRail.geometry.x + leftRail.geometry.width), 3,
                    railStyle
                );
            }

            // Agregar la conexión final desde la unión vertical a la bobina
            const finalConn = graph.insertVertex(
                parent, null, '',
                coilX - 100, coilY,
                100, 3,
                railStyle
            );
        });
    } finally {
        // Terminar actualización del modelo
        graph.getModel().endUpdate();
    }
    
    // Ajustar vista para que se vea todo el diagrama
    graph.fit(false, true, 20); // Mantener proporción, centrar, con margen

    // Reemplaza el código de ajuste de zoom con este:
    // Calcular mejor el factor de escala inicial
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const graphBounds = graph.getGraphBounds();
    const scaleX = (containerWidth - 40) / graphBounds.width;
    const scaleY = (containerHeight - 40) / graphBounds.height;
    const scale = Math.min(scaleX, scaleY, 1.0); // No hacer zoom in (máximo 1.0)

    if (scale < 1.0) {
        graph.zoomTo(scale);
    }

    // Centrar el diagrama
    graph.center(true);

    // Si el diagrama es muy grande, ajustar el zoom inicial
    if (graph.view.getScale() < 0.6) {
        graph.zoomTo(0.8);
    }
    
    // Añade esto después de la creación del diagrama:
    // Si el diagrama es más ancho que el contenedor, activar desplazamiento horizontal
    if (graph.getGraphBounds().width > container.offsetWidth) {
        container.style.overflowX = 'auto';
    }

    // Si el diagrama es más alto que el contenedor, activar desplazamiento vertical
    if (graph.getGraphBounds().height > container.offsetHeight) {
        container.style.overflowY = 'auto';
    }
    
    return graph;
}

// Función para exportar el diagrama como imagen
function exportLadderDiagram(graph, format) {
    if (!graph) {
        console.error('El gráfico no está inicializado');
        return null;
    }
    
    const bg = '#FFFFFF';
    const bounds = graph.getGraphBounds();
    const scale = 1.5; // Mayor escala para mejor calidad
    
    // Crear un canvas para la exportación
    const canvas = document.createElement('canvas');
    const w = Math.round(bounds.width * scale + 10);
    const h = Math.round(bounds.height * scale + 10);
    canvas.width = w;
    canvas.height = h;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    
    // Dibujar el diagrama en el canvas
    const svgRoot = graph.getSvg(bg, scale, 0, 0);
    const xml = new XMLSerializer().serializeToString(svgRoot);
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/' + (format === 'jpg' ? 'jpeg' : 'png')));
        };
        img.onerror = function(e) {
            reject(new Error('Error al generar la imagen: ' + e));
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
    });
}