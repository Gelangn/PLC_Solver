document.addEventListener('DOMContentLoaded', function() {
    // Estado de la aplicación
    const estado = {
        entradas: [],
        salidas: [],
        condiciones: []
    };

    // Añade estas funciones después de la definición del objeto estado
    function guardarEstado() {
        // Guardar todo el estado en localStorage
        localStorage.setItem('plcSolverState', JSON.stringify(estado));
    }

    function cargarEstado() {
        // Recuperar el estado desde localStorage
        const estadoGuardado = localStorage.getItem('plcSolverState');
        
        if (estadoGuardado) {
            // Si hay datos guardados, cargarlos
            const estadoObj = JSON.parse(estadoGuardado);
            
            // Actualizar el estado con los datos guardados
            estado.entradas = estadoObj.entradas || [];
            estado.salidas = estadoObj.salidas || [];
            estado.condiciones = estadoObj.condiciones || [];
            
            // Renderizar los componentes con los datos cargados
            renderizarEntradas();
            renderizarSalidas();
            renderizarCondiciones();
            
            return true;
        }
        
        return false;
    }

    // Elementos DOM
    const btnAgregarEntrada = document.getElementById('btn-agregar-entrada');
    const btnAgregarSalida = document.getElementById('btn-agregar-salida');
    const btnAgregarCondicion = document.getElementById('btn-agregar-condicion');
    const btnGenerar = document.getElementById('btn-generar');
    const btnReset = document.getElementById('btn-reset');
    const btnExportar = document.getElementById('btn-exportar');
    
    const entradasCuerpo = document.getElementById('entradas-cuerpo');
    const salidasCuerpo = document.getElementById('salidas-cuerpo');
    const condicionesContainer = document.getElementById('condiciones-container');
    const diagramaLadder = document.getElementById('diagrama-ladder');
    const expresionMinimizada = document.getElementById('expresion-minimizada');
    
    // Modal de condiciones
    const modalCondicion = document.getElementById('modal-condicion');
    const btnGuardarCondicion = document.getElementById('btn-guardar-condicion');
    const btnCancelarCondicion = document.getElementById('btn-cancelar-condicion');
    const condicionSalida = document.getElementById('condicion-salida');
    const condicionEntradasContainer = document.getElementById('condicion-entradas-container');
    const btnAgregarTermino = document.getElementById('btn-agregar-termino');
    
    // Variables para el modo edición de condiciones
    let modoEdicion = false;
    let indiceEdicion = -1;

    // Inicialización
    inicializarEventListeners();

    // Intentar cargar estado guardado, si no existe crear valores por defecto
    if (!cargarEstado()) {
        agregarFilaEntrada(); // Agregar una entrada por defecto
        agregarFilaSalida(); // Agregar una salida por defecto
    }

    function inicializarEventListeners() {
        // Botones principales
        btnAgregarEntrada.addEventListener('click', agregarFilaEntrada);
        btnAgregarSalida.addEventListener('click', agregarFilaSalida);
        btnAgregarCondicion.addEventListener('click', mostrarModalCondicion);
        btnGenerar.addEventListener('click', generarDiagramaLadder);
        btnReset.addEventListener('click', resetearAplicacion);
        btnExportar.addEventListener('click', exportarDiagrama);
        
        // Modal de condiciones
        btnGuardarCondicion.addEventListener('click', guardarCondicion);
        btnCancelarCondicion.addEventListener('click', cerrarModalCondicion);
        btnAgregarTermino.addEventListener('click', agregarTerminoEntrada);
        
        // Cerrar modal con X
        document.querySelector('.modal-close').addEventListener('click', cerrarModalCondicion);
        
        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function(event) {
            if (event.target === modalCondicion) {
                cerrarModalCondicion();
            }
        });
    }

    // Funciones para entradas
    // Modifica la función agregarFilaEntrada para usar el formato I0.0 según IEC 61131-3
    function agregarFilaEntrada() {
        // Calcula la nueva dirección en formato I0.0, I0.1, etc. considerando bloques de 16 entradas
        const entradaNum = estado.entradas.length;
        const bloqueI = Math.floor(entradaNum / 16);
        const subIndice = entradaNum % 16;
        const direccion = `I${bloqueI}.${subIndice}`;
        
        const nuevaEntrada = {
            id: generarId('E'),
            nombre: `Entrada${estado.entradas.length + 1}`,
            direccion: direccion,
            descripcion: '',
            normalmente: 'abierto' // abierto o cerrado
        };
        
        estado.entradas.push(nuevaEntrada);
        renderizarEntradas();
        guardarEstado(); // Añadir esta línea
    }

    function eliminarEntrada(id) {
        const index = estado.entradas.findIndex(entrada => entrada.id === id);
        if (index !== -1) {
            estado.entradas.splice(index, 1);
            renderizarEntradas();
            
            // Actualizar condiciones que usan esta entrada
            estado.condiciones.forEach(condicion => {
                condicion.terminos.forEach(termino => {
                    termino.entradas = termino.entradas.filter(entrada => entrada.id !== id);
                });
                // Eliminar términos vacíos
                condicion.terminos = condicion.terminos.filter(termino => termino.entradas.length > 0);
            });
            // Eliminar condiciones sin términos
            estado.condiciones = estado.condiciones.filter(condicion => condicion.terminos.length > 0);
            
            renderizarCondiciones();
            guardarEstado(); // Añadir esta línea
        }
    }

    // Modifica la función renderizarEntradas() para que el HTML generado quede así:
    function renderizarEntradas() {
        entradasCuerpo.innerHTML = '';
        
        estado.entradas.forEach(entrada => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><input type="text" class="entrada-nombre" value="${entrada.nombre}" data-id="${entrada.id}"></td>
                <td><input type="text" class="entrada-direccion" value="${entrada.direccion}" data-id="${entrada.id}" maxlength="6"></td>
                <td><input type="text" class="entrada-descripcion" value="${entrada.descripcion}" data-id="${entrada.id}"></td>
                <td>
                    <select class="entrada-normalmente" data-id="${entrada.id}">
                        <option value="abierto" ${entrada.normalmente === 'abierto' ? 'selected' : ''}>Abierto (NA)</option>
                        <option value="cerrado" ${entrada.normalmente === 'cerrado' ? 'selected' : ''}>Cerrado (NC)</option>
                    </select>
                </td>
                <td>
                    <button class="btn-icon btn-eliminar-entrada" data-id="${entrada.id}">🗑️</button>
                </td>
            `;
            
            entradasCuerpo.appendChild(fila);
        });
        
        // Agregar event listeners a los inputs y botones
        document.querySelectorAll('.entrada-nombre').forEach(input => {
            input.addEventListener('change', actualizarDatosEntrada);
        });
        
        document.querySelectorAll('.entrada-direccion').forEach(input => {
            input.addEventListener('change', actualizarDatosEntrada);
        });
        
        document.querySelectorAll('.entrada-descripcion').forEach(input => {
            input.addEventListener('change', actualizarDatosEntrada);
        });
        
        document.querySelectorAll('.entrada-normalmente').forEach(select => {
            select.addEventListener('change', actualizarDatosEntrada);
        });
        
        document.querySelectorAll('.btn-eliminar-entrada').forEach(boton => {
            boton.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                eliminarEntrada(id);
            });
        });
    }

    function actualizarDatosEntrada(event) {
        const id = event.target.getAttribute('data-id');
        const campo = event.target.className.replace('entrada-', '');
        const valor = event.target.value;
        
        const indice = estado.entradas.findIndex(entrada => entrada.id === id);
        if (indice !== -1) {
            estado.entradas[indice][campo] = valor;
            
            // Actualizar condiciones que usan esta entrada
            if (campo === 'nombre') {
                estado.condiciones.forEach(condicion => {
                    condicion.terminos.forEach(termino => {
                        termino.entradas.forEach(entrada => {
                            if (entrada.id === id) {
                                entrada.nombre = valor;
                            }
                        });
                    });
                });
                renderizarCondiciones();
            }
        }
        guardarEstado(); // Añadir esta línea
    }

    // Funciones para salidas
    // Modifica la función agregarFilaSalida para usar el formato Q0.0 según IEC 61131-3
    function agregarFilaSalida() {
        // Calcular la nueva dirección en formato Q0.0, Q0.1, etc.
        const salidaNum = estado.salidas.length;
        const bloqueQ = Math.floor(salidaNum / 16);
        const subIndice = salidaNum % 16;
        const direccion = `Q${bloqueQ}.${subIndice}`;
        
        const nuevaSalida = {
            id: generarId('S'),
            nombre: `Salida${estado.salidas.length + 1}`,
            direccion: direccion,
            descripcion: ''
        };
        
        estado.salidas.push(nuevaSalida);
        renderizarSalidas();
		guardarEstado();
    }

    function eliminarSalida(id) {
        const index = estado.salidas.findIndex(salida => salida.id === id);
        if (index !== -1) {
            estado.salidas.splice(index, 1);
            renderizarSalidas();
            
            // Eliminar condiciones que usan esta salida
            estado.condiciones = estado.condiciones.filter(condicion => condicion.salidaId !== id);
            renderizarCondiciones();
        }
		guardarEstado();
    }

    // Similar para renderizarSalidas()
    function renderizarSalidas() {
        salidasCuerpo.innerHTML = '';
        
        estado.salidas.forEach(salida => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><input type="text" class="salida-nombre" value="${salida.nombre}" data-id="${salida.id}"></td>
                <td><input type="text" class="salida-direccion" value="${salida.direccion}" data-id="${salida.id}" maxlength="6"></td>
                <td><input type="text" class="salida-descripcion" value="${salida.descripcion}" data-id="${salida.id}"></td>
                <td>
                    <button class="btn-icon btn-eliminar-salida" data-id="${salida.id}">🗑️</button>
                </td>
            `;
            
            salidasCuerpo.appendChild(fila);
        });
        
        // Agregar event listeners a los inputs y botones
        document.querySelectorAll('.salida-nombre').forEach(input => {
            input.addEventListener('change', actualizarDatosSalida);
        });
        
        document.querySelectorAll('.salida-direccion').forEach(input => {
            input.addEventListener('change', actualizarDatosSalida);
        });
        
        document.querySelectorAll('.salida-descripcion').forEach(input => {
            input.addEventListener('change', actualizarDatosSalida);
        });
        
        document.querySelectorAll('.btn-eliminar-salida').forEach(boton => {
            boton.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                eliminarSalida(id);
            });
        });
    }

    function actualizarDatosSalida(event) {
        const id = event.target.getAttribute('data-id');
        const campo = event.target.className.replace('salida-', '');
        const valor = event.target.value;
        
        const indice = estado.salidas.findIndex(salida => salida.id === id);
        if (indice !== -1) {
            estado.salidas[indice][campo] = valor;
            
            // Actualizar condiciones que usan esta salida
            if (campo === 'nombre') {
                estado.condiciones.forEach(condicion => {
                    if (condicion.salidaId === id) {
                        condicion.salidaNombre = valor;
                    }
                });
                renderizarCondiciones();
            }
        }
		guardarEstado();
    }

    // Funciones para condiciones
    function mostrarModalCondicion() {
        // Limpiar modal
        condicionSalida.innerHTML = '';
        condicionEntradasContainer.innerHTML = '';
        
        // Llenar selector de salidas
        estado.salidas.forEach(salida => {
            const option = document.createElement('option');
            option.value = salida.id;
            // Mostrar nombre, dirección y descripción
            option.textContent = `${salida.nombre} (${salida.direccion} - ${salida.descripcion})`;
            condicionSalida.appendChild(option);
        });
        
        // Agregar un término de entrada por defecto
        agregarTerminoEntrada();
        
        // Mostrar modal
        modalCondicion.style.display = 'block';
        
        // Modo de creación (no edición)
        modoEdicion = false;
        indiceEdicion = -1;
    }

    function agregarTerminoEntrada() {
        const terminoDiv = document.createElement('div');
        terminoDiv.className = 'termino-container';
        
        if (condicionEntradasContainer.children.length > 0) {
            // Si ya hay términos, añadir separador OR
            const orSeparator = document.createElement('div');
            orSeparator.className = 'or-separator';
            orSeparator.textContent = 'OR';
            condicionEntradasContainer.appendChild(orSeparator);
            
            terminoDiv.className += ' termino-or';
        }
        
        // Agregar primera entrada al término
        agregarEntradaATermino(terminoDiv);
        
        // Agregar botón para agregar más entradas a este término (AND)
        const btnAgregarAnd = document.createElement('button');
        btnAgregarAnd.className = 'btn-secundario btn-pequeno';
        btnAgregarAnd.textContent = '+ AND';
        btnAgregarAnd.onclick = function() {
            agregarEntradaATermino(terminoDiv);
        };
        
        terminoDiv.appendChild(btnAgregarAnd);
        condicionEntradasContainer.appendChild(terminoDiv);
    }

    function agregarEntradaATermino(terminoDiv) {
        const entradaDiv = document.createElement('div');
        entradaDiv.className = 'condicion-entrada';
        
        // Selector de entrada - MODIFICAR ESTA PARTE
        const selectEntrada = document.createElement('select');
        selectEntrada.className = 'entrada-selector';
        
        estado.entradas.forEach(e => {
            const option = document.createElement('option');
            option.value = e.id;
            // Mostrar nombre, dirección y descripción
            option.textContent = `${e.nombre} (${e.direccion} - ${e.descripcion})`;
            selectEntrada.appendChild(option);
        });
        
        // Selector de estado
        const selectEstado = document.createElement('select');
        selectEstado.className = 'estado-selector';
        
        const optionActivado = document.createElement('option');
        optionActivado.value = 'activado';
        optionActivado.textContent = 'Activado';
        selectEstado.appendChild(optionActivado);
        
        const optionDesactivado = document.createElement('option');
        optionDesactivado.value = 'desactivado';
        optionDesactivado.textContent = 'Desactivado';
        selectEstado.appendChild(optionDesactivado);
        
        // Botón de eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn-icon';
        btnEliminar.textContent = '🗑️';
        btnEliminar.onclick = function() {
            terminoDiv.removeChild(entradaDiv);
            
            // Si el término queda vacío, eliminarlo
            if (terminoDiv.querySelectorAll('.condicion-entrada').length === 0) {
                condicionEntradasContainer.removeChild(terminoDiv);
                
                // Si era el primer término, eliminar también el separador OR del siguiente
                if (terminoDiv.previousElementSibling && 
                    terminoDiv.previousElementSibling.className === 'or-separator') {
                    condicionEntradasContainer.removeChild(terminoDiv.previousElementSibling);
                }
                else if (terminoDiv.nextElementSibling && 
                         terminoDiv.nextElementSibling.className === 'or-separator') {
                    condicionEntradasContainer.removeChild(terminoDiv.nextElementSibling);
                }
            }
        };
        
        entradaDiv.appendChild(selectEntrada);
        entradaDiv.appendChild(selectEstado);
        entradaDiv.appendChild(btnEliminar);
        
        terminoDiv.insertBefore(entradaDiv, terminoDiv.lastElementChild);
    }

    function guardarCondicion() {
        const salidaId = condicionSalida.value;
        if (!salidaId) {
            alert('Debes seleccionar una salida');
            return;
        }
        
        const salida = estado.salidas.find(s => s.id === salidaId);
        if (!salida) {
            alert('Salida no encontrada');
            return;
        }
        
        // Construir términos
        const terminos = [];
        const terminosContainers = condicionEntradasContainer.querySelectorAll('.termino-container');
        
        terminosContainers.forEach(terminoContainer => {
            const entradas = [];
            const entradasDivs = terminoContainer.querySelectorAll('.condicion-entrada');
            
            entradasDivs.forEach(entradaDiv => {
                const entradaId = entradaDiv.querySelector('.entrada-selector').value;
                const estadoEntrada = entradaDiv.querySelector('.estado-selector').value; // Cambié "estado" por "estadoEntrada"
                
                const entrada = estado.entradas.find(e => e.id === entradaId);
                if (entrada) {
                    entradas.push({
                        id: entradaId,
                        nombre: entrada.nombre,
                        estado: estadoEntrada // Usar estadoEntrada aquí
                    });
                }
            });
            
            if (entradas.length > 0) {
                terminos.push({
                    entradas: entradas
                });
            }
        });
        
        if (terminos.length === 0) {
            alert('Debes agregar al menos una condición');
            return;
        }
        
        // Crear o actualizar condición
        const condicion = {
            id: modoEdicion ? estado.condiciones[indiceEdicion].id : generarId('C'),
            salidaId: salidaId,
            salidaNombre: salida.nombre,
            terminos: terminos
        };
        
        if (modoEdicion) {
            estado.condiciones[indiceEdicion] = condicion;
        } else {
            estado.condiciones.push(condicion);
        }
        
        renderizarCondiciones();
        cerrarModalCondicion();
		guardarEstado();
    }

    function editarCondicion(id) {
        const indice = estado.condiciones.findIndex(c => c.id === id);
        if (indice === -1) return;
        
        const condicion = estado.condiciones[indice];
        
        // Llenar selector de salidas
        condicionSalida.innerHTML = '';
        estado.salidas.forEach(salida => {
            const option = document.createElement('option');
            option.value = salida.id;
            // Mostrar nombre, dirección y descripción
            option.textContent = `${salida.nombre} (${salida.direccion} - ${salida.descripcion})`;
            option.selected = salida.id === condicion.salidaId;
            condicionSalida.appendChild(option);
        });
        
        // Limpiar y llenar contenedor de términos
        condicionEntradasContainer.innerHTML = '';
        
        condicion.terminos.forEach((termino, i) => {
            const terminoDiv = document.createElement('div');
            terminoDiv.className = 'termino-container';
            
            if (i > 0) {
                // Si no es el primer término, añadir separador OR
                const orSeparator = document.createElement('div');
                orSeparator.className = 'or-separator';
                orSeparator.textContent = 'OR';
                condicionEntradasContainer.appendChild(orSeparator);
                
                terminoDiv.className += ' termino-or';
            }
            
            // Agregar entradas al término
            termino.entradas.forEach(entrada => {
                const entradaDiv = document.createElement('div');
                entradaDiv.className = 'condicion-entrada';
                
                // Selector de entrada
                const selectEntrada = document.createElement('select');
                selectEntrada.className = 'entrada-selector';
                
                estado.entradas.forEach(e => {
                    const option = document.createElement('option');
                    option.value = e.id;
                    // Mostrar nombre, dirección y descripción
                    option.textContent = `${e.nombre} (${e.direccion} - ${e.descripcion})`;
                    option.selected = e.id === entrada.id;
                    selectEntrada.appendChild(option);
                });
                
                // Selector de estado
                const selectEstado = document.createElement('select');
                selectEstado.className = 'estado-selector';
                
                const optionActivado = document.createElement('option');
                optionActivado.value = 'activado';
                optionActivado.textContent = 'Activado';
                optionActivado.selected = entrada.estado === 'activado';
                selectEstado.appendChild(optionActivado);
                
                const optionDesactivado = document.createElement('option');
                optionDesactivado.value = 'desactivado';
                optionDesactivado.textContent = 'Desactivado';
                optionDesactivado.selected = entrada.estado === 'desactivado';
                selectEstado.appendChild(optionDesactivado);
                
                // Botón de eliminar
                const btnEliminar = document.createElement('button');
                btnEliminar.className = 'btn-icon';
                btnEliminar.textContent = '🗑️';
                btnEliminar.onclick = function() {
                    terminoDiv.removeChild(entradaDiv);
                    
                    // Si el término queda vacío, eliminarlo
                    if (terminoDiv.querySelectorAll('.condicion-entrada').length === 0) {
                        condicionEntradasContainer.removeChild(terminoDiv);
                        
                        // Eliminar también el separador OR
                        if (terminoDiv.previousElementSibling && 
                            terminoDiv.previousElementSibling.className === 'or-separator') {
                            condicionEntradasContainer.removeChild(terminoDiv.previousElementSibling);
                        }
                        else if (terminoDiv.nextElementSibling && 
                                 terminoDiv.nextElementSibling.className === 'or-separator') {
                            condicionEntradasContainer.removeChild(terminoDiv.nextElementSibling);
                        }
                    }
                };
                
                entradaDiv.appendChild(selectEntrada);
                entradaDiv.appendChild(selectEstado);
                entradaDiv.appendChild(btnEliminar);
                
                terminoDiv.appendChild(entradaDiv);
            });
            
            // Agregar botón para agregar más entradas a este término (AND)
            const btnAgregarAnd = document.createElement('button');
            btnAgregarAnd.className = 'btn-secundario btn-pequeno';
            btnAgregarAnd.textContent = '+ AND';
            btnAgregarAnd.onclick = function() {
                agregarEntradaATermino(terminoDiv);
            };
            
            terminoDiv.appendChild(btnAgregarAnd);
            condicionEntradasContainer.appendChild(terminoDiv);
        });
        
        // Establecer modo edición
        modoEdicion = true;
        indiceEdicion = indice;
        
        // Mostrar modal
        modalCondicion.style.display = 'block';
    }

    function eliminarCondicion(id) {
        estado.condiciones = estado.condiciones.filter(c => c.id !== id);
        renderizarCondiciones();
		guardarEstado();
    }

    function cerrarModalCondicion() {
        modalCondicion.style.display = 'none';
    }

    function renderizarCondiciones() {
        condicionesContainer.innerHTML = '';
        
        if (estado.condiciones.length === 0) {
            const mensaje = document.createElement('div');
            mensaje.className = 'mensaje-sin-condiciones';
            mensaje.textContent = 'No hay condiciones definidas. Haz clic en "Agregar Condición" para comenzar.';
            condicionesContainer.appendChild(mensaje);
            return;
        }
        
        estado.condiciones.forEach(condicion => {
            const condicionDiv = document.createElement('div');
            condicionDiv.className = 'condicion-item';
            
            // Generar texto de la condición
            let texto = `<strong>${condicion.salidaNombre}</strong> = `;
            
            texto += condicion.terminos.map(termino => {
                // Cada término es una serie de entradas conectadas por AND
                return termino.entradas.map(entrada => {
                    const signo = entrada.estado === 'desactivado' ? '!' : '';
                    return `${signo}${entrada.nombre}`;
                }).join(' & ');
            }).join(' + ');
            
            const textoDiv = document.createElement('div');
            textoDiv.className = 'condicion-texto';
            textoDiv.innerHTML = texto;
            
            const accionesDiv = document.createElement('div');
            accionesDiv.className = 'condicion-acciones';
            
            const btnEditar = document.createElement('button');
            btnEditar.className = 'btn-secundario';
            btnEditar.textContent = 'Editar';
            btnEditar.addEventListener('click', function() {
                editarCondicion(condicion.id);
            });
            
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn-danger';
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.addEventListener('click', function() {
                if (confirm('¿Estás seguro de eliminar esta condición?')) {
                    eliminarCondicion(condicion.id);
                }
            });
            
            accionesDiv.appendChild(btnEditar);
            accionesDiv.appendChild(btnEliminar);
            
            condicionDiv.appendChild(textoDiv);
            condicionDiv.appendChild(accionesDiv);
            
            condicionesContainer.appendChild(condicionDiv);
        });
    }

    // Funciones para generar diagrama Ladder
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

    // En producción, esto se reemplazaría por una llamada real a la API
    async function llamarAPI(datos) {
        try {
            const respuesta = await fetch('http://localhost:8080/api/optimizar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            
            if (!respuesta.ok) {
                throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
            }
            
            return await respuesta.json();
        } catch (error) {
            throw new Error('Error en la comunicación con el servidor: ' + error.message);
        }
    }

    // Actualizar la función exportarDiagrama
    function exportarDiagrama() {
		try {
			const formato = document.getElementById('formato-exportacion').value;
			console.log('Formato de exportación seleccionado:', formato);

			if (formato === 'png' || formato === 'jpg') {
				const svg = document.querySelector('#ladderDiagram svg');
				
				if (svg) {
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
						const a = document.createElement('a');
						a.href = canvas.toDataURL(`image/${formato === 'jpg' ? 'jpeg' : 'png'}`);
						a.download = `diagrama-ladder.${formato}`;
						a.click();
						
						// Limpiar
						document.body.removeChild(container);
					};
					img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
				}
			} else if (formato === 'txt') {
				// Mantener la exportación de texto como estaba
				const contenido = expresionMinimizada.textContent;
				const blob = new Blob([contenido], { type: 'text/plain' });
				const url = URL.createObjectURL(blob);
				
				const a = document.createElement('a');
				a.href = url;
				a.download = 'diagrama-ladder.txt';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
			}
		} catch (error) {
			console.error('Error al exportar el diagrama:', error);
			alert('Error al exportar el diagrama: ' + error.message);
		}
	}

    function resetearAplicacion() {
        if (confirm('¿Estás seguro de que deseas reiniciar la aplicación? Se perderán todos los datos.')) {
            estado.entradas = [];
            estado.salidas = [];
            estado.condiciones = [];
            
            agregarFilaEntrada();
            agregarFilaSalida();
            renderizarCondiciones();
            
            expresionMinimizada.textContent = 'Esperando generación de diagrama...';
            diagramaLadder.textContent = 'Esperando generación de diagrama...';
            btnExportar.disabled = true;
            
            guardarEstado(); // Añadir esta línea
        }
    }

    // Función auxiliar para generar IDs únicos
    function generarId(prefijo) {
        return prefijo + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
});
