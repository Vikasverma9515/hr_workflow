# HR Workflow Designer

A visual HR workflow builder built as a case study for Tredence Analytics — Full Stack Engineering Intern (AI Agentic Platforms).

## How to Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it auto-redirects to `/workflow`.

> The app uses **MSW (Mock Service Worker)** to intercept API calls in the browser. The service worker registers automatically on first load (look for `[MSW] Started` in the browser console).

---

## Architecture

```
app/
  layout.tsx          — Root layout; mounts MSWProvider (client-side SW init)
  page.tsx            — Redirects to /workflow
  workflow/page.tsx   — Main designer page shell

components/
  canvas/
    WorkflowCanvas    — ReactFlow canvas (drop zone, pan/zoom, minimap)
    NodePalette       — Draggable node sidebar
    TopBar            — Workflow name, export/import, simulate button
  nodes/              — 5 custom ReactFlow node renderers (Start/Task/Approval/Automated/End)
  forms/
    NodeFormPanel     — Right-side panel that switches form per selected node type
    *NodeForm         — One form component per node type (react-hook-form + zod)
    shared/
      FormField       — Label + error wrapper
      KeyValueEditor  — Dynamic key-value row editor
  sandbox/
    SandboxPanel      — Modal: validation results + simulation runner
    SimulationLog     — Animated step-by-step timeline

hooks/
  useWorkflowStore    — Zustand store: all nodes, edges, selection
  useGraphValidation  — Runs 8 validation rules on every store change
  useAutomations      — Fetches GET /api/automations (MSW-intercepted)
  useSimulate         — Posts to POST /api/simulate (MSW-intercepted)

lib/
  types/              — Discriminated union for HRNodeData (StartNodeData | TaskNodeData | ...)
  api/                — Typed fetch wrappers (automations, simulate)
  mocks/              — MSW handlers + mock data + simulation engine (topological sort)
  graph/
    validate.ts       — 8 pure validation rules returning ValidationError[]
    serialize.ts      — nodes+edges → SimulateRequest payload
```

---

## Design Decisions

### Discriminated Union for Node Data
Each node type has a `type` field (`'start' | 'task' | 'approval' | 'automated' | 'end'`), making TypeScript switch exhaustively type-safe when rendering forms and validating.

### Zustand over Context
Zustand gives a flat, reactive store without prop-drilling. React Flow's `applyNodeChanges` / `applyEdgeChanges` integrate cleanly via the store's `onNodesChange` / `onEdgesChange` handlers.

### MSW v2 for Mock API
MSW intercepts `fetch` at the browser network level — no separate Express/json-server process needed. The mock simulation engine runs a real topological sort (Kahn's algorithm), so the sandbox tests actual graph correctness, not just fake data.

### react-hook-form + zod
Each node form has its own schema. The `watch()` subscription pattern updates the Zustand store on every field change, keeping the canvas node label in sync without needing a submit button.

### Validation as a Pure Function
`validateWorkflow()` is a pure function over `(nodes, edges)` — memoized via `useMemo` in `useGraphValidation`. Any component can call `errorsForNode(id)` to get per-node errors, enabling per-node red-border rendering.

---

## Features Implemented

| Feature | Status |
|---------|--------|
| Drag-and-drop from palette to canvas | ✅ |
| Start / Task / Approval / Automated / End nodes | ✅ |
| Connect nodes with animated edges | ✅ |
| Delete nodes/edges (Backspace/Delete key) | ✅ |
| Node form panel (all 5 types, live editing) | ✅ |
| KeyValueEditor (metadata, custom fields) | ✅ |
| Dynamic action params (Automated node) | ✅ |
| Summary flag toggle (End node) | ✅ |
| Mock API: GET /automations | ✅ |
| Mock API: POST /simulate | ✅ |
| Graph validation (8 rules, real BFS+DFS) | ✅ |
| Per-node error badges | ✅ |
| Sandbox: step-by-step animated simulation log | ✅ |
| Export workflow as JSON | ✅ |
| Import workflow from JSON | ✅ |
| Minimap + zoom/fit controls | ✅ |
| Inline workflow name editing | ✅ |
| Responsive layout (desktop/tablet) | ✅ |

---

## Validation Rules

1. Exactly one Start node
2. At least one End node
3. Start node has no incoming edges
4. End node has no outgoing edges
5. All nodes reachable from Start (BFS connectivity check)
6. No cycles (DFS white/grey/black coloring)
7. Task nodes must have a title
8. Automated nodes must have an action selected

---

## What I Would Add With More Time

- **Undo/Redo** — Zustand `temporal` middleware wrapping the store snapshot
- **Auto-layout** — `dagre` library to arrange nodes top-to-bottom automatically
- **Node templates** — pre-built workflow starters (Onboarding, Leave Approval, Document Verification)
- **Persistent storage** — `localStorage` auto-save so work survives a page refresh
- **E2E tests** — Playwright covering the drag-add-connect-simulate golden path
- **Mobile responsive canvas** — touch-drag support
- **Conditional edge labels** — "Approved"/"Rejected" labels on Approval node outputs

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| Canvas | @xyflow/react (React Flow v12) |
| State | Zustand v5 |
| Forms | react-hook-form + zod |
| Mock API | MSW v2 (browser) |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
