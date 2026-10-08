FROM node:22-bookworm

# Install Java, C++, C, Python and required system tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        openjdk-17-jdk \
        g++ \
        gcc \
        python3 \
        python3-pip \
        bubblewrap \
        util-linux \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# IMPORTANT: Prisma schema must exist before npm install
COPY prisma ./prisma

# Install Node dependencies
RUN npm install

# Copy backend source
COPY . .

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["npm", "start"]