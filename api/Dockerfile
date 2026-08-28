FROM node:20-slim

WORKDIR /app

# argon2 compile un module natif à l'installation : node-gyp a besoin de
# python3/make/g++, absents de l'image "slim" par défaut
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY data ./data

EXPOSE 3050

CMD ["npm", "start"]
