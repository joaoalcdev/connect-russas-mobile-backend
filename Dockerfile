# Use uma imagem Node.js oficial como base (escolha uma versão LTS ou a que seu projeto usa)
FROM node:20-alpine AS builder

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie os arquivos de dependência
COPY package*.json ./

# Instale as dependências de produção e desenvolvimento (necessárias para build)
RUN npm install

# Copie o schema do Prisma
COPY prisma ./prisma/

# Gere o Prisma Client (necessário antes de compilar o TS)
RUN npx prisma generate

# Copie o restante do código da aplicação
COPY tsconfig.json ./
COPY src ./src

# Compile o TypeScript para JavaScript
RUN npm run build

# --- Estágio de Produção ---
FROM node:20-alpine

WORKDIR /app

# Copie apenas as dependências de produção do estágio de build
COPY --from=builder /app/node_modules ./node_modules
# Copie o código compilado do estágio de build
COPY --from=builder /app/dist ./dist
# Copie package.json (pode ser útil para scripts ou metadados)
COPY package.json ./
# Copie o tsconfig.json para que o tsconfig-paths possa registrar os paths
COPY tsconfig.json ./

# Exponha a porta que a aplicação usa (definida no .env ou padrão 3000)
EXPOSE 3000

# Comando para iniciar a aplicação registrando os paths do tsconfig
CMD ["node", "-r", "tsconfig-paths/register", "dist/server.js"]