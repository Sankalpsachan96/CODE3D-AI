# CODE3D AI - System Architecture

## 1. High-Level Architecture Overview

CODE3D AI uses a decoupled client-server architecture designed for interactive code execution inspection.

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)              │
│                                                        │
│  ┌────────────────┐ ┌─────────────────┐ ┌───────────┐  │
│  │ Monaco Editor  │ │  R3F 3D Engine  │ │State Panel│  │
│  └────────┬───────┘ └────────▲────────┘ └─────▲─────┘  │
│           │                  │                │        │
│           └───────────┐      │         ┌──────┘        │
│                       ▼      │         │               │
│             ┌────────────────┴─────────┴─────┐         │
│             │   Time Machine Execution Hook  │         │
│             └────────────────▲───────────────┘         │
│                              │                         │
│             ┌────────────────┴───────────────┐         │
│             │   Execution State Model Engine │         │
│             └────────────────▲───────────────┘         │
└──────────────────────────────┼─────────────────────────┘
                               │ REST API (JSON)
┌──────────────────────────────┼─────────────────────────┐
│                   BACKEND (Spring Boot)                │
│                                                        │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────┐  │
│  │ AST Controller │ │Execution Engine│ │AI Assistant│  │
│  └────────┬───────┘ └────────┬───────┘ └──────┬─────┘  │
│           │                  │                │        │
│  ┌────────▼──────────────────▼────────────────▼─────┐  │
│  │              JavaParser Parser & AST             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │              MySQL Persistence Layer             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## 2. Execution-State Model (Contract)

Each execution step emitted by the backend simulator adheres to this schema:

```typescript
interface ExecutionStep {
  stepNumber: number;            // 1-indexed progressive counter
  lineNumber: number;            // Active Java source code line
  eventType: string;             // e.g. "ARRAY_ACCESS", "LOOP_INCREMENT"
  variables: Record<string, any>;// Map of in-scope variable names to values
  changedVariable?: string;      // Variable modified in this exact step
  previousValue?: any;           // Previous value for transition animations
  currentValue?: any;            // New value
  condition?: {                  // Present during conditional branches
    expression: string;          // e.g. "i < arr.length"
    evaluation: string;          // e.g. "0 < 4"
    result: boolean;             // true or false
    branch: string;              // "ENTER LOOP BODY" or "EXIT LOOP"
  };
  output: string[];              // Cumulative stdout printed lines
  dataStructureState: {          // 3D scene payload
    type: "array" | "linkedlist" | "tree" | "stack" | "queue";
    values: any[];
    activeIndex: number | null;
    previousIndex?: number | null;
    label?: string;
    focusInfo?: string;
  };
  explanation: string;           // Clear student-facing reasoning
  aiHint?: string;               // Pedagogical progressive hint
}
```

## 3. 3D Visualization Pipeline

1. **React Three Fiber Canvas**: Renders a WebGL scene with antialiasing and orbit camera controls.
2. **Dynamic Geometry**: Array cells are represented by BoxGeometries positioned on a 3D rail.
3. **Smooth Interpolation (`useFrame`)**: Active index changes do not snap; `THREE.MathUtils.lerp` smoothly elevates the active cell and rotates the target arrow beacon.
4. **Lighting**: Ambient light + directional primary light + cyan accent point lights for high-tech aesthetic.
