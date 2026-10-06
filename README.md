# CODE3D-AI

> **Don't just read the code. See the code execute.**

CODE3D-AI is an interactive computer-science learning platform built for students who want to **write code, execute it, understand the result, visualize DSA concepts, and learn with AI** in one workspace.

## 🌐 Live Application

**Production:** https://code-3d-ai.vercel.app/

**Repository:** https://github.com/Sankalpsachan96/CODE3D-AI

---

## ✨ What CODE3D-AI Does

CODE3D-AI combines a coding workspace, DSA learning tools, AI assistance, quizzes, and execution history.

### Core features

- **Multi-language code execution**
  - Java
  - C++
  - C
  - Python
  - JavaScript
- **AI Code Tutor**
  - Explain code
  - Debug errors
  - Explain actual program output
  - Answer follow-up questions using the current code, language, output, and error context
  - Help with DSA and algorithms
- **DSA Hub**
  - Data structures
  - Algorithms
  - Interactive learning content
  - Visual execution
- **3D / interactive visualization**
  - Arrays
  - Linked lists
  - Stacks
  - Queues
  - Trees
  - Graphs
  - Sorting
  - Searching
  - Recursion and other algorithmic concepts
- **Quiz Arena**
  - AI-generated programming and DSA quizzes
  - Multiple-choice questions
  - Explanations
  - Score tracking
- **Execution & Quiz History**
  - Store previous execution results
  - Store quiz attempts
  - Review learning progress
- **Authentication**
  - Register and login
  - Session-based authentication
  - Session restoration after browser refresh

---

## 🧠 AI-Powered Learning

The AI layer is integrated with the backend rather than exposing provider credentials in the browser.

The AI Tutor can receive:

- Current source code
- Selected programming language
- Program output
- Runtime/compile error
- Conversation history
- User's question

This allows questions such as:

> Why did my program produce this output?

or:

> Find the error in my code and explain how to fix it.

The Quiz Arena also uses the central backend AI API to generate structured quiz questions.

---

## 💻 Supported Languages

| Language | Execution | AI Tutor | Visualization |
|---|---|---|---|
| Java | ✅ | ✅ | ✅ |
| C++ | ✅ | ✅ | ✅ |
| C | ✅ | Backend-supported | ✅ |
| Python | ✅ | ✅ | ✅ |
| JavaScript | ✅ | ✅ | ✅ |

The server uses isolated child-process execution with execution-time and output limits for supported languages.

---

## 🏗️ Project Architecture

```text
CODE3D-AI
│
├── frontend/                    # React + Vite application
│   └── src/
│       ├── components/          # Reusable UI components
│       ├── context/             # Application/auth state
│       ├── pages/               # Main application pages
│       ├── services/            # API, auth, AI and quiz services
│       ├── execution/           # Frontend execution/trace logic
│       ├── dsa/                 # DSA detection and learning logic
│       └── visualizers/         # Interactive visualizations
│
├── server/                      # Node.js + Express backend
│   └── src/
│       ├── controllers/         # Request/controller logic
│       ├── routes/              # API routes
│       ├── services/            # Backend services
│       ├── sandbox/             # Execution/sandbox infrastructure
│       ├── adapters/            # Language execution adapters
│       └── middleware/          # Auth, security and middleware
│
├── prisma/                      # Database schema/migrations
├── docs/                        # Project documentation
└── README.md
```

### Main request flow

```text
Browser
   │
   ▼
React / Vite Frontend
   │
   ├── Authentication
   ├── Code Editor
   ├── AI Tutor
   ├── Quiz Arena
   ├── DSA Hub
   └── Visualizers
   │
   ▼
Node.js + Express API
   │
   ├── Authentication / Sessions
   ├── AI API
   ├── Code Execution
   ├── Quiz APIs
   └── History APIs
   │
   ├───────────────┐
   ▼               ▼
Prisma          Language Runtimes
   │             ├── Java
   │             ├── C++
   │             ├── C
   │             ├── Python
   │             └── JavaScript
   ▼
PostgreSQL
```

---

## 🔐 Authentication

CODE3D-AI uses backend-managed sessions.

After login, the server maintains the authenticated session through an HTTP-only cookie. On a page refresh, the frontend calls the current-user endpoint and restores the authenticated user instead of treating the refresh as a logout.

Authentication APIs include:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

---

## ▶️ Code Execution

The backend provides a universal execution API for supported languages.

The execution system includes limits for:

