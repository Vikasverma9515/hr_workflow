# HR Workflow Designer

**Tredence Analytics — Full Stack Engineering Intern (AI Agentic Platforms) · Case Study**

A visual HR workflow builder where an HR admin can create, configure, and simulate internal processes like onboarding, leave approval, and document verification.

---

## How to Run

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — auto-redirects to `/workflow`.

```bash
npm test          # 32 unit tests (Vitest)
npm run build     # production build check
```

> Uses **MSW (Mock Service Worker)** to intercept API calls in the browser — no separate backend needed. Look for `[MSW] Started` in the DevTools console on first load.

---

## What Was Built

### Functional Requirements — All Completed

**1. Workflow Canvas (React Flow)**

| Requirement | Implementation |
|-------------|----------------|
| Drag nodes from sidebar to canvas | Draggable palette chips with `dataTransfer` + `screenToFlowPosition` drop |
| Connect nodes with edges | `onConnect` handler with automatic label/color per source handle |
| Select a node to edit | `onNodeClick` → sets `selectedNodeId` in Zustand store |
| Delete nodes / edges | `Delete` / `Backspace` key via React Flow `deleteKeyCode` prop |
| Auto-validate constraints | 8 rules run on every store change via `useGraphValidation` |

**2. Node Editing / Configuration Forms** *(Key Requirement)*

All 5 forms use **react-hook-form + zod** with live canvas sync via `watch()`.

| Node | Fields |
|------|--------|
| Start | Title, metadata key-value pairs |
| Task | Title (required), description, assignee, due date, custom key-value fields |
| Approval | Title, approver role (Manager / HRBP / Director / VP / C-Suite), auto-approve threshold % |
| Automated Step | Title, action picker (from `GET /api/automations`), dynamic param inputs per selected action |
| End | End message, summary flag (boolean toggle) |

**3. Mock API (MSW v2)**

| Endpoint | Response |
|----------|----------|
| `GET /api/automations` | 6 actions: Send Email, Generate Document, Notify Slack, Create Ticket, Update HRIS, Send Webhook — each with a `params` array |
| `POST /api/simulate` | Runs **Kahn's algorithm** (topological sort) → returns `SimulationStep[]` with per-node status, message, and timestamps |

**4. Workflow Test / Sandbox Panel**

- Serializes the full graph to a `SimulateRequest` payload
- Sends to `POST /api/simulate` (MSW-intercepted)
- Displays an animated step-by-step execution timeline (380ms per step)
- Validates structure first — simulation is blocked if any rule fails
- Shows all validation errors with node IDs before running

---

## Architecture

```
app/
  workflow/page.tsx           Main shell — ReactFlowProvider, layout, modal state

components/
  canvas/
    WorkflowCanvas.tsx        Drop zone, keyboard shortcuts, pan/zoom/minimap
    NodePalette.tsx           Draggable sidebar with search + Templates tab
    TopBar.tsx                Stats, undo/redo, export/import, simulate trigger
  nodes/                      5 custom node renderers — each shows per-node error badge
  forms/
    NodeFormPanel.tsx         Right-panel switcher (desktop panel + mobile bottom sheet)
    *NodeForm.tsx             One form per node type — react-hook-form + zod
    shared/KeyValueEditor     Dynamic add/remove key-value rows
  sandbox/
    SandboxPanel.tsx          Validation summary + simulation runner modal
    SimulationLog.tsx         Animated step timeline
  ui/
    Toast.tsx                 Slide-in notifications (success / error / info)
    KeyboardShortcutsModal    Full shortcut reference (? key)

hooks/
  useWorkflowStore.ts         Zustand store: nodes, edges, undo/redo, clipboard, connection guard
  useGraphValidation.ts       Memoized validation — exposes errorsForNode(id)
  useWorkflowStats.ts         Live complexity score + gate/automation/branch counts
  useAutomations.ts           GET /api/automations
  useSimulate.ts              POST /api/simulate

lib/
  types/nodes.ts              Discriminated union: HRNodeData (5 node data interfaces)
  graph/validate.ts           8 pure validation rules → ValidationError[]
  graph/serialize.ts          nodes + edges → SimulateRequest
  graph/autolayout.ts         Dagre layout wrapper
  mocks/                      MSW handlers + simulation engine (Kahn's algorithm)

__tests__/                    32 Vitest unit tests
```

