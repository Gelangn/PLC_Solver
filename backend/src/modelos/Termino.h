#pragma once
#include <string>
#include <vector>

class Termino {
private:
    std::string representacion;
    std::vector<int> minterminos;
    int numUnos;

public:
    Termino(const std::string& rep, const std::vector<int>& mins);
    
    std::string getRepresentacion() const;
    const std::vector<int>& getMinterminos() const;
    int getNumUnos() const;
    
    bool puedeCombinadoCon(const Termino& otro) const;
    Termino combinarCon(const Termino& otro) const;
};