#include "QuineMcCluskey.h"
#include <algorithm>
#include <sstream>
#include <stdexcept>
#include <bitset>
#include <cmath>

QuineMcCluskey::QuineMcCluskey(const std::vector<int>& minterms, int numVars)
    : minterminos(minterms), numVariables(numVars) {
    
    // Validar que los mintérminos sean válidos para el número de variables
    int maxMintermino = static_cast<int>(std::pow(2, numVariables)) - 1;
    for (int m : minterminos) {
        if (m < 0 || m > maxMintermino) {
            throw std::invalid_argument("Mintérmino fuera de rango para el número de variables especificado");
        }
    }
    
    // Inicializar nombres de variables por defecto (X0, X1, X2, ...)
    nombreVariables.resize(numVariables);
    for (int i = 0; i < numVariables; i++) {
        nombreVariables[i] = "X" + std::to_string(i);
    }
}

QuineMcCluskey::QuineMcCluskey(const std::vector<int>& minterms, const std::vector<std::string>& varNames)
    : minterminos(minterms), nombreVariables(varNames) {
    
    numVariables = varNames.size();
    
    // Validar que los mintérminos sean válidos para el número de variables
    int maxMintermino = static_cast<int>(std::pow(2, numVariables)) - 1;
    for (int m : minterminos) {
        if (m < 0 || m > maxMintermino) {
            throw std::invalid_argument("Mintérmino fuera de rango para el número de variables especificado");
        }
    }
}

void QuineMcCluskey::ejecutar() {
    // Paso 1: Convertir mintérminos a términos con representación binaria
    std::vector<Termino> terminos;
    for (int mintermino : minterminos) {
        std::string binario = decimalABinario(mintermino);
        std::vector<int> mins = {mintermino};
        terminos.push_back(Termino(binario, mins));
    }
    
    // Paso 2: Encontrar implicantes primos
    implicantesPrimos = encontrarImplicantesPrimos(terminos);
    
    // Paso 3: Encontrar implicantes primos esenciales
    implicantesEsenciales = encontrarImplicantesEsenciales();
}

std::string QuineMcCluskey::decimalABinario(int decimal) const {
    std::string binario;
    
    // Convertir a binario usando bitset
    std::bitset<32> bits(decimal);
    
    // Tomar solo los bits necesarios según el número de variables
    binario = bits.to_string().substr(32 - numVariables);
    
    return binario;
}

std::map<int, std::vector<Termino>> QuineMcCluskey::agruparTerminosPorNumUnos(
        const std::vector<Termino>& terminos) {
    
    std::map<int, std::vector<Termino>> grupos;
    
    for (const Termino& termino : terminos) {
        int numUnos = termino.getNumUnos();
        grupos[numUnos].push_back(termino);
    }
    
    return grupos;
}

std::vector<Termino> QuineMcCluskey::combinarGruposAdyacentes(
        const std::vector<Termino>& grupo1, 
        const std::vector<Termino>& grupo2) {
    
    std::vector<Termino> terminosCombinados;
    std::set<std::string> representacionesUsadas;
    
    for (const Termino& t1 : grupo1) {
        for (const Termino& t2 : grupo2) {
            if (t1.puedeCombinadoCon(t2)) {
                Termino combinado = t1.combinarCon(t2);
                
                // Evitar duplicados
                if (representacionesUsadas.find(combinado.getRepresentacion()) == 
                    representacionesUsadas.end()) {
                    
                    terminosCombinados.push_back(combinado);
                    representacionesUsadas.insert(combinado.getRepresentacion());
                }
            }
        }
    }
    
    return terminosCombinados;
}

