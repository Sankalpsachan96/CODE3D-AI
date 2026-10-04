# Backend Architecture Decision Record (ADR)

## Decision
**Primary Backend Stack**: Node.js + Express + PostgreSQL (Neon Cloud) + Prisma ORM.

## Rationale
1. **Low Latency & High Concurrency**: Node.js with asynchronous I/O is ideal for real-time code execution trace streaming, interactive AST dry-run processing, and WebGL telemetry synchronization.
2. **Unified JSON Pipeline**: The execution trace schema (`ExecutionStep`, `VisualizationState`, variable state tables) is natively JSON-structured and maps directly between the backend execution sandbox and the Three.js / React Three Fiber frontend without conversion overhead.
3. **Robust Security & Sandboxing**: Includes process execution timeouts, memory limits, AST validation, and strict isolation without host credential leaks.
4. **Neon PostgreSQL Integration**: Connects over secure SSL/TLS with connection pooling and automated migration support.
5. **Verified Test Suite**: Backed by 13 comprehensive integration and unit tests passing 100% of cases across Java, C, C++, Python, and JavaScript.
