# Usa uma imagem oficial do Node.js
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos da sua API pro container
COPY . .

# Instala as dependências
RUN npm install

# Expõe a porta usada pela API (ajuste se for diferente)
EXPOSE 3000

# Inicia a API
CMD ["npm", "start"]
