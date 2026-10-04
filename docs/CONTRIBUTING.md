# Contributing to CODE3D AI

## Git Workflow for Team of 5

### Branches
- `main`: Production/Exhibition branch. Only stable, fully reviewed code is merged here.
- `develop`: Integration branch where features are assembled.
- `feature/*`: Dedicated branches for each team member.

### Feature Branch Naming
- `feature/frontend`: Person 1 (UI/UX, editor, layout)
- `feature/3d`: Person 2 (Three.js, R3F visualizers)
- `feature/parser`: Person 3 (JavaParser AST, execution engine)
- `feature/backend`: Person 4 (Spring Boot, REST, MySQL)
- `feature/ai`: Person 5 (AI prompts, quiz, testing)

### Standard Contribution Steps
1. Synchronize develop: `git checkout develop && git pull origin develop`
2. Create your branch: `git checkout -b feature/your-feature-name`
3. Commit small, logical units: `git commit -m "feat: add 3D array glowing shader"`
4. Push and submit a Pull Request to `develop`.
5. Code review with at least 1 teammate before merging.
