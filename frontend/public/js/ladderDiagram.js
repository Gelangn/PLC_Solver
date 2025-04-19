// frontend/public/js/ladderDiagram.js

function createLadderDiagram(containerId, data) {
    // Limpiar el contenedor
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    // Dimensiones y configuración
    const margin = { top: 40, right: 120, bottom: 40, left: 70 };
    const railHeight = 100;
    const contactWidth = 80;
    const contactHeight = 40;
    const contactSpacing = 60;
    
    // Calcular altura total necesaria
    const totalHeight = data.condiciones.reduce((acc, condicion) => 
        acc + (condicion.terminos.length * railHeight) + 50, 0);
    
    // Calcular ancho total necesario
    const maxContactsPerTerm = Math.max(...data.condiciones.map(c => 
        Math.max(...c.terminos.map(t => t.entradas.length))));
    const minWidth = margin.left + (maxContactsPerTerm * (contactWidth + contactSpacing)) + 200;
    
    // Crear el SVG con dimensiones adecuadas
    const svg = d3.select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", totalHeight + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${Math.max(minWidth, 800)} ${totalHeight + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Grupo principal con margen
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    // Función para añadir zoom
    const zoom = d3.zoom()
        .scaleExtent([0.5, 2])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
    
    svg.call(zoom);
    
    // Procesar cada condición
    let offsetY = 0;
    
    data.condiciones.forEach((condicion, condIdx) => {
        const salida = data.salidas.find(s => s.id === condicion.salidaId);
        const startY = offsetY;
        const conditionHeight = condicion.terminos.length * railHeight;
		
		
        // Crear el grupo para esta condición
        const conditionGroup = g.append("g")
		.attr("class", "condition")
		.attr("transform", `translate(0,${startY})`);
		
		// Calcular la posición del riel derecho
		const rightRailX = minWidth - margin.left - margin.right;
        
		// Posición de la bobina (más a la derecha)
        const coilY = railHeight / 2;
        const coilX = rightRailX - 60; // Cambiar de 80 a 60 para mover a la derecha
        
        // Calcular la posición X para la línea vertical común (punto de unión OR)
        let maxContactEndX = 0;

        // PRIMER PASO: Calcular la posición final del contacto más alejado entre todos los términos
        condicion.terminos.forEach(t => {
            const numContactos = t.entradas.length;
            const finalPos = 30 + (numContactos * (contactWidth + contactSpacing));
            if (finalPos > maxContactEndX) maxContactEndX = finalPos;
        });

        // Ajustar para considerar el ancho del último contacto y dejar espacio
        maxContactEndX = Math.max(maxContactEndX - contactSpacing + 30, coilX - 100);

        // Rieles verticales (bus de alimentación)
        conditionGroup.append("line")
            .attr("class", "rail")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", conditionHeight)
            .style("stroke", "#333")
            .style("stroke-width", 3);
            
        // Riel vertical derecho
        conditionGroup.append("line")
            .attr("class", "rail")
            .attr("x1", rightRailX)
            .attr("y1", 0)
            .attr("x2", rightRailX)
            .attr("y2", conditionHeight)
            .style("stroke", "#333")
            .style("stroke-width", 3);
        
 
        // Dibujar bobina
        const coilGroup = conditionGroup.append("g")
            .attr("transform", `translate(${coilX},${coilY})`);
        
		// Paréntesis izquierdo "(" más estrecho
		coilGroup.append("path")
			.attr("d", "M -8,20 A 8,22 0 0,1 -8,-20") // Reducido primer valor de 15 a 8
			.style("fill", "none")
			.style("stroke", "#333")
			.style("stroke-width", 2);
		
		// Paréntesis derecho ")" más estrecho  
		coilGroup.append("path")
			.attr("d", "M 8,-20 A 8,22 0 0,1 8,20") // Reducido primer valor de 15 a 8
			.style("fill", "none")
			.style("stroke", "#333")
			.style("stroke-width", 2);

        // Línea de conexión izquierda de la bobina
        coilGroup.append("line")
            .attr("x1", -25)
            .attr("y1", 0)
            .attr("x2", -15)
            .attr("y2", 0)
            .style("stroke", "#333")
            .style("stroke-width", 2);

        // Línea de conexión derecha de la bobina
        coilGroup.append("line")
            .attr("x1", 15)
            .attr("y1", 0)
            .attr("x2", 25)
            .attr("y2", 0)
            .style("stroke", "#333")
            .style("stroke-width", 2);

        // Etiqueta de dirección
        coilGroup.append("text")
            .attr("x", 0)
            .attr("y", -45)
            .style("text-anchor", "middle")
            .style("font-size", "11px")
			.style("fill", "#666")
            .text(salida.direccion);

        // Etiqueta nombre
        coilGroup.append("text")
            .attr("x", 0)
            .attr("y", -25)
            .style("text-anchor", "middle")
			.style("font-size", "12px")
            .style("font-weight", "bold")
            .text(salida.nombre);
            
        // Línea horizontal conectando bobina al riel derecho
        conditionGroup.append("line")
            .attr("x1", coilX + 20)
            .attr("y1", coilY)
            .attr("x2", rightRailX)
            .attr("y2", coilY)
            .style("stroke", "#333")
            .style("stroke-width", 2);
       
            
        // Procesar cada término (OR)
        condicion.terminos.forEach((termino, termIdx) => {
            const railY = termIdx * railHeight + railHeight / 2;
            
            // Añadir contactos (entradas AND en serie)
            let contactX = 30; // Posición inicial desde el riel
            const contactos = [];
            
            // Primera conexión desde el riel izquierdo hasta el primer contacto
            conditionGroup.append("line")
                .attr("class", "term-rail")
                .attr("x1", 0)
                .attr("y1", railY)
                .attr("x2", contactX)
                .attr("y2", railY)
                .style("stroke", "#333")
                .style("stroke-width", 2);
            
            // Procesar todos los contactos de este término
            termino.entradas.forEach((entrada, entradaIdx) => {
                const entradaObj = data.entradas.find(e => e.id === entrada.id);
                const invertida = (entrada.estado === 'desactivado');
                const normalmente = entradaObj.normalmente || 'abierto';
                const usarInvertida = (normalmente === 'abierto') ? invertida : !invertida;
                
                // Grupo para el contacto
                const contactGroup = conditionGroup.append("g")
                    .attr("transform", `translate(${contactX},${railY})`);
                
                // Línea izquierda del contacto
                contactGroup.append("line")
                    .attr("x1", 0)  
                    .attr("y1", 0)
                    .attr("x2", contactWidth/3)
                    .attr("y2", 0)
                    .style("stroke", "#333")
                    .style("stroke-width", 2);
                    
                // Línea derecha del contacto
                contactGroup.append("line")
                    .attr("x1", contactWidth*2/3)
                    .attr("y1", 0)
                    .attr("x2", contactWidth)
                    .attr("y2", 0)
                    .style("stroke", "#333")
                    .style("stroke-width", 2);
                    
                // Para contactos NA (normalmente abiertos)
                if (!usarInvertida) {
                    // Dos líneas paralelas verticales
                    contactGroup.append("line")
                        .attr("x1", contactWidth/3)
                        .attr("y1", -contactHeight/2)
                        .attr("x2", contactWidth/3)
                        .attr("y2", contactHeight/2)
                        .style("stroke", "#333")
                        .style("stroke-width", 2);
                        
                    contactGroup.append("line")
                        .attr("x1", contactWidth*2/3)
                        .attr("y1", -contactHeight/2)
                        .attr("x2", contactWidth*2/3)
                        .attr("y2", contactHeight/2)
                        .style("stroke", "#333")
                        .style("stroke-width", 2);
                } 
                // Para contactos NC (normalmente cerrados) - CORREGIR
                else {
                    // Dos líneas verticales
                    contactGroup.append("line")
                        .attr("x1", contactWidth/3)
                        .attr("y1", -contactHeight/2)
                        .attr("x2", contactWidth/3)
                        .attr("y2", contactHeight/2)
                        .style("stroke", "#333")
                        .style("stroke-width", 2);
                        
                    contactGroup.append("line")
                        .attr("x1", contactWidth*2/3)
                        .attr("y1", -contactHeight/2)
                        .attr("x2", contactWidth*2/3)
                        .attr("y2", contactHeight/2)
                        .style("stroke", "#333")
                        .style("stroke-width", 2);
                        
                    // LÍNEA DIAGONAL
                    contactGroup.append("line")
                        .attr("x1", contactWidth/3 + 5)
                        .attr("y1", contactHeight/2 - 5)
                        .attr("x2", contactWidth*2/3 - 5)
                        .attr("y2", -contactHeight/2 + 5)
                        .style("stroke", "#333")
                        .style("stroke-width", 2);
                }

                // DIRECCIÓN (encima del contacto)
                contactGroup.append("text")
                    .attr("x", contactWidth / 2)
                    .attr("y", -contactHeight - 5)
                    .style("text-anchor", "middle")
                    .style("font-size", "11px")
                    .style("fill", "#666")
                    .text(entradaObj.direccion);
                    
                // NOMBRE (debajo de la dirección pero encima del contacto)
                contactGroup.append("text")
                    .attr("x", contactWidth / 2)
                    .attr("y", -contactHeight/2 - 5)
                    .style("text-anchor", "middle")
                    .style("font-size", "12px")
                    .style("font-weight", "bold")
                    .text(entradaObj.nombre);
                    
                // Guardar la posición para conexiones
                contactos.push({
                    x: contactX,
                    width: contactWidth
                });
                
                // Actualizar posición X para el siguiente contacto
                contactX += contactWidth + contactSpacing;
                
                // Si no es el último contacto, añadir la línea horizontal de conexión al siguiente
                if (entradaIdx < termino.entradas.length - 1) {
                    conditionGroup.append("line")
                        .attr("x1", contactX - contactSpacing)
                        .attr("y1", railY)
                        .attr("x2", contactX)
                        .attr("y2", railY)
                        .style("stroke", "#333")
                        .style("stroke-width", 2);
                } 
                // Si es el último contacto Y no es el primer término, añadir conexión vertical
                else if (termIdx > 0) {
                    // Posición vertical del término superior
                    const termSuperiorY = (termIdx - 1) * railHeight + railHeight / 2;
                    
                    // Línea vertical hacia arriba
                    conditionGroup.append("line")
                        .attr("x1", contactX - contactSpacing)
                        .attr("y1", railY)
                        .attr("x2", contactX - contactSpacing)
                        .attr("y2", termSuperiorY)
                        .style("stroke", "#333")
                        .style("stroke-width", 2);
                    
                    // Es importante que coincida con la línea horizontal del término superior
                }
            });
            
            // Calcular la posición final del último contacto
            const ultimoContactoX = contactos.length > 0 
                ? contactos[contactos.length - 1].x + contactWidth 
                : 30;
            
            // Línea horizontal desde el último contacto hasta la bobina o punto de conexión OR
            // ESTO DEBE IR FUERA DEL BUCLE DE ENTRADAS, después de procesar todos los contactos
            if (termIdx === 0) {
                // Para el primer término: conectar directamente a la bobina
                conditionGroup.append("line")
                    .attr("x1", ultimoContactoX)
                    .attr("y1", railY)
                    .attr("x2", coilX - 20)
                    .attr("y2", railY)
                    .style("stroke", "#333")
                    .style("stroke-width", 2);
            } else {
                // Para términos adicionales: no agregar línea horizontal adicional
                // La conexión vertical ya se encargó de unirlo al término superior
            }
        });
        
        offsetY += conditionHeight + 50;
    });

    return svg.node();
}