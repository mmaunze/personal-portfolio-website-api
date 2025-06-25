# Dockerfile para Portfolio API
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY src/ ./src/
COPY uploads/ ./uploads/

# Criar utilizador não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Alterar propriedade dos ficheiros
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]