std::vector<Implicante> QuineMcCluskey::encontrarImplicantesPrimos(
        const std::vector<Termino>& terminosIniciales) {
    
    std::vector<Termino> terminosActuales = terminosIniciales;
    std::set<std::string> implicantesPrimosRep;
    std::vector<Implicante> implicantesPrimos;
    
    bool seRealizoCombinacion = true;
    
    while (seRealizoCombinacion && !terminosActuales.empty()) {
        // Agrupar por número de unos
        std::map<int, std::vector<Termino>> grupos = agruparTerminosPorNumUnos(terminosActuales);
        
        // Marcar términos que no se combinaron como implicantes primos
        std::set<std::string> terminosCombinados;
        
        // Intentar combinar grupos adyacentes
        std::vector<Termino> nuevosTerminos;
        seRealizoCombinacion = false;
        
        // Iterar sobre grupos adyacentes
        for (auto it = grupos.begin(); it != std::prev(grupos.end()); ++it) {
            int numUnos = it->first;
            int siguienteNumUnos = std::next(it)->first;
            
            // Solo combinar si los grupos son adyacentes (difieren en 1 uno)
            if (siguienteNumUnos == numUnos + 1) {
                std::vector<Termino> combinados = combinarGruposAdyacentes(
                    it->second, std::next(it)->second);
                
                if (!combinados.empty()) {
                    seRealizoCombinacion = true;
                    
                    // Marcar los términos que se combinaron
                    for (const Termino& t1 : it->second) {
                        for (const Termino& t2 : std::next(it)->second) {
                            if (t1.puedeCombinadoCon(t2)) {
                                terminosCombinados.insert(t1.getRepresentacion());
                                terminosCombinados.insert(t2.getRepresentacion());
                            }
                        }
                    }
                    
                    // Agregar los términos combinados para la siguiente iteración
                    nuevosTerminos.insert(nuevosTerminos.end(), combinados.begin(), combinados.end());
                }
            }
        }
        
        // Identificar implicantes primos (términos que no se combinaron)
        for (const Termino& termino : terminosActuales) {
            if (terminosCombinados.find(termino.getRepresentacion()) == terminosCombinados.end() &&
                implicantesPrimosRep.find(termino.getRepresentacion()) == implicantesPrimosRep.end()) {
                
                Implicante implicante(termino);
                implicante.setEsImplicantePrimo(true);
                implicantesPrimos.push_back(implicante);
                implicantesPrimosRep.insert(termino.getRepresentacion());
            }
        }
        
        // Actualizar para la siguiente iteración
        terminosActuales = nuevosTerminos;
    }
    
    return implicantesPrimos;
}

std::vector<Implicante> QuineMcCluskey::encontrarImplicantesEsenciales() {
    std::vector<Implicante> resultado;
    
    // Crear un mapa para seguir qué mintérminos han sido cubiertos
    std::map<int, std::vector<Implicante*>> mintermACubrimiento;
    
    // Para cada mintérmino, encontrar los implicantes primos que lo cubren
    for (Implicante& implicante : implicantesPrimos) {
        for (int minterm : implicante.getMinterminos()) {
            mintermACubrimiento[minterm].push_back(&implicante);
        }
    }
    
    // Encontrar implicantes esenciales (los que son únicos en cubrir algún mintérmino)
    std::set<Implicante*> implicantesEsencialesPtrs;
    
    for (const auto& par : mintermACubrimiento) {
        if (par.second.size() == 1) {
            // Este implicante es esencial porque es el único que cubre este mintérmino
            Implicante* implicante = par.second[0];
            implicante->setEsImplicanteEsencial(true);
            implicantesEsencialesPtrs.insert(implicante);
        }
    }
    
    // Convertir punteros a implicantes esenciales
    for (Implicante* ptr : implicantesEsencialesPtrs) {
        resultado.push_back(*ptr);
    }
    
    return resultado;
}

std::vector<Implicante> QuineMcCluskey::getImplicantesEsenciales() const {
    return implicantesEsenciales;
}

std::string QuineMcCluskey::obtenerExpresionMinimizada() const {
    if (implicantesEsenciales.empty()) {
        return "0"; // Si no hay implicantes esenciales, la función es 0
    }
    
    std::stringstream ss;
    bool primerTermino = true;
    
    for (const Implicante& implicante : implicantesEsenciales) {
        if (!primerTermino) {
            ss << " + ";
        }
        ss << implicante.aExpresionBooleana(nombreVariables);
        primerTermino = false;
    }
    
    return ss.str();
}