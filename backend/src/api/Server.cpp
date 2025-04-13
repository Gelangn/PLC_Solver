#include "Server.h"
#include <iostream>
#include <thread>
#include <chrono>

// Nota: Esta es una implementación simulada. Un servidor real requeriría
// una biblioteca HTTP adecuada.

Server::Server(int port) : puerto(port), ejecutando(false) {
}

Server::~Server() {
    if (ejecutando) {
        detener();
    }
}

void Server::agregarRuta(const std::string& ruta, RequestHandler manejador) {
    rutas[ruta] = manejador;
}

bool Server::iniciar() {
    if (ejecutando) {
        return false;
    }
    
    ejecutando = true;
    std::cout << "Servidor iniciado en puerto " << puerto << std::endl;
    
    // En un servidor real, aquí iniciaríamos el bucle de escucha HTTP
    // En este ejemplo simulado, simplemente indicamos que está listo
    
    return true;
}

void Server::detener() {
    if (!ejecutando) {
        return;
    }
    
    ejecutando = false;
    std::cout << "Servidor detenido" << std::endl;
}

void Server::procesarPeticion(const std::string& ruta, const std::string& cuerpo) {
    if (rutas.find(ruta) != rutas.end()) {
        std::string respuesta = rutas[ruta](cuerpo);
        std::cout << "Respuesta para " << ruta << ": " << respuesta << std::endl;
    } else {
        std::cout << "Ruta no encontrada: " << ruta << std::endl;
    }
}

std::string Server::procesarSolicitudSimulada(const std::string& ruta, const std::string& cuerpo) {
    if (rutas.find(ruta) != rutas.end()) {
        return rutas[ruta](cuerpo);
    }
    return "{\"error\": \"Ruta no encontrada\"}";
}