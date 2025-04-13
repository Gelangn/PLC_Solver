#include "LadderGenerator.h"
#include <sstream>

LadderGenerator::LadderGenerator(const std::vector<std::string>& varNames)
    : nombreVariables(varNames) {
}

void LadderGenerator::setImplicantes(const std::vector<Implicante>& imps) {
    implicantes = imps;
}

std::string LadderGenerator::generarContacto(char tipo, const std::string& nombre) const {
    if (tipo == '0') {
        return "]-[/" + nombre + "]-["; // Contacto normalmente cerrado
    } else {
        return "]-[" + nombre + "]-["; // Contacto normalmente abierto
    }
}

std::string LadderGenerator::generarRama(const Implicante& implicante) const {
    std::stringstream ss;
    std::string rep = implicante.getRepresentacion();
    
    ss << "|";
    
    // Generar contactos para esta rama
    bool hayContactos = false;
    for (size_t i = 0; i < rep.length(); i++) {
        if (rep[i] != '-') {
            hayContactos = true;
            ss << generarContacto(rep[i], nombreVariables[i]);
        }
    }
    
    // Si no hay contactos, es una rama directa (TRUE)
    if (!hayContactos) {
        ss << "-------------";
    }
    
    ss << "( )--| Salida\n";
    
    return ss.str();
}

std::string LadderGenerator::generarCodigoLadderTexto() const {
    std::stringstream ss;
    
    ss << "+---------------------------------------+\n";
    ss << "|         Diagrama Ladder PLC          |\n";
    ss << "+---------------------------------------+\n";
    
    for (const Implicante& implicante : implicantes) {
        ss << generarRama(implicante);
    }
    
    ss << "+---------------------------------------+\n";
    
    return ss.str();
}

std::string LadderGenerator::generarCodigoLadderHTML() const {
    std::stringstream ss;
    
    ss << "<div class='ladder-diagram'>\n";
    ss << "  <h3>Diagrama Ladder PLC</h3>\n";
    ss << "  <div class='ladder-container'>\n";
    
    // Agregar cada rama como un div
    for (const Implicante& implicante : implicantes) {
        ss << "    <div class='ladder-rung'>\n";
        
        std::string rep = implicante.getRepresentacion();
        
        // Inicio de la rama
        ss << "      <span class='ladder-rail'>|</span>\n";
        
        // Generar contactos
        bool hayContactos = false;
        for (size_t i = 0; i < rep.length(); i++) {
            if (rep[i] != '-') {
                hayContactos = true;
                
                // Contacto abierto o cerrado
                if (rep[i] == '0') {
                    ss << "      <span class='ladder-contact-nc'>" << nombreVariables[i] << "</span>\n";
                } else {
                    ss << "      <span class='ladder-contact'>" << nombreVariables[i] << "</span>\n";
                }
            }
        }
        
        // Si no hay contactos, es una línea directa
        if (!hayContactos) {
            ss << "      <span class='ladder-wire'></span>\n";
        }
        
        // Bobina de salida
        ss << "      <span class='ladder-coil'>Salida</span>\n";
        ss << "      <span class='ladder-rail'>|</span>\n";
        ss << "    </div>\n";
    }
    
    ss << "  </div>\n";
    ss << "</div>\n";
    
    // Estilos CSS básicos para el diagrama
    ss << "<style>\n";
    ss << ".ladder-diagram { font-family: monospace; }\n";
    ss << ".ladder-container { border: 1px solid #ccc; padding: 10px; }\n";
    ss << ".ladder-rung { display: flex; align-items: center; margin: 5px 0; }\n";
    ss << ".ladder-rail { margin: 0 5px; }\n";
    ss << ".ladder-contact { border: 1px solid #000; padding: 2px 5px; margin: 0 2px; }\n";
    ss << ".ladder-contact-nc { border: 1px solid #000; padding: 2px 5px; margin: 0 2px; text-decoration: line-through; }\n";
    ss << ".ladder-coil { border: 1px solid #000; border-radius: 10px; padding: 2px 5px; margin: 0 5px; }\n";
    ss << ".ladder-wire { flex-grow: 1; border-top: 1px solid #000; height: 1px; }\n";
    ss << "</style>\n";
    
    return ss.str();
}

