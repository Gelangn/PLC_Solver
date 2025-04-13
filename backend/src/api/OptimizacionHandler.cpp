#include "OptimizacionHandler.h"
#include <sstream>
#include <algorithm>
#include <iostream>

// Nota: En una implementación real, usaríamos una biblioteca JSON
// como nlohmann/json, rapidjson, etc.
// Aquí simplificamos el parseo para la demostración

OptimizacionHandler::OptimizacionHandler() {
}

bool OptimizacionHandler::parsearEntrada(const std::string& jsonEntrada, 
                                        std::vector<int>& minterminos,
                                        int& numVariables,
                                        std::vector<std::string>& nombreVariables) {
    // Implementación simulada - en un caso real usaríamos una biblioteca JSON
    // Este es un parseo muy básico y frágil para demostración
    
    try {
        size_t posMinterminos = jsonEntrada.find("\"minterminos\":");
        size_t posNumVars = jsonEntrada.find("\"numVariables\":");
        size_t posNombres = jsonEntrada.find("\"nombreVariables\":");
        
        if (posMinterminos == std::string::npos || posNumVars == std::string::npos) {
            return false;
        }
        
        // Parsear mintérminos - muy simplificado
        size_t inicioArray = jsonEntrada.find('[', posMinterminos);
        size_t finArray = jsonEntrada.find(']', inicioArray);
        std::string strMinterminos = jsonEntrada.substr(inicioArray + 1, finArray - inicioArray - 1);
        
        // Dividir por comas
        size_t pos = 0;
        while ((pos = strMinterminos.find(',')) != std::string::npos || !strMinterminos.empty()) {
            std::string token;
            if (pos != std::string::npos) {
                token = strMinterminos.substr(0, pos);
                strMinterminos.erase(0, pos + 1);
            } else {
                token = strMinterminos;
                strMinterminos.clear();
            }
            
            // Eliminar espacios
            token.erase(std::remove_if(token.begin(), token.end(), ::isspace), token.end());
            
            if (!token.empty()) {
                minterminos.push_back(std::stoi(token));
            }
        }
        
        // Parsear número de variables
        size_t inicioNumVars = posNumVars + 15; // longitud de "\"numVariables\":"
        size_t finNumVars = jsonEntrada.find(',', inicioNumVars);
        if (finNumVars == std::string::npos) {
            finNumVars = jsonEntrada.find('}', inicioNumVars);
        }
        
        std::string strNumVars = jsonEntrada.substr(inicioNumVars, finNumVars - inicioNumVars);
        strNumVars.erase(std::remove_if(strNumVars.begin(), strNumVars.end(), ::isspace), strNumVars.end());
        numVariables = std::stoi(strNumVars);
        
        // Generar nombres de variables por defecto si no se proporcionan
        nombreVariables.resize(numVariables);
        for (int i = 0; i < numVariables; i++) {
            nombreVariables[i] = "X" + std::to_string(i);
        }
        
        // Parsear nombres de variables si están presentes
        if (posNombres != std::string::npos) {
            size_t inicioArrayNombres = jsonEntrada.find('[', posNombres);
            size_t finArrayNombres = jsonEntrada.find(']', inicioArrayNombres);
            std::string strNombres = jsonEntrada.substr(inicioArrayNombres + 1, finArrayNombres - inicioArrayNombres - 1);
            
            // Dividir por comas
            nombreVariables.clear();
            pos = 0;
            while ((pos = strNombres.find(',')) != std::string::npos || !strNombres.empty()) {
                std::string token;
                if (pos != std::string::npos) {
                    token = strNombres.substr(0, pos);
                    strNombres.erase(0, pos + 1);
                } else {
                    token = strNombres;
                    strNombres.clear();
                }
                
                // Eliminar espacios y comillas
                token.erase(std::remove_if(token.begin(), token.end(), 
                            [](char c) { return c == ' ' || c == '"'; }), token.end());
                
                if (!token.empty()) {
                    nombreVariables.push_back(token);
                }
            }
        }
        
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Error al parsear JSON: " << e.what() << std::endl;
        return false;
    }
}

std::string OptimizacionHandler::generarRespuesta(const std::string& expresion, 
                                               const std::string& ladder,
                                               const std::vector<Implicante>& implicantes) {
    // Implementación simplificada - en un caso real usaríamos una biblioteca JSON
    std::stringstream ss;
    
    ss << "{\n";
    ss << "  \"expresion\": \"" << expresion << "\",\n";
    ss << "  \"ladder\": \"" << ladder << "\",\n";
    ss << "  \"implicantes\": [\n";
    
    for (size_t i = 0; i < implicantes.size(); i++) {
        ss << "    {\n";
        ss << "      \"representacion\": \"" << implicantes[i].getRepresentacion() << "\",\n";
        ss << "      \"esEsencial\": " << (implicantes[i].getEsImplicanteEsencial() ? "true" : "false") << "\n";
        ss << "    }";
        
        if (i < implicantes.size() - 1) {
            ss << ",";
        }
        
        ss << "\n";
    }
    
    ss << "  ]\n";
    ss << "}\n";
    
    return ss.str();
}

std::string OptimizacionHandler::manejarOptimizacion(const std::string& jsonEntrada) {
    std::vector<int> minterminos;
    int numVariables;
    std::vector<std::string> nombreVariables;
    
    if (!parsearEntrada(jsonEntrada, minterminos, numVariables, nombreVariables)) {
        return "{\"error\": \"Error al parsear la entrada\"}";
    }
    
    try {
        // Crear y ejecutar el algoritmo
        QuineMcCluskey qmc(minterminos, nombreVariables);
        qmc.ejecutar();
        
        // Obtener resultados
        std::vector<Implicante> implicantesEsenciales = qmc.getImplicantesEsenciales();
        std::string expresion = qmc.obtenerExpresionMinimizada();
        
        // Generar código ladder
        LadderGenerator generador(nombreVariables);
        generador.setImplicantes(implicantesEsenciales);
        std::string ladder = generador.generarCodigoLadderTexto();
        
        // Generar respuesta JSON
        return generarRespuesta(expresion, ladder, implicantesEsenciales);
    } catch (const std::exception& e) {
        return "{\"error\": \"" + std::string(e.what()) + "\"}";
    }
}