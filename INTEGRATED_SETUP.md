# CODE3D AI Integrated Setup

This package intentionally excludes real `.env` secrets. Copy the values from your existing working CODE3D-AI project into:

- `server/.env` — keep your existing `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`, `NODE_ENV`, `GROQ_API_KEY`, and `GROQ_MODEL`.
- `frontend/.env` — keep your existing `VITE_GROQ_API_KEY` (Quiz Arena) and set `VITE_API_URL=http://localhost:5000/api` if needed.

Then run:

```powershell
cd server
npm install
npm run dev
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

## Modes

- `/visualizer` remains the curated DSA/algorithm visualizer and its Monaco editor is read-only.
- `/editor` is the editable Universal Code Editor. Its execution request uses the integrated real-process executor + deterministic trace engine from the AI Tutor project.
- AI Tutor is served through `/api/ai/explain` and keeps the Groq key on the server.
