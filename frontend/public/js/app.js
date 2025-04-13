document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const numVariablesInput = document.getElementById('num-variables');
    const btnActualizarTabla = document.getElementById('btn-actualizar-tabla');
    const btnOptimizar = document.getElementById('btn-optimizar');
    const btnReset = document.getElementById('btn-reset');
    const variableNamesContainer = document.getElementById('variable-names-container');
    const encabezadoTabla = document.getElementById('encabezado-tabla');
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    const mintermsSelected = document.getElementById('minterms-selected');
    const expresionMinimizada = document.getElementById('expresion-minimizada');
    const diagramaLadder = document.getElementById('diagrama-ladder');
    const implicantesEsenciales = document.getElementById('implicantes-esenciales');

    // Estado de la aplicación
    let numVariables = parseInt(numVariablesInput.value) || 3;
    let variableNames = Array(numVariables).fill().map((_, i) => `X${i}`);
    let selectedMinterms = new Set();

    // Inicialización
    inicializarUI();

    // Event Listeners
    btnActualizarTabla.addEventListener('click', actualizarTabla);
    btnOptimizar.addEventListener('click', optimizarFuncion);
    btnReset.addEventListener('click', resetearAplicacion);
    numVariablesInput.addEventListener('change', () => {
        numVariables = parseInt(numVariablesInput.value);
        if (numVariables < 2) {
            numVariables = 2;
            numVariablesInput.value = 2;
        } else if (numVariables > 8) {
            numVariables = 8;
            numVariablesInput.value = 8;
        }
        variableNames = Array(numVariables).fill().map((_, i) => `X${i}`);
        actualizarNombresVariables();
        actualizarTabla();
    });

    function inicializarUI() {
        actualizarNombresVariables();
        actualizarTabla();
    }

    function actualizarNombresVariables() {
        variableNamesContainer.innerHTML = '';
        
        for (let i = 0; i < numVariables; i++) {
            const varDiv = document.createElement('div');
            varDiv.className = 'variable-name-input';
            
            const label = document.createElement('label');
            label.textContent = `Var ${i}:`;
            label.setAttribute('for', `var-name-${i}`);
            
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `var-name-${i}`;
            input.value = variableNames[i];
            input.addEventListener('change', (e) => {
                variableNames[i] = e.target.value || `X${i}`;
                actualizarTabla();
            });
            
            varDiv.appendChild(label);
            varDiv.appendChild(input);
            variableNamesContainer.appendChild(varDiv);
        }
    }

    function actualizarTabla() {
        // Limpiar selecciones anteriores
        selectedMinterms.clear();
        actualizarMinitermsSeleccionados();
        
        // Actualizar nombres de variables desde los inputs
        for (let i = 0; i < numVariables; i++) {
            const input = document.getElementById(`var-name-${i}`);
            if (input) {
                variableNames[i] = input.value || `X${i}`;
            }
        }
        
        // Actualizar encabezados
        encabezadoTabla.innerHTML = '';
        
        // Añadir encabezados para variables
        for (let i = 0; i < numVariables; i++) {
            const th = document.createElement('th');
            th.textContent = variableNames[i];
            encabezadoTabla.appendChild(th);
        }
        
        // Añadir encabezado para la salida
        const thOutput = document.createElement('th');
        thOutput.textContent = 'Salida';
        encabezadoTabla.appendChild(thOutput);
        
        // Actualizar cuerpo de la tabla
        cuerpoTabla.innerHTML = '';
        
        // Generar todas las combinaciones posibles
        const numRows = Math.pow(2, numVariables);
        
        for (let i = 0; i < numRows; i++) {
            const tr = document.createElement('tr');
            
            // Convertir i a binario y rellenar con ceros
            const binario = i.toString(2).padStart(numVariables, '0');
            
            // Añadir celdas para variables
            for (let j = 0; j < numVariables; j++) {
                const td = document.createElement('td');
                td.textContent = binario[j];
                tr.appendChild(td);
            }
            
            // Añadir celda para salida (seleccionable)
            const tdOutput = document.createElement('td');
            tdOutput.className = 'selectable';
            tdOutput.textContent = '0';
            tdOutput.dataset.minterm = i;
            
            tdOutput.addEventListener('click', function() {
                this.classList.toggle('selected');
                
                if (this.classList.contains('selected')) {
                    this.textContent = '1';
                    selectedMinterms.add(parseInt(this.dataset.minterm));
                } else {
                    this.textContent = '0';
                    selectedMinterms.delete(parseInt(this.dataset.minterm));
                }
                
                actualizarMinitermsSeleccionados();
            });
            
            tr.appendChild(tdOutput);
            cuerpoTabla.appendChild(tr);
        }
    }

    function actualizarMinitermsSeleccionados() {
        if (selectedMinterms.size === 0) {
            mintermsSelected.textContent = 'Ninguno seleccionado';
        } else {
            const mintermsList = Array.from(selectedMinterms).sort((a, b) => a - b);
            mintermsSelected.textContent = mintermsList.join(', ');
        }
    }

    async function optimizarFuncion() {
        if (selectedMinterms.size === 0) {
            alert('Por favor, selecciona al menos un mintérmino.');
            return;
        }
        
        const mintermsList = Array.from(selectedMinterms).sort((a, b) => a - b);
        
        // Construir datos para enviar a la API
        const data = {
            minterminos: mintermsList,
            numVariables: numVariables,
            nombreVariables: variableNames
        };
        
        try {
            // Mostrar mensaje de carga
            expresionMinimizada.textContent = 'Optimizando...';
            diagramaLadder.textContent = 'Generando diagrama...';
            implicantesEsenciales.textContent = 'Calculando...';
            
            // Llamada a la API
            const response = await callAPI(data);
            
            // Mostrar resultados
            expresionMinimizada.textContent = response.expresion;
            
            // El ladder tiene formato de texto con saltos de línea
            diagramaLadder.textContent = response.ladder;
            
            // Mostrar implicantes esenciales
            let implicantesText = '';
            response.implicantes.forEach((imp, index) => {
                if (imp.esEsencial) {
                    implicantesText += `${index + 1}. ${imp.representacion}\n`;
                }
            });
            
            implicantesEsenciales.textContent = implicantesText || 'Ninguno encontrado';
            
        } catch (error) {
            console.error('Error al optimizar:', error);
            expresionMinimizada.textContent = 'Error al optimizar: ' + error.message;
            diagramaLadder.textContent = 'No disponible debido a un error.';
            implicantesEsenciales.textContent = 'No disponible debido a un error.';
        }
    }

    function resetearAplicacion() {
        // Restablecer selecciones
        selectedMinterms.clear();
        actualizarMinitermsSeleccionados();
        
        // Limpiar selecciones en la tabla
        const celdas = document.querySelectorAll('#tabla-verdad td.selectable');
        celdas.forEach(celda => {
            celda.classList.remove('selected');
            celda.textContent = '0';
        });
        
        // Limpiar resultados
        expresionMinimizada.textContent = 'Esperando optimización...';
        diagramaLadder.textContent = 'Esperando optimización...';
        implicantesEsenciales.textContent = 'Esperando optimización...';
    }

    // Función para llamada a la API
    async function callAPI(data) {
        try {
            const response = await fetch('http://localhost:8080/api/optimizar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor: ' + response.status);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error en la llamada a la API:', error);
            throw error;
        }
    }
});