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
    // Generar una versión simple del diagrama ladder textual
    let ladder = '+' + '-'.repeat(60) + '+\n';
    ladder += '|' + centrarTexto('DIAGRAMA LADDER PLC (IEC 61131-3)', 60) + '|\n';
    ladder += '+' + '-'.repeat(60) + '+\n';
    
    // Para cada condición, generar descripción textual
    datos.condiciones.forEach(condicion => {
        const salida = datos.salidas.find(s => s.id === condicion.salidaId);
        
        condicion.terminos.forEach((termino, i) => {
            // Descripción textual del término
            let descripcion = '| ';
            
            termino.entradas.forEach((entrada, j) => {
                const e = datos.entradas.find(x => x.id === entrada.id);
                const invertida = (entrada.estado === 'desactivado');
                const normalmente = e.normalmente || 'abierto';
                const usarInvertida = (normalmente === 'abierto') ? invertida : !invertida;
                
                descripcion += e.nombre + (usarInvertida ? '(NC)' : '(NA)');
                
                if (j < termino.entradas.length - 1) {
                    descripcion += ' AND ';
                }
            });
            
            descripcion += ' -> ' + salida.nombre;
            
            // Completar con espacios
            descripcion += ' '.repeat(Math.max(0, 58 - descripcion.length)) + '|\n';
            
            ladder += descripcion;
        });
        
        ladder += '|' + ' '.repeat(60) + '|\n';
    });
    
    ladder += '+' + '-'.repeat(60) + '+\n';
    return ladder;
}

function centrarTexto(texto, ancho) {
    const espacios = Math.max(0, ancho - texto.length);
    const espaciosIzquierda = Math.floor(espacios / 2);
    const espaciosDerecha = Math.max(0, espacios - espaciosIzquierda);
    
    return ' '.repeat(espaciosIzquierda) + texto + ' '.repeat(espaciosDerecha);
}

app.listen(port, () => {
    console.log(`Servidor backend ejecutándose en http://localhost:${port}`);
});