- Execution time
- Output size
- Process lifetime
- Resource usage

Compile errors, runtime errors, and normal program output are returned to the frontend so the editor and AI Tutor can display and explain the actual result.

---

## 🤖 AI API

AI requests are handled through the backend.

Important frontend endpoints include:

- `POST /api/ai/explain`

The endpoint is used for:

- Code explanations
- AI Tutor conversations
- Runtime-error explanations
- Complexity analysis
- AI-generated quiz content

AI provider configuration belongs on the server through environment variables.

---

## 🧩 Quiz Arena

Quiz Arena generates structured multiple-choice questions through the backend AI service.

Each generated question contains:

- Question
- Four options
- Correct option index
- Explanation

Quiz attempts can be stored through the backend history API.

---

## 📚 DSA Learning

The DSA section is designed around learning by seeing algorithms execute.

Topics include areas such as:

- Arrays
- Searching
- Sorting
- Linked Lists
- Stack
- Queue
- Trees
- Graphs
- Recursion
- Dynamic Programming
- Hashing
- Two Pointers
- Sliding Window

The project also includes an interactive problem-solving section for practicing algorithmic questions.

---

## 🛠️ Technology Stack

### Frontend

- React 18
- Vite
- React Router
- Three.js
- React Three Fiber
- @react-three/drei
- Monaco Editor
- CSS

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL
- Zod
- Helmet
- CORS
- Cookie Parser
- bcryptjs

### AI

- Groq-compatible backend AI integration
- Structured AI responses for Tutor and Quiz Arena

---

## 🚀 Run Locally

### Prerequisites

Install:

- Node.js 18+ or a current LTS version
- npm
- Git
- PostgreSQL for database-backed development

### 1. Clone the repository

```bash
git clone https://github.com/Sankalpsachan96/CODE3D-AI.git
cd CODE3D-AI
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### 4. Install backend dependencies

Open another terminal:

```bash
cd CODE3D-AI/server
npm install
```

### 5. Configure backend environment variables

Create:

```text
server/.env
```

Configure the database, session/auth settings, and AI provider settings required by the backend.

Do **not** commit secrets or API keys to Git.

### 6. Start the backend

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## 📦 Useful Commands

### Frontend

```bash
cd frontend

npm run dev
npm run build
npm run preview
```

### Backend

```bash
cd server

npm run dev
npm start
npm test
```

### Prisma

```bash
cd server

npm run prisma:generate
npm run prisma:migrate
npm run prisma:push
```

---

## 🌍 Deployment

The production frontend is deployed through **Vercel**.

```text
Production
https://code-3d-ai.vercel.app/
```

The backend runs separately and is accessed by the frontend through the configured API base URL.

For production deployments:

1. Build the frontend with `npm run build`.
2. Configure the production API URL.
3. Configure server environment variables.
4. Deploy the frontend to Vercel.
5. Deploy the Node.js backend separately.
6. Configure CORS and authentication cookies for the production domains.

---

## 🔒 Security Principles

CODE3D-AI is designed so that:

- AI provider credentials stay on the server.
- Authentication uses server-managed sessions.
- User code is not intentionally executed directly in the browser's global scope.
- Backend execution has timeout/output protections.
- API requests use controlled backend routes.
- Production secrets are supplied through environment variables.

Never commit:

```text
.env
API keys
database passwords
session secrets
private credentials
```

---

## 📁 Important Frontend Areas

| Area | Location |
|---|---|
| Authentication | `frontend/src/context/AuthContext.jsx` |
| API client | `frontend/src/services/api.js` |
| API services | `frontend/src/services/apiService.js` |
| Authentication service | `frontend/src/services/auth.js` |
| AI Tutor | `frontend/src/pages/AiTutorPage.jsx` |
| Quiz AI service | `frontend/src/services/groqQuizService.js` |
| Execution manager | `frontend/src/execution/ExecutionManager.js` |
| Visualizers | `frontend/src/visualizers/` |

---

## 🎯 Project Goal

CODE3D-AI aims to make programming education more visual and practical:

```text
Write Code
    ↓
Run Code
    ↓
See Output / Errors
    ↓
Understand What Happened
    ↓
Visualize the Algorithm
    ↓
Ask AI
    ↓
Practice with Quizzes
    ↓
Track Progress
```

Instead of only reading an algorithm, the goal is to **see how it behaves step by step**.

---

## 📄 License

This project is available under the MIT License.

---

**CODE3D-AI — Learn code by seeing it execute.**
