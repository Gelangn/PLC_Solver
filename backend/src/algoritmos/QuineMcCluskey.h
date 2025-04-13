#pragma once
#include <vector>
#include <string>
#include <map>
#include <set>
#include "../modelos/Termino.h"
#include "../modelos/Implicante.h"

class QuineMcCluskey {
private:
    // Datos de entrada
    std::vector<int> minterminos;
    int numVariables;
    std::vector<std::string> nombreVariables;
    
    // Resultados intermedios y finales
    std::vector<Implicante> implicantesPrimos;
    std::vector<Implicante> implicantesEsenciales;
    
    // Métodos auxiliares del algoritmo
    std::map<int, std::vector<Termino>> agruparTerminosPorNumUnos(const std::vector<Termino>& terminos);
    std::vector<Termino> combinarGruposAdyacentes(const std::vector<Termino>& grupo1, const std::vector<Termino>& grupo2);
    std::vector<Implicante> encontrarImplicantesPrimos(const std::vector<Termino>& terminosIniciales);
    std::vector<Implicante> encontrarImplicantesEsenciales();
    std::string decimalABinario(int decimal) const;
    
public:
    // Constructor con parámetros básicos
    QuineMcCluskey(const std::vector<int>& minterms, int numVars);
    
    // Constructor con nombres de variables personalizados
    QuineMcCluskey(const std::vector<int>& minterms, const std::vector<std::string>& varNames);
    
    // Ejecutar el algoritmo completo
    void ejecutar();
    
    // Obtener resultados
    std::vector<Implicante> getImplicantesPrimos() const;
    std::vector<Implicante> getImplicantesEsenciales() const;
    
    // Convertir a expresiones y formatos útiles
    std::string obtenerExpresionMinimizada() const;
    std::string obtenerCodigoLadder() const;
};