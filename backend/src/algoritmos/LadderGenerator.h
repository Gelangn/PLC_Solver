#pragma once
#include <vector>
#include <string>
#include "../modelos/Implicante.h"

class LadderGenerator {
private:
    std::vector<std::string> nombreVariables;
    std::vector<Implicante> implicantes;
    
    // Formato de salida
    enum class FormatoSalida {
        TEXTO_SIMPLE,
        HTML,
        SVG,
        JSON
    };
    
    // Métodos auxiliares
    std::string generarContacto(char tipo, const std::string& nombre) const;
    std::string generarRama(const Implicante& implicante) const;
    
public:
    LadderGenerator(const std::vector<std::string>& varNames);
    
    // Establecer implicantes a usar
    void setImplicantes(const std::vector<Implicante>& imps);
    
    // Generar código ladder en diferentes formatos
    std::string generarCodigoLadderTexto() const;
    std::string generarCodigoLadderHTML() const;
    std::string generarCodigoLadderSVG() const;
    std::string generarCodigoLadderJSON() const;
    
    // Método general para generar según formato
    std::string generarCodigoLadder(FormatoSalida formato = FormatoSalida::TEXTO_SIMPLE) const;
};