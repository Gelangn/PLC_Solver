#include <iostream>
#include <vector>
#include <string>
#include "modelos/Termino.h"
#include "modelos/Implicante.h"
#include "algoritmos/QuineMcCluskey.h"
#include "algoritmos/LadderGenerator.h"
#include "api/Server.h"
#include "api/OptimizacionHandler.h"

int main() {
    std::cout << "Iniciando servidor de optimización PLC usando Quine-McCluskey..." << std::endl;
    
    // Crear manejador de optimización
    OptimizacionHandler optimizacionHandler;
    
    // Configurar servidor
    Server server(8080);
    
    // Registrar rutas
    server.agregarRuta("/api/optimizar", [&optimizacionHandler](const std::string& cuerpo) {
        return optimizacionHandler.manejarOptimizacion(cuerpo);
    });
    
    // Iniciar servidor
    if (!server.iniciar()) {
        std::cerr << "Error al iniciar el servidor" << std::endl;
        return 1;
    }
    
    // Ejemplo de uso directo del algoritmo para pruebas
    try {
        std::vector<int> minterminos = {1, 2, 5, 6, 7};
        std::vector<std::string> nombreVariables = {"A", "B", "C"};
        
        QuineMcCluskey qmc(minterminos, nombreVariables);
        qmc.ejecutar();
        
        std::string expresion = qmc.obtenerExpresionMinimizada();
        std::cout << "Expresión minimizada: " << expresion << std::endl;
        
        std::vector<Implicante> implicantesEsenciales = qmc.getImplicantesEsenciales();
        
        LadderGenerator generador(nombreVariables);
        generador.setImplicantes(implicantesEsenciales);
        std::string ladder = generador.generarCodigoLadderTexto();
        
        std::cout << "Diagrama Ladder:\n" << ladder << std::endl;
        
        // Simulación de una petición API
        std::string jsonPrueba = "{"
            "\"minterminos\": [1, 2, 5, 6, 7],"
            "\"numVariables\": 3,"
            "\"nombreVariables\": [\"A\", \"B\", \"C\"]"
            "}";
            
        std::string respuesta = server.procesarSolicitudSimulada("/api/optimizar", jsonPrueba);
        std::cout << "Respuesta API simulada:\n" << respuesta << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
    
    // En una aplicación real, mantendríamos el servidor ejecutando hasta recibir señal de cierre
    std::cout << "Presiona Enter para finalizar..." << std::endl;
    std::cin.get();
    
    server.detener();
    return 0;
}