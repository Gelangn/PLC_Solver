#include "Termino.h"
#include <algorithm>
#include <stdexcept>

// SOLO implementaciones, no redeclares la clase aquí

Termino::Termino(const std::string& rep, const std::vector<int>& mins) 
    : representacion(rep), minterminos(mins) {
    numUnos = std::count(rep.begin(), rep.end(), '1');
}

std::string Termino::getRepresentacion() const {
    return representacion;
}

const std::vector<int>& Termino::getMinterminos() const {
    return minterminos;
}

int Termino::getNumUnos() const {
    return numUnos;
}

bool Termino::puedeCombinadoCon(const Termino& otro) const {
    // Verificar si solo difieren en un bit
    if (representacion.length() != otro.representacion.length()) {
        return false;
    }
    
    int diferencias = 0;
    size_t posicionDiferencia = 0;
    
    for (size_t i = 0; i < representacion.length(); i++) {
        if (representacion[i] != otro.representacion[i]) {
            diferencias++;
            posicionDiferencia = i;
            if (diferencias > 1) {
                return false;
            }
        }
    }
    
    return diferencias == 1;
}

Termino Termino::combinarCon(const Termino& otro) const {
    if (!puedeCombinadoCon(otro)) {
        throw std::invalid_argument("Los términos no pueden combinarse");
    }
    
    std::string nuevaRep = representacion;
    for (size_t i = 0; i < representacion.length(); i++) {
        if (representacion[i] != otro.representacion[i]) {
            nuevaRep[i] = '-'; // Marcar la posición que difiere con un guion
            break;
        }
    }
    
    // Unir los mintérminos
    std::vector<int> nuevosMinterminos = minterminos;
    nuevosMinterminos.insert(nuevosMinterminos.end(), 
                            otro.minterminos.begin(), 
                            otro.minterminos.end());
    
    return Termino(nuevaRep, nuevosMinterminos);
}