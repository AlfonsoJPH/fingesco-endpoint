# Fingesco Endpoint

Este submódulo contiene la lógica de los microservicios/endpoint para el proyecto Fingesco, encargados de recopilar y procesar datos de sensores y otros dispositivos asociados a fincas y enviar la información al backend principal.

## Índice
- [Descripción](#descripción)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Contribución](#contribución)
- [Licencia](#licencia)
- [Enlaces](#enlaces)

## Descripción
Este endpoint gestiona la comunicación con los dispositivos en cada finca, permitiendo el monitoreo en tiempo real y el control de sensores y actuadores como temperatura, humedad y sistemas de riego.

## Requisitos
- Node.js y npm
- Redis
- [Cualquier otro requisito necesario]

## Instalación

1. Clona este repositorio como parte del proyecto principal:
    ```bash
    git submodule init
    git submodule update
    ```

2. Instala las dependencias:
    ```bash
    npm install
    ```

## Uso
Para ejecutar el endpoint:
1. Configura las variables de entorno en un archivo `.env`, incluyendo las credenciales y puertos necesarios.
2. Ejecuta el endpoint:
    ```bash
    npm start
    ```

## Contribución

Si deseas contribuir a este submódulo, sigue estos pasos:

1. Realiza un fork del repositorio principal.
2. Crea una nueva rama (`git checkout -b feature/nueva-caracteristica`).
3. Realiza tus cambios y haz commit (`git commit -m 'Agrega nueva característica'`).
4. Envía un pull request.

## Licencia

Este proyecto está bajo la GNU Affero General Public License v3.0 - consulta el archivo LICENSE para más detalles.

## Enlaces
- [Repositorio Principal de Fingesco](https://github.com/AlfonsoJPH/fingesco)
