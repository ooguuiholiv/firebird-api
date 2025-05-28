FROM node:20

# Instala Firebird client e dependências
RUN apt-get update && apt-get install -y \
    firebird-dev \
    firebird3.0-utils \
    libfbclient2 \
    unixodbc \
    && rm -rf /var/lib/apt/lists/*

# Define diretório de trabalho
WORKDIR /usr/src/app

# Copia arquivos da API
COPY . .

# Instala dependências do Node.js
RUN npm install

# Expõe a porta da API
EXPOSE 7000

# Inicia a aplicação
CMD ["npm", "start"]
