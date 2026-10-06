# CODE3D AI — Current Deployment Guide

## Architecture

- **Frontend:** React + Vite → Vercel
- **Active backend:** Node.js + Express → Render
- **Database:** Prisma/PostgreSQL when configured
- **AI:** Groq API from the Node backend
- **Real code execution:** Node backend's universal executor
- **Supported execution languages:** C, C++, Python, Java, JavaScript

> The repository also contains an older Spring Boot project under `backend/`. The live frontend API points to the Node/Express service under `server/`. Do not deploy the root `Dockerfile` for the active CODE3D API.

## Render backend

Use the `server/` directory.

### Recommended: Docker runtime

Render service settings:

- **Runtime:** Docker
- **Root Directory:** `server`
- **Dockerfile:** `Dockerfile`
- **Docker context:** `server`
- **Branch:** `main`
- **Auto Deploy:** enabled
- **Health Check Path:** `/api/health`

The repository's `server/Dockerfile` installs:

- Node.js 22
- OpenJDK 17
- g++
- gcc
- Python 3
- required Node/Prisma dependencies

This is required for reliable five-language execution, especially Java.

### Required Render environment variables

Set the values for your deployment:

- `DATABASE_URL`
- `GROQ_API_KEY`
- `FRONTEND_URL`

Do not commit `.env` or API keys.

After deployment, open:

`https://<your-render-service>.onrender.com/api/health`

The response includes `executionRuntimes`. For the active five-language backend, C++, C, Python and Java should report `true`, and JavaScript should be available through Node.

## Vercel frontend

Use:

- **Root Directory:** `frontend`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Set:

`VITE_API_URL=https://<your-render-service>.onrender.com/api`

The frontend also has a live Render fallback URL for the current production service.

## Deployment order

1. Push/merge changes to `main`.
2. Wait for Render to deploy the latest backend commit.
3. Confirm `/api/health` reports the execution runtimes.
4. Confirm Vercel has deployed the latest frontend.
5. Hard-refresh the browser before testing.

## Production smoke test

Run these in the Code Editor:

### C++
```cpp
#include <iostream>
using namespace std;

int main() {
    cout << 10 + 20;
    return 0;
}
```

Expected output: `30`

Also test one small program each in Python, Java, JavaScript and C.

Then test:

- AI Tutor → Run Code
- AI Tutor → Ask AI
- AI Quiz Arena → Generate Quiz
- DSA Hub → multiple unrelated algorithms
- Striver Sheet → problems from arrays, linked lists, trees, graphs and DP
- History → execution/quiz persistence

## Important

If C++/C/Python/Java all fail after a code update, check the Render deploy commit and `/api/health` first. The frontend must be talking to the same Node backend that contains the current `universalExecutor.cjs`.
