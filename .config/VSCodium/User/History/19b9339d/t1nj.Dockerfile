FROM node:23-bullseye-slim

WORKDIR /workspace

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    nano \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g npm@latest nodemon

EXPOSE 5173 3001

RUN chown -R node:node /workspace

USER node

CMD ["sh", "-c", "trap : TERM INT; sleep infinity & wait"]