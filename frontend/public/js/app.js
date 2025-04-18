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
            option.textContent = salida.nombre;
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
        
        // Selector de entrada
        const selectEntrada = document.createElement('select');
        selectEntrada.className = 'entrada-selector';
        
        estado.entradas.forEach(entrada => {
            const option = document.createElement('option');
            option.value = entrada.id;
            option.textContent = entrada.nombre;
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
            option.textContent = salida.nombre;
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
                    option.textContent = e.nombre;
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
    function generarDiagramaLadder() {
        if (estado.condiciones.length === 0) {
            alert('Debes definir al menos una condición para generar el diagrama.');
            return;
        }
        
        // Convertir las condiciones a una tabla de verdad implícita
        // y generar el código ladder optimizado
        
        // Enviar datos al backend
        const datos = {
            entradas: estado.entradas,
            salidas: estado.salidas,
            condiciones: estado.condiciones
        };
        
        // Llamar a la API (en este caso, simulamos la respuesta)
        try {
            const respuesta = simularLlamadaAPI(datos);
            
            // Actualizar interfaz con los resultados
            expresionMinimizada.textContent = respuesta.expresion;
            diagramaLadder.textContent = respuesta.ladder;
            
            // Habilitar botón de exportar
            btnExportar.disabled = false;
        } catch (error) {
            console.error('Error al generar el diagrama:', error);
            alert('Error al generar el diagrama: ' + error.message);
        }
    }

    function simularLlamadaAPI(datos) {
        console.log('Datos enviados a la API:', datos);
        
        // Definir la función mostrarAnchos aquí, dentro del ámbito de simularLlamadaAPI
        function mostrarAnchos() {
            console.log("anchoTotal:", anchoTotal);
            console.log("anchoMaximoRung:", anchoMaximoRung);
            
            // Solo mostrar información de líneas si están definidas
            if (typeof linea1 !== 'undefined') {
                console.log("Longitud línea 1:", linea1.length);
                console.log("Espacio restante 1:", espacioRestante1);
            }
            
            if (typeof linea2 !== 'undefined') {
                console.log("Longitud línea 2:", linea2.length);
                console.log("Espacio restante 2:", espacioRestante2);
            }
            
            if (typeof linea3 !== 'undefined') {
                console.log("Longitud línea 3:", linea3.length);
                console.log("Espacio restante 3:", espacioRestante3);
            }
        }
        
        // Convertir condiciones a expresiones
        const expresiones = datos.condiciones.map(condicion => {
            const salida = datos.salidas.find(s => s.id === condicion.salidaId);
            
            // Cada término es un producto (AND) de entradas
            const terminosTexto = condicion.terminos.map(termino => {
                return termino.entradas.map(e => {
                    const entrada = datos.entradas.find(entrada => entrada.id === e.id);
                    const invertida = (e.estado === 'desactivado');
                    const normalmente = entrada.normalmente || 'abierto';
                    
                    // Ajustar según si es NA o NC
                    const usarInvertida = (normalmente === 'abierto') ? invertida : !invertida;
                    
                    return usarInvertida ? `!${entrada.nombre}` : entrada.nombre;
                }).join(' & ');
            }).join(' + ');
            
            return `${salida.nombre} = ${terminosTexto}`;
        });
        
        // PRIMERA FASE: Calcular el ancho máximo necesario
        let anchoMaximoRung = 0;
        
        // Hacer un recorrido previo para calcular el ancho máximo
        datos.condiciones.forEach(condicion => {
            const salida = datos.salidas.find(s => s.id === condicion.salidaId);
            
            condicion.terminos.forEach(termino => {
                // Calcular ancho para este rung
                let anchoRung = 1; // Iniciar con el borde izquierdo '|'
                
                // Ancho para los contactos
                termino.entradas.forEach((e, i) => {
                    if (i > 0) anchoRung += 8; // Separador entre contactos
                    anchoRung += 9; // Ancho del símbolo del contacto (---[ ]---)
                });
                
                // Ancho para la bobina
                const anchoBobina = Math.max(16, 10 + Math.max(salida.direccion.length, salida.nombre.length));
                anchoRung += 8 + anchoBobina; // Espacios alrededor + ancho de bobina
                
                // Actualizar el ancho máximo si este rung es más ancho
                anchoMaximoRung = Math.max(anchoMaximoRung, anchoRung);
            });
        });
        
        // Añadir margen para evitar que quede muy justo
        anchoMaximoRung += 2;
        
        // SEGUNDA FASE: Generar el diagrama con ancho fijo
        let anchoTotal = Math.max(60, anchoMaximoRung); // Usar al menos 60 de ancho
        
        // Definir la posición fija para las bobinas desde la derecha
        const posicionBobina = anchoTotal - 20; // 20 caracteres desde el borde derecho
        
        // Cabecera del diagrama
        let ladder = '+' + '-'.repeat(anchoTotal) + '+\n';
        ladder += '|' + centrarTexto('DIAGRAMA LADDER PLC (IEC 61131-3)', anchoTotal) + '|\n';
        ladder += '+' + '-'.repeat(anchoTotal) + '+\n';
        
        // Generar cada rung (línea) del ladder
        datos.condiciones.forEach(condicion => {
            const salida = datos.salidas.find(s => s.id === condicion.salidaId);
            
            condicion.terminos.forEach(termino => {
                // Líneas para cada rung
                let linea1 = '|'; // Direcciones
                let linea2 = '|'; // Nombres
                let linea3 = '|'; // Símbolos de contactos
                
                // Generar contactos para cada entrada en el término
                termino.entradas.forEach((e, i) => {
                    const entrada = datos.entradas.find(entrada => entrada.id === e.id);
                    const invertida = (e.estado === 'desactivado');
                    const normalmente = entrada.normalmente || 'abierto';
                    
                    // Ajustar según si es NA o NC
                    const usarInvertida = (normalmente === 'abierto') ? invertida : !invertida;
                    
                    // Símbolos simplificados para contactos (mantenemos estos con guiones)
                    const simboloContacto = usarInvertida ? '---[/]---' : '---[ ]---';
                    const anchoContacto = simboloContacto.length;
                    
                    // Añadir separador si no es el primer contacto
                    if (i > 0) {
                        // Para líneas de texto usamos espacios, no guiones
                        linea1 += ' '.repeat(8);
                        linea2 += ' '.repeat(8);
                        // Solo para la línea de símbolos usamos guiones
                        linea3 += '--------';
                    }
                    
                    // Centrar dirección y nombre en el espacio del contacto
                    const direccionCentrada = centrarTexto(entrada.direccion, anchoContacto);
                    const nombreCentrado = centrarTexto(entrada.nombre, anchoContacto);
                    
                    // Añadir elementos alineados
                    linea1 += direccionCentrada;
                    linea2 += nombreCentrado;
                    linea3 += simboloContacto;
                });
                
                // Añadir bobina (salida) alineada a la derecha
                const anchoBobina = Math.max(16, 10 + Math.max(salida.direccion.length, salida.nombre.length));
                const direccionCentrada = centrarTexto(salida.direccion, anchoBobina);
                const nombreCentrado = centrarTexto(salida.nombre, anchoBobina);
                
                // Calcular el espacio disponible entre el último contacto y donde debe empezar la bobina
                const espacioEntreContactosYBobina = posicionBobina - linea3.length;
                
                // Rellenar el espacio con guiones o espacios según corresponda
                if (espacioEntreContactosYBobina > 0) {
                    linea1 += ' '.repeat(espacioEntreContactosYBobina);
                    linea2 += ' '.repeat(espacioEntreContactosYBobina);
                    linea3 += '-'.repeat(espacioEntreContactosYBobina);
                }
                
                // Añadir las etiquetas y bobina (ahora todos alineados a la misma posición)
                linea1 += direccionCentrada;
                linea2 += nombreCentrado;
                linea3 += '( )';
                
                // Completar hasta el ancho total
                const espacioRestante1 = anchoTotal - linea1.length;
                const espacioRestante2 = anchoTotal - linea2.length;
                const espacioRestante3 = anchoTotal - linea3.length;
                
                // Ahora es seguro llamar a mostrarAnchos() porque todas las variables están definidas
                mostrarAnchos();
                
                ladder += linea1 + ' '.repeat(espacioRestante1) + '|\n';
                ladder += linea2 + ' '.repeat(espacioRestante2) + '|\n';
                ladder += linea3 + '-'.repeat(espacioRestante3) + '|\n';
                ladder += '|' + ' '.repeat(anchoTotal - 1) + '|\n';
            });
        });
        
        // Y también en el pie
        ladder += '+' + '-'.repeat(anchoTotal) + '+\n';
        
        return {
            expresion: expresiones.join('\n'),
            ladder: ladder
        };
        
        // Función auxiliar para centrar texto en un ancho dado
        function centrarTexto(texto, ancho) {
            // Si el texto es más largo que el ancho disponible, truncarlo
            const textoAjustado = texto.length > ancho ? texto.substring(0, ancho) : texto;
            
            // Calcular espacios necesarios (asegurando valores no negativos)
            const espacios = Math.max(0, ancho - textoAjustado.length);
            const izquierda = Math.floor(espacios / 2);
            const derecha = espacios - izquierda;
            
            return ' '.repeat(Math.max(0, izquierda)) + textoAjustado + ' '.repeat(Math.max(0, derecha));
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
                throw new Error('Error en la respuesta del servidor: ' + respuesta.status);
            }
            
            return await respuesta.json();
        } catch (error) {
            console.error('Error en la llamada a la API:', error);
            throw error;
        }
    }

    function exportarDiagrama() {
        const formato = document.getElementById('formato-exportacion').value;
        const contenido = diagramaLadder.textContent;
        
        if (formato === 'texto') {
            // Exportar como archivo de texto
            const blob = new Blob([contenido], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'diagrama-ladder.txt';
            a.click();
            
            URL.revokeObjectURL(url);
        } else if (formato === 'imagen') {
            alert('La exportación a imagen estará disponible en una versión futura.');
            // Aquí se implementaría la conversión a imagen usando canvas o una biblioteca
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