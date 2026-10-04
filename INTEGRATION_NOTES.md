# CODE3D AI — Integrated Universal Editor + AI Tutor

This package keeps the existing CODE3D AI application as the base and adds the uploaded AI Tutor architecture without replacing the curated DSA visualizer.

## Two workspaces

- `/visualizer` — curated DSA/Striver/algorithm visualizer. Existing topic-wise programs and 3D flow are preserved.
- `/editor` — Universal Code Editor. User code is editable and sent through the existing five-language sandbox/trace engine. The uploaded tutor's structural DSA detection and server-side Groq tutoring are integrated here.

## AI Tutor

The tutor receives code, language, selected runtime step, output, detected DSA/algorithm and execution error context. Error responses are structured around:

1. What went wrong
2. Why it happened
3. Solution
4. How to prevent it
5. Key takeaway

For universal execution errors, the reported source line is highlighted in Monaco and a 3D error hologram is rendered in the universal execution scene.

## Backend

`server/package.json` contains a `postinstall` hook for `prisma generate`, so a fresh `npm install` initializes Prisma Client automatically.

The server expects `GROQ_API_KEY` and optionally `GROQ_MODEL`. Existing Neon/Prisma settings remain unchanged.
