# Legacy / Reference Spring Boot Backend

> **Note: Active Production Backend is `server/`**

In accordance with the CODE3D-AI Full-Stack Architecture Decision Record ([docs/BACKEND_ARCHITECTURE.md](../docs/BACKEND_ARCHITECTURE.md)), the **unified production backend** for CODE3D-AI is the Node.js/Express service located in **`server/`**.

### Production Architecture
```
GitHub Pages (Static Hosting)
       │
       ▼ HTTPS
React Frontend (Vite + R3F)
       │
       ▼ HTTPS (Port 5000 / Render Cloud)
ONE Production Backend API (`server/`)
       │
       ▼ SSL/TLS Pooling
Neon PostgreSQL (`DATABASE_URL`)
```

### Purpose of this Directory (`backend/`)
This directory contains the original Spring Boot prototype implementation preserved for architectural reference. Production deployments and local development run from `server/`.
