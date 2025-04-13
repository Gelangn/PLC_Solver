#include "Implicante.h"
#include <algorithm>
#include <stdexcept>

Implicante::Implicante(const Termino& termino) 
    : representacion(termino.getRepresentacion()),
      minterminos(termino.getMinterminos()),
      esImplicantePrimo(false),
      esImplicanteEsencial(false) {
}

Implicante::Implicante(const std::string& rep, const std::vector<int>& mins)
    : representacion(rep),
      minterminos(mins),
      esImplicantePrimo(false),
      esImplicanteEsencial(false) {
}

std::string Implicante::getRepresentacion() const {
    return representacion;
}

const std::vector<int>& Implicante::getMinterminos() const {
    return minterminos;
}

bool Implicante::getEsImplicantePrimo() const {
    return esImplicantePrimo;
}

void Implicante::setEsImplicantePrimo(bool value) {
    esImplicantePrimo = value;
}

bool Implicante::getEsImplicanteEsencial() const {
    return esImplicanteEsencial;
}

void Implicante::setEsImplicanteEsencial(bool value) {
    esImplicanteEsencial = value;
}

bool Implicante::cubre(int mintermino) const {
    return std::find(minterminos.begin(), minterminos.end(), mintermino) != minterminos.end();
}

std::string Implicante::aExpresionBooleana(const std::vector<std::string>& nombreVariables) const {
    if (nombreVariables.size() != representacion.length()) {
        throw std::invalid_argument("El número de variables no coincide con la longitud de la representación");
    }
    
    std::string expresion;
    bool primerVariable = true;
    
    for (size_t i = 0; i < representacion.length(); i++) {
        if (representacion[i] != '-') {
            if (!primerVariable) {
                expresion += " & ";
            }
            
            if (representacion[i] == '0') {
                expresion += "!" + nombreVariables[i];
            } else {
                expresion += nombreVariables[i];
            }
            
            primerVariable = false;
        }
    }
    
    return expresion.empty() ? "1" : expresion; // Si todas son '-', representa TRUE (1)
}