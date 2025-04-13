#pragma once
#include <vector>
#include <string>
#include "Termino.h"

class Implicante {
private:
    std::string representacion;
    std::vector<int> minterminos;
    bool esImplicantePrimo;
    bool esImplicanteEsencial;

public:
    Implicante(const Termino& termino);
    Implicante(const std::string& rep, const std::vector<int>& mins);
    
    std::string getRepresentacion() const;
    const std::vector<int>& getMinterminos() const;
    
    bool getEsImplicantePrimo() const;
    void setEsImplicantePrimo(bool value);
    
    bool getEsImplicanteEsencial() const;
    void setEsImplicanteEsencial(bool value);
    
    bool cubre(int mintermino) const;
    
    // Para conversión a expresión booleana/ladder
    std::string aExpresionBooleana(const std::vector<std::string>& nombreVariables) const;
};