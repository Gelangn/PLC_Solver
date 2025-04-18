// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Versión simplificada que simula la optimización
app.post('/api/optimizar', (req, res) => {
    try {
        const datos = req.body;
        console.log('Datos recibidos:', datos);
        
        // Generar expresiones lógicas
        const expresiones = generarExpresionesMinimizadas(datos);
        
        // Simulamos el procesamiento que haría el C++
        const resultado = {
            expresion: expresiones,
            ladder: crearDiagramaLadder(datos)
        };
        
        res.json(resultado);
    } catch (error) {
        console.error('Error en el procesamiento:', error);
        res.status(500).json({ error: error.message });
    }
});

// Función para generar expresiones minimizadas
function generarExpresionesMinimizadas(datos) {
    return datos.condiciones.map(condicion => {
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
    }).join('\n');
}

// Reemplaza completamente la función crearDiagramaLadder con esta versión:
function crearDiagramaLadder(datos) {
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
                
                // Símbolos simplificados para contactos
                const simboloContacto = usarInvertida ? '---[/]---' : '---[ ]---';
                const anchoContacto = simboloContacto.length;
                
                // Añadir separador si no es el primer contacto
                if (i > 0) {
                    // CORRECCIÓN: Para líneas de direcciones y nombres usamos espacios
                    linea1 += ' '.repeat(8);
                    linea2 += ' '.repeat(8);
                    // CORRECCIÓN: Para la línea de símbolos usamos guiones
                    linea3 += '--------';
                }
                
                // CORRECCIÓN: Mostrar dirección y nombre para los contactos
                const direccionCentrada = centrarTexto(entrada.direccion, anchoContacto);
                const nombreCentrado = centrarTexto(entrada.nombre, anchoContacto);
                
                linea1 += direccionCentrada;
                linea2 += nombreCentrado;
                linea3 += simboloContacto;
            });
            
            // Calcular el espacio disponible entre el último contacto y donde debe empezar la bobina
            const espacioEntreContactosYBobina = posicionBobina - linea3.length;
            
            // Rellenar el espacio con guiones o espacios según corresponda
            if (espacioEntreContactosYBobina > 0) {
                linea1 += ' '.repeat(espacioEntreContactosYBobina);
                linea2 += ' '.repeat(espacioEntreContactosYBobina);
                linea3 += '-'.repeat(espacioEntreContactosYBobina);
            }
            
            // Añadir las etiquetas y bobina (ahora todos alineados a la misma posición)
            const anchoBobina = Math.max(16, 10 + Math.max(salida.direccion.length, salida.nombre.length));
            const direccionCentrada = centrarTexto(salida.direccion, anchoBobina);
            const nombreCentrado = centrarTexto(salida.nombre, anchoBobina);
            
            linea1 += direccionCentrada;
            linea2 += nombreCentrado;
            linea3 += '( )';
            
            // Reemplaza estas líneas en la función crearDiagramaLadder
            // CORRECCIÓN: Completar hasta el ancho total para alineación correcta
            const espacioRestante1 = Math.max(0, anchoTotal - linea1.length);
            const espacioRestante2 = Math.max(0, anchoTotal - linea2.length);
            const espacioRestante3 = Math.max(0, anchoTotal - linea3.length);
            
            ladder += linea1 + ' '.repeat(espacioRestante1) + '|\n';
            ladder += linea2 + ' '.repeat(espacioRestante2) + '|\n';
            ladder += linea3 + '-'.repeat(espacioRestante3) + '|\n';
            ladder += '|' + ' '.repeat(Math.max(0, anchoTotal - 1)) + '|\n';
        });
    });
    
    // Pie del diagrama
    ladder += '+' + '-'.repeat(anchoTotal) + '+\n';
    return ladder;
}

// Función auxiliar para centrar texto con mejor manejo de errores
function centrarTexto(texto, ancho) {
    // Asegurar que texto no sea null/undefined
    texto = texto || '';
    
    const espacios = Math.max(0, ancho - texto.length);
    const espaciosIzquierda = Math.floor(espacios / 2);
    const espaciosDerecha = Math.max(0, espacios - espaciosIzquierda);
    
    return ' '.repeat(espaciosIzquierda) + texto + ' '.repeat(espaciosDerecha);
}

app.listen(port, () => {
    console.log(`Servidor backend ejecutándose en http://localhost:${port}`);
});