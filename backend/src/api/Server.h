#pragma once
#include <string>
#include <functional>
#include <map>
#include <vector>

// Definición simplificada para un manejador de peticiones HTTP
typedef std::function<std::string(const std::string&)> RequestHandler;

class Server {
private:
    int puerto;
    bool ejecutando;
    std::map<std::string, RequestHandler> rutas;
    
    // Para un servidor real usaríamos una biblioteca como Crow, Pistache, etc.
    // Aquí simplificamos para la demostración
    void procesarPeticion(const std::string& ruta, const std::string& cuerpo);
    
public:
    Server(int port = 8080);
    ~Server();
    
    // Registrar manejadores para diferentes rutas
    void agregarRuta(const std::string& ruta, RequestHandler manejador);
    
    // Iniciar y detener el servidor
    bool iniciar();
    void detener();
    
    // Método simulado para procesar una solicitud (para pruebas)
    std::string procesarSolicitudSimulada(const std::string& ruta, const std::string& cuerpo);
};