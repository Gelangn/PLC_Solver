// Módulo para manejar la tabla de salidas
const outputTable = (() => {
    // Variables privadas
    let estado;
    let salidasCuerpo;

    // Función de inicialización
    function init(appEstado, elementosDOM) {
        estado = appEstado;
        salidasCuerpo = elementosDOM.salidasCuerpo;
        
        // Asignar event listeners
        elementosDOM.btnAgregarSalida.addEventListener('click', agregarFilaSalida);
    }

    // Funciones exportadas
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
            guardarEstado();
        }
    }

    function renderizarSalidas() {
        salidasCuerpo.innerHTML = '';
        
        estado.salidas.forEach(salida => {
            const fila = document.createElement('tr');
            
            // Columna Nombre
            const celdaNombre = document.createElement('td');
            const inputNombre = document.createElement('input');
            inputNombre.type = 'text';
            inputNombre.className = 'salida-nombre';
            inputNombre.value = salida.nombre;
            inputNombre.setAttribute('data-id', salida.id);
            celdaNombre.appendChild(inputNombre);
            
            // Columna Dirección
            const celdaDireccion = document.createElement('td');
            const inputDireccion = document.createElement('input');
            inputDireccion.type = 'text';
            inputDireccion.className = 'salida-direccion';
            inputDireccion.value = salida.direccion;
            inputDireccion.setAttribute('data-id', salida.id);
            celdaDireccion.appendChild(inputDireccion);
            
            // Columna Descripción
            const celdaDescripcion = document.createElement('td');
            const inputDescripcion = document.createElement('input');
            inputDescripcion.type = 'text';
            inputDescripcion.className = 'salida-descripcion';
            inputDescripcion.value = salida.descripcion;
            inputDescripcion.setAttribute('data-id', salida.id);
            celdaDescripcion.appendChild(inputDescripcion);
            
            // Columna Acciones
            const celdaAcciones = document.createElement('td');
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn-icon btn-eliminar-salida';
            btnEliminar.textContent = '🗑️';
            btnEliminar.setAttribute('data-id', salida.id);
            celdaAcciones.appendChild(btnEliminar);
            
            // Agregar celdas a la fila
            fila.appendChild(celdaNombre);
            fila.appendChild(celdaDireccion);
            fila.appendChild(celdaDescripcion);
            fila.appendChild(celdaAcciones);
            
            // Agregar fila a la tabla
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
        }
        guardarEstado();
    }
    
    // Función auxiliar para generar IDs únicos
    function generarId(prefijo) {
        return prefijo + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    
    function guardarEstado() {
        // Guardar estado en localStorage
        localStorage.setItem('plcSolverState', JSON.stringify(estado));
    }

    // Exponer funciones públicas
    return {
        init,
        agregarFilaSalida,
        eliminarSalida,
        renderizarSalidas
    };
})();

// Exportar el módulo
window.outputTable = outputTable;