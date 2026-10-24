# Free local AI + browser voice

## Browser Text-to-Speech

The 3D execution workspace includes opt-in speech narration through the browser's Web Speech API. It uses voices supplied by the browser/operating system; no speech API account, API key, or per-request speech provider is used. Voice availability and quality depend on the device and installed voices.

The narration controls are placed above the 3D execution playback bar. Turn voice on to narrate the current trace step. You can choose English/Hindi locale, an installed browser voice, speaking speed, pause, resume, and stop. It does not execute code or change trace state.

## Local Qwen through Ollama

1. Install Ollama on the same computer/environment as the backend.
2. Pull a small instruction model:
   ```bash
   ollama pull qwen2.5:3b-instruct
   ```
   For a computer with more available memory, compare:
   ```bash
   ollama pull qwen3:4b-instruct
   ```
3. Copy the values from `server/.env.ollama.example` to `server/.env` or set them in your environment.
4. Restart the backend after setting `AI_PROVIDER=ollama`.
5. Confirm Ollama is running on the configured base URL and that the selected model exists locally.

The local provider uses Ollama's `/api/chat` endpoint and keeps the existing `POST /api/ai/explain` contract. To use the existing hosted provider again, set `AI_PROVIDER=groq` and configure `GROQ_API_KEY`.

## Important limitations

- Browser speech is unlimited by a separate API quota, but voice quality, language, and availability depend on the browser and operating system.
- Local model inference needs disk space and RAM/VRAM and may be slower than hosted inference.
- Ollama must be installed and running where the backend executes. A hosted backend cannot reach Ollama running only on your personal PC unless you deliberately configure secure remote access; do not expose Ollama publicly without appropriate security.
- Local Qwen support here covers ordinary tutor/chat prompts. Existing structured quiz generation and complexity analysis may rely on Groq's JSON/schema response behavior, so use the existing Groq provider for those workflows until local structured-output parity is tested.
