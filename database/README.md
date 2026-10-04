# CODE3D-AI Database Architecture

## Overview
CODE3D-AI connects to PostgreSQL (Neon Cloud) using modern connection pooling, SSL/TLS encryption, and schema migrations.

```
+------------------+         REST API         +---------------------+
|  React Frontend  |  =====================>  |   Backend Server    |
| (Browser/GitHub) |  (HTTP / HttpOnly Auth)  |  (Node.js / Express)|
+------------------+                          +---------------------+
                                                         |
                                                  DATABASE_URL
                                                  (SSL Mode: require)
                                                         v
                                              +---------------------+
                                              |   Neon PostgreSQL   |
                                              |   (Cloud Database)  |
                                              +---------------------+
```

## Security Rules
1. **Never expose the database connection string to the frontend**: `DATABASE_URL` is kept exclusively on the server.
2. **Rotating credentials**: Before deploying to production, rotate the database password in the Neon console.
3. **No Direct Browser Access**: The browser NEVER connects to PostgreSQL directly. All database access passes through authenticated backend endpoints.

## Migrations
- `migrations/V1__initial_schema.sql`: Initial production schema containing `users`, `sessions`, `projects`, `executions`, `execution_steps`, `history`, `quiz_attempts`, `user_settings`, and `ai_conversations`.
- Indexed on `users.email`, `projects.user_id`, `executions.user_id`, `history.user_id`, and `quiz_attempts.user_id` for low-latency queries.
