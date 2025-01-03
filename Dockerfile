FROM node:16

# Crear y establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto desde la variable de entorno
EXPOSE ${SERVER_PORT}

# Comando para ejecutar la aplicación
CMD ["node", "index.js"]
