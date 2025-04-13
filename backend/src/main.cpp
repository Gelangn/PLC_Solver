#include <iostream>
#include <vector>
#include <string>
#include "modelos/Termino.h"
#include "modelos/Implicante.h"

// Cuando tengamos implementado el server:
// #include "api/Server.h"

int main() {
    std::cout << "Iniciando aplicación de optimización PLC usando Quine-McCluskey..." << std::endl;
    
    // Ejemplo básico de uso de las clases
    std::string representacion = "101";
    std::vector<int> minterminos = {5};
    
    Termino t1(representacion, minterminos);
    std::cout << "Término creado: " << t1.getRepresentacion() << " con " 
              << t1.getNumUnos() << " unos" << std::endl;
    
    // En el futuro, inicialización del servidor
    // Server server;
    // server.run();
    
    return 0;
}