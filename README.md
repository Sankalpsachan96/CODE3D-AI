# CODE3D-AI

> *"Don't just read the code. See the code execute."*

[![Live Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-cyan?style=for-the-badge&logo=github)](https://himanshu70784231.github.io/CODE3D-AI/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)](https://python.org/)
[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![C++](https://img.shields.io/badge/C%2B%2B-17%2F20-blue?style=for-the-badge&logo=c%2B%2B)](https://isocpp.org/)
[![React 18](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-purple?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-yellow?style=for-the-badge&logo=vite)](https://vitejs.dev/)

**CODE3D-AI** is an advanced interactive computer science educational platform that compiles, interprets, and simulates source code into understandable, physical, 3D WebGL data structure visualizations in real time. Designed for computer science students, educators, and software engineers preparing for technical interviews.

🌐 **Production GitHub Pages:** [https://himanshu70784231.github.io/CODE3D-AI/](https://himanshu70784231.github.io/CODE3D-AI/)

---

## 📸 Key Capabilities

- **Interactive 3D WebGL & 2D Accessible Visualization**: 12 dedicated 3D visualizers powered by Three.js and React Three Fiber, paired with instant 2D SVG/HTML accessible fallback with screen-reader narration and WebGL context restoration.
- **Monaco Code Editor & Integrated Debugger**: Set breakpoints on the glyph margin, step through code, auto-pause at breakpoints, and inspect live memory state.
- **Multi-Language Modular Execution Engine (`src/execution/`)**:
  - **JavaScript**: Real sandboxed client & server execution with AST parsing, variable tracking, array mutation tracking, and loop/recursion tracing.
  - **Python**: Real AST parsing and step-by-step trace generation for loops, conditionals, list operations, and recursion.
  - **Java**: Sandboxed Java execution engine interpreting classes, methods, arrays, and standard control flow.
  - **C++**: Sandboxed C++ execution engine tracing pointers, references, vectors, and sorting/searching routines.
  - **C**: Direct procedural execution tracing structs, pointers, arrays, and standard functions.
- **Automated DSA & Algorithm Detection Engine (`src/dsa/`)**:
  - Automatically identifies data structures: `ARRAY`, `STRING`, `MATRIX`, `LINKED_LIST`, `STACK`, `QUEUE`, `HEAP`, `BINARY_TREE`, `GRAPH`, `DP_TABLE`.
  - Automatically identifies algorithms: `Linear Search`, `Binary Search`, `Bubble Sort`, `Selection Sort`, `Insertion Sort`, `Merge Sort`, `Quick Sort`, `Two Pointers`, `Sliding Window`, `BFS`, `DFS`, `Dijkstra`, `Recursion`, `Dynamic Programming`.
- **Deterministic Time Machine Scrubber**:
  - Play, Pause, Next, Previous, First, Last, and Restart.
  - Throttled playback speeds: `0.25x`, `0.5x`, `1x`, `1.5x`, `2x`, `4x`.
  - Snapshots allow instant seeking between arbitrary steps (e.g., step 100 to step 20) with deterministic state reconstruction.
- **Granular Error Boundaries**:
  - `AppErrorBoundary`: Protects the entire application shell with restart recovery.
  - `VisualizerErrorBoundary`: Recovers 3D/2D visualizer crashes without affecting editor state.
  - `EditorErrorBoundary`: Isolates code editing syntax and formatting issues.
- **Curated Educational Hubs**:
  - **Striver SDE Sheet**: 180+ curated problems across Arrays, Two-Pointer, Matrix, Linked Lists, Trees, Graphs, DP, and Backtracking.
  - **DSA Hub**: Categorized lessons and interactive challenges with difficulty filters.
  - **AI Algorithm Tutor (`/ai`)**: Big-O time and space complexity proofs, edge-case vulnerability detection, and interactive algorithmic chat.
  - **Quiz Arena (`/quiz`)**: Test algorithmic knowledge with timed quizzes and score tracking.
  - **Execution History (`/history`)**: Persistent record of previous simulation sessions with one-click replay.

---

## 🧊 The Supported 3D Visualizers

Every visualizer is implemented as a specialized React Three Fiber canvas component:

| # | Visualizer | Supported Archetypes & Problems | 3D Physical Representation |
|---|---|---|---|
| **1** | **Array Visualizer** | Standard arrays, Kadane's algorithm, Search | Elevated neon bars with glowing pointer rings and index labels |
| **2** | **Two-Pointer Visualizer** | Array reverse, Palindrome, 2Sum II, Container With Most Water | Dual converging pointer rings with dynamic distance indicators |
| **3** | **2D Matrix Grid** | Matrix traversal, Set Matrix Zeroes, Spiral Matrix, Pathfinding | 3D coordinate grid with active cell glowing beams |
| **4** | **Linked List Visualizer** | Singly linked list, Floyd Cycle Detection, Reverse List | Connected 3D spherical nodes with dynamic directional vector arrows |
| **5** | **Stack Visualizer** | Parentheses matching, Monotonic stack, Next Greater Element | Transparent vertical cylinder with gravity-drop LIFO disc animations |
| **6** | **Queue / Deque Visualizer** | Sliding Window Maximum, BFS traversal buffer | Horizontal conduit track with FIFO entry and exit animations |
| **7** | **Binary Search Tree & Heap** | BST search/insert, Min/Max Heap, Level-order | Hierarchical branch node lattice with dynamic left/right parent links |
| **8** | **Graph Visualizer** | BFS, DFS, Dijkstra's algorithm, Topological sort | Force-directed 3D node network with illuminated traversal frontiers |
| **9** | **Sorting Visualizer** | Bubble, Selection, Insertion, Merge, Quick Sort | Dual comparison pillars with elevated 3D swap arcs |
| **10** | **Recursion Tree Visualizer** | Factorial, Fibonacci, Divide-and-Conquer | 3D stacking execution frames tracking call parameters and returns |
| **11** | **ALU & Control Flow** | Scanner inputs, variables, arithmetic calculations, if/else | Glowing computational reactor with memory register cells and logic gates |
| **12** | **N-Queens Backtracking** | N-Queens (LeetCode #51), Permutations, Backtracking | 3D reflective chessboard with queen models and conflict threat vectors |

---

## ⌨️ Integrated Debugger & Keyboard Shortcuts

| Shortcut | Action | Description |
|---|---|---|
| `Ctrl + Enter` / `Cmd + Enter` | **Run / Execute** | Execute code, synthesize 3D trace, and begin animation |
| `F5` | **Play / Pause** | Toggle execution playback loop |
| `F10` | **Step Forward** | Step one instruction ahead in the execution trace |
| `Shift + F10` | **Step Backward** | Step one instruction backward (Time Machine) |
| `Esc` | **Reset** | Stop execution and rewind timeline to step 1 |
| **Left Click Glyph Margin** | **Toggle Breakpoint** | Toggle red breakpoint dot on any line; auto-pauses when reached |

---

## 🏛 System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CODE3D-AI ARCHITECTURE                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   USER INTERACTION LAYER                                               │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Monaco Code Editor with Breakpoint Margin & Syntax Checking    │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Language Selector [ JavaScript | Python | Java | C++ | C ]     │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    ▼                                   │
│   EXECUTION & TRACE ENGINE (src/execution/)                            │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ ExecutionManager -> Orchestrates local & cloud runners        │   │
│   │ LanguageAdapter: JavaScript | Python | Java | Cpp | C         │   │
│   │ Limits: Timeout (5000ms), Max Steps (10k), Max Output (100KB) │   │
│   │ TraceBuilder: Emits normalized ExecutionSteps & events        │   │
│   │ TraceValidator: Enforces schema correctness                   │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    ▼                                   │
│   DSA DETECTION LAYER (src/dsa/)                                       │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ dsaDetector: AST & state structure classification              │   │
│   │ algorithmDetector: Pattern recognition (Binary Search, Sort)  │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
│                                    ▼                                   │
│   SYNCHRONIZED PRESENTATION LAYER                                      │
│   ┌────────────────────────────────┬───────────────────────────────┐   │
│   │ 3D WebGL Canvas                │ 2D Accessible SVG/HTML View   │   │
│   │ (Three.js / React Three Fiber) │ (Screen-reader & ARIA labels) │   │
│   ├────────────────────────────────┴───────────────────────────────┤   │
│   │ Deterministic Timeline (0.25x - 4x speed scrubber)             │   │
│   │ Live Variables Inspector & Call Stack                          │   │
│   │ Interactive Console Output (stdout, stderr)                    │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security & Sandboxing Model

- **No Dangerous `eval()`**: Arbitrary code is never directly evaluated in the global window context.
- **Configurable Execution Limits**:
  - `MAX_EXECUTION_TIME`: 5,000ms timeout
  - `MAX_TRACE_STEPS`: 10,000 step cap against infinite loops
  - `MAX_OUTPUT_LENGTH`: 100,000 character output cap
  - `MAX_RECURSION_DEPTH`: 500 stack frame limit
- **Boundary Isolation**: Client code runs within worker/isolated sandboxes; server code executes within non-root, isolated processes without filesystem or network access.
- **Granular Exception Handling**: Compile errors, syntax errors, bounds exceptions, and timeout violations are isolated and mapped back to source editor line markers.

---

## 🛠 Adding New Components

### 1. Adding a New Language Adapter
1. Create `src/execution/languages/NewLangAdapter.js` extending `LanguageAdapter`.
2. Implement:
   - `detect(code)`: Returns `boolean` whether code belongs to the language.
   - `validateSyntax(code)`: Validates syntax and returns error positions.
   - `execute(code, options)`: Returns `{ trace, output, error, success }`.
3. Register the adapter in `src/execution/languages/index.js`.

### 2. Adding a New Data Structure Detector
1. Define the structure enum in `src/dsa/models/types.js`.
2. Add detection heuristics in `src/dsa/detector/dsaDetector.js`.
3. Add 2D fallback renderer in `src/visualizers/Dsa2DFallback.jsx` and 3D mesh in `src/visualizers/`.

### 3. Adding a New Algorithm
1. Add algorithm metadata and generator in `src/algorithms/catalog.js`.
2. Add algorithm pattern rules in `src/dsa/detector/algorithmDetector.js`.

---

## 💻 Installation & Local Development

### Prerequisites

- **Node.js**: v18.x or v20.x LTS
- **npm**: v9.x or higher
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/himanshu70784231/CODE3D-AI.git
cd CODE3D-AI
```

### 2. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be live at `http://localhost:5173/`.

### 3. Run Backend (Node.js API & Execution Server)

```bash
cd ../server
npm install
npm run dev
```

The backend server will start on `http://localhost:5000/`.

### 4. Run Backend Tests

```bash
cd server
npm test
```

---

## 🚀 Building & Deploying to GitHub Pages

The repository contains an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes the client to GitHub Pages upon pushing to `main`.

To build locally:

```bash
cd frontend
npm run build
```

This compiles optimized bundles into `frontend/dist/` with:
- `base: '/CODE3D-AI/'` for proper asset resolution.
- `HashRouter` ensuring routing works seamlessly across GitHub Pages without 404 HTTP errors.

---

## 📄 License

This project is licensed under the MIT License — feel free to explore, learn, and build upon it!
