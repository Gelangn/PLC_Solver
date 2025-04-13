#pragma once
#include <string>
#include <vector>
#include "../algoritmos/QuineMcCluskey.h"
#include "../algoritmos/LadderGenerator.h"

class OptimizacionHandler {
private:
    // Parsear JSON de entrada
    bool parsearEntrada(const std::string& jsonEntrada, 
                       std::vector<int>& minterminos,
                       int& numVariables,
                       std::vector<std::string>& nombreVariables);
                       
    // Generar JSON de respuesta
    std::string generarRespuesta(const std::string& expresion, 
                               const std::string& ladder,
                               const std::vector<Implicante>& implicantes);
                               
public:
    OptimizacionHandler();
    
    // Manejador principal para peticiones de optimización
    std::string manejarOptimizacion(const std::string& jsonEntrada);
};