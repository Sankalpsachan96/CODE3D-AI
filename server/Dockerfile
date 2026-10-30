FROM node:22-bookworm

# Install compilers and runtime tools before dropping privileges.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        openjdk-17-jdk \
        g++ \
        gcc \
        gdb \
        python3 \
        python3-pip \
        bubblewrap \
        util-linux \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY --chown=node:node . .
RUN chown -R node:node /app

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# Do not run the API process as root inside the container.
USER node

CMD ["npm", "start"]
