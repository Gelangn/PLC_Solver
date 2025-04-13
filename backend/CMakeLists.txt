cmake_minimum_required(VERSION 3.10)
project(plc_optimizer VERSION 0.1.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Incluir directorios de cabeceras
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Agregar biblioteca para el optimizador PLC
add_library(plc_optimizer_lib
    src/algoritmos/QuineMcCluskey.cpp
    src/modelos/Implicante.cpp
    src/modelos/Termino.cpp
    src/api/OptimizacionHandler.cpp
)

# Agregar el ejecutable principal
add_executable(plc_optimizer src/main.cpp)
target_link_libraries(plc_optimizer plc_optimizer_lib)

# Framework Crow para API REST (necesita instalación)
# find_package(Crow REQUIRED)
# target_link_libraries(plc_optimizer Crow::Crow)

# Configuración para pruebas
enable_testing()