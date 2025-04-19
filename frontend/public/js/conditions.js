// Módulo para manejar las condiciones lógicas
const conditions = (() => {
    // Variables privadas
    let estado;
    let modalCondicion;
    let btnGuardarCondicion;
    let btnCancelarCondicion;
    let condicionSalida;
    let condicionEntradasContainer;
    let btnAgregarTermino;
    let condicionesContainer;
    
    // Variables para el modo edición
    let modoEdicion = false;
    let indiceEdicion = -1;

    // Función de inicialización
    function init(appEstado, elementosDOM) {
        estado = appEstado;
        modalCondicion = elementosDOM.modalCondicion;
        btnGuardarCondicion = elementosDOM.btnGuardarCondicion;
        btnCancelarCondicion = elementosDOM.btnCancelarCondicion;
        condicionSalida = elementosDOM.condicionSalida;
        condicionEntradasContainer = elementosDOM.condicionEntradasContainer;
        btnAgregarTermino = elementosDOM.btnAgregarTermino;
        condicionesContainer = elementosDOM.condicionesContainer;
        
        // Asignar event listeners
        elementosDOM.btnAgregarCondicion.addEventListener('click', mostrarModalCondicion);
        btnGuardarCondicion.addEventListener('click', guardarCondicion);
        btnCancelarCondicion.addEventListener('click', cerrarModalCondicion);
        btnAgregarTermino.addEventListener('click', agregarTerminoEntrada);
        document.querySelector('.modal-close').addEventListener('click', cerrarModalCondicion);
        
        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function(event) {
            if (event.target === modalCondicion) {
                cerrarModalCondicion();
            }
        });
    }

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
        
        // Selector de entrada
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
                const estadoEntrada = entradaDiv.querySelector('.estado-selector').value;
                
                const entrada = estado.entradas.find(e => e.id === entradaId);
                if (entrada) {
                    entradas.push({
                        id: entradaId,
                        nombre: entrada.nombre,
                        estado: estadoEntrada
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

    function cerrarModalCondicion() {
        modalCondicion.style.display = 'none';
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
        if (confirm('¿Estás seguro de eliminar esta condición?')) {
            estado.condiciones = estado.condiciones.filter(c => c.id !== id);
            renderizarCondiciones();
            guardarEstado();
        }
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
                eliminarCondicion(condicion.id);
            });
            
            accionesDiv.appendChild(btnEditar);
            accionesDiv.appendChild(btnEliminar);
            
            condicionDiv.appendChild(textoDiv);
            condicionDiv.appendChild(accionesDiv);
            
            condicionesContainer.appendChild(condicionDiv);
        });
    }

    // Retornar funciones públicas
    return {
        init,
        renderizarCondiciones,
        editarCondicion,
        eliminarCondicion
    };
})();