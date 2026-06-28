FROM node:22-alpine

# Install Docker CLI so runner.js can spawn containers
RUN apk add --no-cache docker-cli

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all source files
COPY . .

EXPOSE 4000

CMD ["node", "server.js"]