std::string LadderGenerator::generarCodigoLadderSVG() const {
    // Versión simplificada del SVG - en una implementación real sería más elaborado
    std::stringstream ss;
    
    int height = implicantes.size() * 50 + 20;
    int width = 500;
    
    ss << "<svg width='" << width << "' height='" << height 
       << "' xmlns='http://www.w3.org/2000/svg'>\n";
    
    // Estilo SVG
    ss << "  <style>\n";
    ss << "    .ladder-text { font-family: Arial; font-size: 12px; }\n";
    ss << "    .wire { stroke: black; stroke-width: 1; }\n";
    ss << "    .contact { stroke: black; fill: none; stroke-width: 1; }\n";
    ss << "    .coil { stroke: black; fill: none; stroke-width: 1; }\n";
    ss << "  </style>\n";
    
    // Título
    ss << "  <text x='10' y='15' class='ladder-text'>Diagrama Ladder PLC</text>\n";
    
    // Generar ramas
    for (size_t i = 0; i < implicantes.size(); i++) {
        int y = 30 + i * 50;
        const Implicante& implicante = implicantes[i];
        std::string rep = implicante.getRepresentacion();
        
        // Líneas verticales (rails)
        ss << "  <line x1='10' y1='" << y << "' x2='10' y2='" << (y + 20) 
           << "' class='wire'/>\n";
        ss << "  <line x1='490' y1='" << y << "' x2='490' y2='" << (y + 20) 
           << "' class='wire'/>\n";
        
        // Línea horizontal
        ss << "  <line x1='10' y1='" << (y + 10) << "' x2='490' y2='" << (y + 10) 
           << "' class='wire'/>\n";
        
        // Contactos
        int x = 30;
        bool hayContactos = false;
        
        for (size_t j = 0; j < rep.length(); j++) {
            if (rep[j] != '-') {
                hayContactos = true;
                
                // Contacto
                ss << "  <rect x='" << x << "' y='" << (y + 5) << "' width='60' height='10' class='contact'/>\n";
                
                // Texto del contacto
                if (rep[j] == '0') {
                    // Contacto NC - añadir una línea diagonal
                    ss << "  <line x1='" << x << "' y1='" << (y + 5) << "' x2='" << (x + 60) 
                       << "' y2='" << (y + 15) << "' class='wire'/>\n";
                }
                
                ss << "  <text x='" << (x + 5) << "' y='" << (y + 13) 
                   << "' class='ladder-text'>" << nombreVariables[j] << "</text>\n";
                
                x += 80;
            }
        }
        
        // Bobina de salida
        ss << "  <circle cx='450' cy='" << (y + 10) << "' r='15' class='coil'/>\n";
        ss << "  <text x='435' y='" << (y + 13) << "' class='ladder-text'>OUT</text>\n";
    }
    
    ss << "</svg>\n";
    
    return ss.str();
}

std::string LadderGenerator::generarCodigoLadderJSON() const {
    std::stringstream ss;
    
    ss << "{\n";
    ss << "  \"tipo\": \"diagramaLadder\",\n";
    ss << "  \"ramas\": [\n";
    
    for (size_t i = 0; i < implicantes.size(); i++) {
        const Implicante& implicante = implicantes[i];
        std::string rep = implicante.getRepresentacion();
        
        ss << "    {\n";
        ss << "      \"id\": " << i << ",\n";
        ss << "      \"contactos\": [\n";
        
        bool primero = true;
        for (size_t j = 0; j < rep.length(); j++) {
            if (rep[j] != '-') {
                if (!primero) {
                    ss << ",\n";
                }
                
                ss << "        {\n";
                ss << "          \"variable\": \"" << nombreVariables[j] << "\",\n";
                ss << "          \"tipo\": \"" << (rep[j] == '0' ? "NC" : "NA") << "\"\n";
                ss << "        }";
                
                primero = false;
            }
        }
        
        ss << "\n      ],\n";
        ss << "      \"salida\": \"Salida\"\n";
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

std::string LadderGenerator::generarCodigoLadder(FormatoSalida formato) const {
    switch (formato) {
        case FormatoSalida::HTML:
            return generarCodigoLadderHTML();
        case FormatoSalida::SVG:
            return generarCodigoLadderSVG();
        case FormatoSalida::JSON:
            return generarCodigoLadderJSON();
        case FormatoSalida::TEXTO_SIMPLE:
        default:
            return generarCodigoLadderTexto();
    }
}