FROM node:22-bookworm

# Install all programming-language runtimes/compilers
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        openjdk-17-jdk \
        g++ \
        gcc \
        python3 \
        python3-pip \
        ca-certificates \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Copy backend source
COPY . .

# Render provides PORT dynamically
ENV NODE_ENV=production

EXPOSE 10000

CMD ["npm", "start"]