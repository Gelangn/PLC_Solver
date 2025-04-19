// Módulo para manejar la tabla de entradas
const inputTable = (() => {
    // Variables privadas
    let estado;
    let entradasCuerpo;

    // Función de inicialización
    function init(appEstado, elementosDOM) {
        estado = appEstado;
        entradasCuerpo = elementosDOM.entradasCuerpo;
        
        // Asignar event listeners
        elementosDOM.btnAgregarEntrada.addEventListener('click', agregarFilaEntrada);
    }

    // Agregar una nueva fila de entrada
    function agregarFilaEntrada() {
        // Calcula la nueva dirección en formato I0.0, I0.1, etc.
        const entradaNum = estado.entradas.length;
        const bloqueI = Math.floor(entradaNum / 16);
        const subIndice = entradaNum % 16;
        const direccion = `I${bloqueI}.${subIndice}`;
        
        const nuevaEntrada = {
            id: generarId('E'),
            nombre: `Entrada${estado.entradas.length + 1}`,
            direccion: direccion,
            descripcion: '',
            normalmente: 'abierto'
        };
        
        estado.entradas.push(nuevaEntrada);
        renderizarEntradas();
        guardarEstado();
    }

    function eliminarEntrada(id) {
        const index = estado.entradas.findIndex(entrada => entrada.id === id);
        if (index !== -1) {
            estado.entradas.splice(index, 1);
            renderizarEntradas();
            guardarEstado();
        }
    }

    function renderizarEntradas() {
        entradasCuerpo.innerHTML = '';
        
        estado.entradas.forEach(entrada => {
            const fila = document.createElement('tr');
            
            // Columna Nombre
            const celdaNombre = document.createElement('td');
            const inputNombre = document.createElement('input');
            inputNombre.type = 'text';
            inputNombre.className = 'entrada-nombre';
            inputNombre.value = entrada.nombre;
            inputNombre.setAttribute('data-id', entrada.id);
            celdaNombre.appendChild(inputNombre);
            
            // Columna Dirección
            const celdaDireccion = document.createElement('td');
            const inputDireccion = document.createElement('input');
            inputDireccion.type = 'text';
            inputDireccion.className = 'entrada-direccion';
            inputDireccion.value = entrada.direccion;
            inputDireccion.setAttribute('data-id', entrada.id);
            celdaDireccion.appendChild(inputDireccion);
            
            // Columna Descripción
            const celdaDescripcion = document.createElement('td');
            const inputDescripcion = document.createElement('input');
            inputDescripcion.type = 'text';
            inputDescripcion.className = 'entrada-descripcion';
            inputDescripcion.value = entrada.descripcion;
            inputDescripcion.setAttribute('data-id', entrada.id);
            celdaDescripcion.appendChild(inputDescripcion);
            
            // Columna Normalmente (Abierto/Cerrado)
            const celdaNormalmente = document.createElement('td');
            const selectNormalmente = document.createElement('select');
            selectNormalmente.className = 'entrada-normalmente';
            selectNormalmente.setAttribute('data-id', entrada.id);
            
            const optionAbierto = document.createElement('option');
            optionAbierto.value = 'abierto';
            optionAbierto.textContent = 'Abierto (NA)';
            if (entrada.normalmente === 'abierto') {
                optionAbierto.selected = true;
            }
            
            const optionCerrado = document.createElement('option');
            optionCerrado.value = 'cerrado';
            optionCerrado.textContent = 'Cerrado (NC)';
            if (entrada.normalmente === 'cerrado') {
                optionCerrado.selected = true;
            }
            
            selectNormalmente.appendChild(optionAbierto);
            selectNormalmente.appendChild(optionCerrado);
            celdaNormalmente.appendChild(selectNormalmente);
            
            // Columna Acciones
            const celdaAcciones = document.createElement('td');
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn-icon';
            btnEliminar.textContent = '🗑️';
            btnEliminar.addEventListener('click', () => eliminarEntrada(entrada.id));
            celdaAcciones.appendChild(btnEliminar);
            
            // Agregar celdas a la fila
            fila.appendChild(celdaNombre);
            fila.appendChild(celdaDireccion);
            fila.appendChild(celdaDescripcion);
            fila.appendChild(celdaNormalmente);
            fila.appendChild(celdaAcciones);
            
            // Agregar fila a la tabla
            entradasCuerpo.appendChild(fila);
            
            // Agregar event listeners para actualizar el estado
            inputNombre.addEventListener('change', function() {
                actualizarEntrada(entrada.id, 'nombre', this.value);
            });
            
            inputDireccion.addEventListener('change', function() {
                actualizarEntrada(entrada.id, 'direccion', this.value);
            });
            
            inputDescripcion.addEventListener('change', function() {
                actualizarEntrada(entrada.id, 'descripcion', this.value);
            });
            
            selectNormalmente.addEventListener('change', function() {
                actualizarEntrada(entrada.id, 'normalmente', this.value);
            });
        });
    }
    
    // Actualizar datos de entrada
    function actualizarEntrada(id, propiedad, valor) {
        const entrada = estado.entradas.find(e => e.id === id);
        if (entrada) {
            entrada[propiedad] = valor;
            guardarEstado();
        }
    }

    // Retornar funciones públicas
    return {
        init,
        renderizarEntradas,
        agregarFilaEntrada,
        eliminarEntrada
    };
})();