---

## Design Decisions

**Discriminated union for node data**
`HRNodeData = StartNodeData | TaskNodeData | ApprovalNodeData | AutomatedStepNodeData | EndNodeData` — the `type` field makes every form switch and validation case exhaustively type-safe with no `any`. Adding a new node type means adding one entry to the union and one form component; nothing else changes.

**Validation as a pure function**
`validateWorkflow(nodes, edges): ValidationError[]` has zero side effects. It's memoized inside `useGraphValidation` via `useMemo`, so any component can call `errorsForNode(id)` without re-running the full check. The same function is reused in the Sandbox panel and per-node rendering.

**Graph algorithms in the mock engine**
- Connectivity: BFS from the Start node — every node must be visited
- Cycle detection: DFS with white/grey/black coloring — a grey→grey edge is a back-edge (cycle)
- Simulation order: Kahn's algorithm (topological sort by in-degree) — ensures the execution log follows the actual graph structure, not insertion order

**Connection guard in the store**
`onConnect` in Zustand blocks three invalid states before they're added: anything→Start, End→anything, and duplicate source→target pairs. The user cannot build a structurally invalid graph even before clicking Simulate.

**Form live-sync via watch()**
Each node form subscribes to `watch()` and calls `updateNodeData()` in the store on every keystroke. No submit button — the canvas label updates as you type.

**Undo scope is partialised**
`zundo` temporal middleware only tracks `{nodes, edges}`. Selection state and workflow name are excluded so renaming or clicking doesn't pollute the undo stack.

---

## Completed vs. What I'd Add

### Completed

**Required**
- All 5 node types with full forms and live canvas sync
- `GET /api/automations` + `POST /api/simulate` via MSW v2
- Graph validation: 8 rules (BFS reachability, DFS cycle detection, structural rules, field rules)
- Sandbox panel: serialise → simulate → animated step log
- Clean folder structure with separation of canvas / node / form / API logic
- Reusable hooks (`useWorkflowStore`, `useGraphValidation`, `useAutomations`, `useSimulate`)
- TypeScript strict — discriminated union, no `any`, full interface coverage
- README: architecture, design decisions, how to run

**All Bonus Items**
- Export / Import workflow as JSON
- Node templates (Employee Onboarding, Leave Approval, Document Verification)
- Undo / Redo (Zustand + `zundo` temporal middleware, Ctrl+Z/Y)
- Minimap + zoom controls
- Validation errors visually shown on nodes (red border + AlertCircle badge)
- Auto-layout (Dagre, top-to-bottom)

**Extra**
- 32 unit tests (Vitest) — validate, simulate, serialize
- Copy / Paste nodes (Ctrl+C/V)
- Smart connection guard in the store
- Keyboard shortcuts modal (? key)
- Live workflow complexity score (Simple / Moderate / Complex) + stats in the top bar
- Node search in the palette
- `localStorage` auto-save/restore
- Responsive: desktop three-column, mobile bottom-sheet node form

### Would Add With More Time
- **E2E tests** (Playwright) — golden path: drag Start → Task → Approval → Automated → End → connect → Simulate
- **Node version history** — track field-level changes per node with timestamps
- **Conditional branching in simulation** — trace only the Approved or Rejected path, not both
- **Real backend** — FastAPI + PostgreSQL for workflow persistence, replacing localStorage
- **WebSocket simulation** — stream step results in real time (SSE/WS) rather than returning all steps at once
- **Storybook** — isolated node and form component development

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Canvas | `@xyflow/react` v12 (React Flow) |
| State + Undo | Zustand v5 + `zundo` temporal middleware |
| Forms | react-hook-form + zod + @hookform/resolvers |
| Mock API | MSW v2 (browser service worker) |
| Graph layout | `@dagrejs/dagre` |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Testing | Vitest + @testing-library/react |
| Language | TypeScript (strict mode) |
