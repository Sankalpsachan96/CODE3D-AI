# CODE3D AI - REST API Specifications (Spring Boot)

Target backend endpoints for Phase 7:

### 1. `POST /api/execute`
Executes/simulates supported Java code subset and returns atomic step trace.

**Request Body:**
```json
{
  "code": "public class Main { ... }",
  "language": "java",
  "input": ""
}
```

**Response:**
```json
{
  "status": "SUCCESS",
  "totalSteps": 16,
  "steps": [ ... ]
}
```

### 2. `POST /api/analyze`
Analyzes code complexity and structure using JavaParser.

**Response:**
```json
{
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "loopsDetected": 1,
  "dataStructures": ["1D Array"]
}
```

### 3. `POST /api/explain`
Generates LLM-backed pedagogical explanations and progressive hints.

**Request Body:**
```json
{
  "step": 4,
  "level": "Beginner",
  "queryType": "WHY"
}
```
