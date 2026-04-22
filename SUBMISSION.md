# HR Workflow Designer — Case Study Submission

**Role:** Full Stack Engineering Intern — AI Agentic Platforms  
**Company:** Tredence Analytics  
**Submitted by:** Vikas Verma  
**GitHub:** https://github.com/Vikasverma9515/hr_workflow  
**Date:** April 2026

---

## Overview

This submission is a fully functional **HR Workflow Designer** built with React and React Flow. It allows an HR admin to visually design, configure, and simulate internal workflows such as employee onboarding, leave approval, and document verification — entirely in the browser, with no backend required.

The prototype demonstrates:

- Deep proficiency with React Flow (custom nodes, edge management, drag-and-drop)
- Modular, scalable frontend architecture with clean separation of concerns
- Mock API integration via MSW v2 (intercepted at the browser network level)
- Configurable node forms with dynamic fields and real-time validation
- A functional sandbox that simulates workflow execution step by step

---

## How to Run

```bash
git clone https://github.com/Vikasverma9515/hr_workflow
cd hr_workflow
npm install
npm run dev
```

Open **http://localhost:3000** — auto-redirects to `/workflow`.

```bash
npm test        # run 32 unit tests
npm run build   # verify production build
```

> The app uses **MSW (Mock Service Worker)** to intercept API calls in the browser. No backend is needed. On first load, check the browser DevTools console for `[MSW] Started` to confirm the service worker is active.

---

## Functional Requirements — Completed

### 1. Workflow Canvas (React Flow)

| Requirement | How It Was Built |
|---|---|
| Drag nodes from sidebar to canvas | Palette chips set `dataTransfer` on drag; canvas reads type on drop and calls `screenToFlowPosition` to place the node at cursor position |
| Connect nodes with edges | `onConnect` handler in Zustand store — auto-assigns edge color, label (Approved / Rejected), and type based on `sourceHandle` |
| Select a node to open edit panel | `onNodeClick` sets `selectedNodeId`; `NodeFormPanel` reads this and renders the correct form |
| Delete nodes / edges | React Flow `deleteKeyCode={['Backspace', 'Delete']}` — also supports edge delete via ✕ button on each edge |
| Auto-validate constraints | `validateWorkflow()` runs on every store change via `useMemo`; errors surface on nodes (red border) and in the Sandbox panel |

### 2. Node Configuration Forms *(Key Requirement)*

Each node type has a dedicated form rendered in the right-side panel when the node is selected. All forms use **react-hook-form + zod** for validation, and sync to the canvas in real time via `watch()` — no submit button needed.

**Start Node**
- Workflow title (required)
- Metadata — dynamic key-value pairs (add / remove rows)

**Task Node**
- Title (required, validated)
- Description (textarea)
- Assignee (text input)
- Due Date (date picker)
- Custom fields — dynamic key-value pairs

**Approval Node**
- Title
- Approver role — select: Manager / HRBP / Director / VP / C-Suite
- Auto-approve threshold (%) — number input, 0 = disabled
- Info panel showing Approved and Rejected outputs

**Automated Step Node**
- Title
- Action picker — populated from `GET /api/automations`
- Dynamic parameter inputs — rendered from the selected action's `params` array (changes when action changes)

**End Node**
- End message (textarea)
- Show summary report — boolean toggle

### 3. Mock API (MSW v2)

MSW v2 intercepts `fetch` at the browser's Service Worker level — no separate server process, no json-server, no proxy.

**GET /api/automations**
Returns 6 automation actions, each with a `params` array that drives the dynamic form inputs in the Automated Step Node:

```json
[
  { "id": "send_email",    "label": "Send Email",          "params": ["to", "subject"]            },
  { "id": "generate_doc",  "label": "Generate Document",   "params": ["template", "recipient"]    },
  { "id": "notify_slack",  "label": "Notify Slack",        "params": ["channel", "message"]       },
  { "id": "create_ticket", "label": "Create Ticket",       "params": ["project", "summary"]       },
  { "id": "update_hris",   "label": "Update HRIS",         "params": ["employeeId", "field"]      },
  { "id": "send_webhook",  "label": "Send Webhook",        "params": ["url", "payload"]           }
]
```

**POST /api/simulate**
Accepts the serialized workflow graph and runs a real **topological sort (Kahn's algorithm)** on the node-edge adjacency list. Returns `SimulationStep[]` ordered by execution sequence, with per-node status, message, and timestamps. If the graph contains a cycle, the sort produces fewer nodes than expected and the engine returns an error.

### 4. Workflow Test / Sandbox Panel

The Sandbox modal:
1. Runs all 8 validation rules and displays any issues (with node IDs) before allowing simulation
2. Serializes the full graph to a `SimulateRequest` payload
3. Sends it to `POST /api/simulate`
4. Animates the step-by-step execution log (one step every 380ms)
5. Shows a final "Workflow Completed" or "Simulation Failed" summary card

Simulation is blocked if any validation rule fails — the Run button is disabled until the workflow is valid.

---

## Architecture

```
app/
  layout.tsx                Root layout — mounts MSWProvider (client-side SW init)
  page.tsx                  Redirects → /workflow
  workflow/page.tsx         Main shell — ReactFlowProvider, layout, modal state

components/
  canvas/
    WorkflowCanvas.tsx      Drop zone, keyboard shortcuts (Ctrl+Z/Y/C/V), pan/zoom/minimap
    NodePalette.tsx         Draggable node sidebar with search filter + Templates tab
    TopBar.tsx              Live stats, undo/redo, export/import, simulate trigger
  nodes/                    5 custom node renderers — each shows per-node validation badge
  forms/
    NodeFormPanel.tsx       Right-panel switcher (desktop panel / mobile bottom sheet)
    StartNodeForm.tsx       react-hook-form + zod, live canvas sync
    TaskNodeForm.tsx
    ApprovalNodeForm.tsx
    AutomatedStepNodeForm.tsx
    EndNodeForm.tsx
    shared/
      FormField.tsx         Label + error wrapper reused by all forms
      KeyValueEditor.tsx    Dynamic add/remove key-value row editor
  sandbox/
    SandboxPanel.tsx        Validation summary + simulation runner modal
    SimulationLog.tsx       Animated step-by-step timeline
  ui/
    Toast.tsx               Slide-in notifications (success / error / info)
    KeyboardShortcutsModal  Full shortcut reference — press ? to open

hooks/
  useWorkflowStore.ts       Zustand store: nodes, edges, clipboard, undo, connection guard
  useGraphValidation.ts     Memoized 8-rule validation, exposes errorsForNode(id)
  useWorkflowStats.ts       Live complexity score + gate / automation / branch counts
  useAutomations.ts         GET /api/automations — cached on mount
  useSimulate.ts            POST /api/simulate — loading / result / error state

lib/
  types/nodes.ts            Discriminated union: HRNodeData (5 node data interfaces)
  types/api.ts              AutomationAction, SimulateRequest, SimulateResponse
  types/workflow.ts         Workflow, WorkflowEdge serialization types
  graph/validate.ts         8 pure validation rules → ValidationError[]
  graph/serialize.ts        nodes + edges → SimulateRequest
  graph/autolayout.ts       Dagre top-to-bottom layout wrapper
  api/automations.ts        Typed fetch wrapper for /automations
  api/simulate.ts           Typed fetch wrapper for /simulate
  mocks/
    handlers.ts             MSW v2 route handlers (http.get, http.post)
    browser.ts              MSW setupWorker export
    data/automations.ts     Static mock automation definitions
    data/simulate.ts        Kahn's algorithm simulation engine
  templates.ts              3 pre-built workflow templates

__tests__/
  lib/graph/validate.test.ts      14 tests — all 8 validation rules
  lib/mocks/data/simulate.test.ts  7 tests — topological sort, cycle detection, step messages
  lib/graph/serialize.test.ts      7 tests — node/edge mapping, fallbacks, sourceHandle
```

---

## Design Decisions

### Discriminated Union for Node Data

```typescript
type HRNodeData =
  | StartNodeData       // type: 'start'
  | TaskNodeData        // type: 'task'
  | ApprovalNodeData    // type: 'approval'
  | AutomatedStepNodeData // type: 'automated'
  | EndNodeData         // type: 'end'
```

The `type` field makes every `switch` case in form rendering, validation, and serialization exhaustively type-safe. There is no `any`. Adding a new node type means: add one interface, one `DEFAULT_NODE_DATA` entry, one form component, and one validation rule — nothing else changes.

### Validation as a Pure Function

`validateWorkflow(nodes, edges): ValidationError[]` has no side effects. It is memoized inside `useGraphValidation` via `useMemo`, so it only re-runs when nodes or edges change. Any component calls `errorsForNode(id)` without re-triggering the full check. The same function is reused in the Sandbox panel and in per-node rendering.

### Graph Algorithms

The validation and simulation engines implement three classic graph algorithms:

- **BFS (Breadth-First Search)** — connectivity check. Starting from the Start node, visited nodes are collected. Any node not in the visited set is flagged as unreachable.
- **DFS with white/grey/black coloring** — cycle detection. A node is white (unvisited), grey (in current path), or black (fully explored). Encountering a grey node during DFS means a back-edge exists — a cycle.
- **Kahn's Algorithm (topological sort)** — simulation order. Nodes with in-degree 0 are queued; as each is processed its neighbours' in-degrees are decremented. If the sorted list is shorter than total nodes, a cycle exists and simulation fails.

### Connection Guard in the Store

`onConnect` blocks three invalid states before they are added to the edge list:
1. Any node connecting *to* a Start node (Start has no incoming edges)
2. Any node connecting *from* an End node (End has no outgoing edges)
3. Duplicate source → target connections on the same handle

The user cannot build a structurally invalid graph even before opening the Sandbox.

### Form Live-Sync via watch()

Each form subscribes to `watch()` from react-hook-form and calls `updateNodeData()` in the Zustand store on every keystroke. The node label on the canvas updates in real time. No submit button, no `useEffect` polling — the subscription is cleaned up on unmount.

### Undo/Redo Scope is Partialised

`zundo` temporal middleware wraps only `{ nodes, edges }`. `selectedNodeId` and `workflowName` are excluded. Clicking a node or renaming the workflow does not pollute the undo stack — only structural changes (adding, moving, deleting nodes/edges) are tracked.

---

## Completed vs. What I Would Add With More Time

### Completed

**All Required Deliverables**
- React application (Next.js 16, App Router)
- React Flow canvas with 5 fully custom node types
- Node configuration forms for all 5 node types — dynamic fields, controlled, validated
- Mock API integration (MSW v2 — GET /automations, POST /simulate)
- Workflow Test / Sandbox panel with step-by-step simulation log
- README — architecture, how to run, design decisions

**All Bonus Items from the Case Study**
- Export / Import workflow as JSON
- Node templates (Employee Onboarding, Leave Approval, Document Verification)
- Undo / Redo (Zustand + zundo, Ctrl+Z / Ctrl+Y)
- Minimap + zoom controls
- Validation errors visually shown on nodes (red border + error badge)
- Auto-layout (Dagre, top-to-bottom)

**Additional (Beyond the Case Study)**
- 32 unit tests (Vitest) — validate.ts, simulate.ts, serialize.ts
- Copy / Paste nodes (Ctrl+C / Ctrl+V — paste offset by 40px)
- Smart connection guard — prevents invalid connections at store level
- Keyboard shortcuts reference modal (press ? anywhere)
- Live workflow complexity score (Simple / Moderate / Complex) with gate, automation, and branch counts in the top bar
- Node search in the palette (filter by name or description)
- localStorage auto-save — workflow persists across page refresh
- Responsive design — desktop three-column, mobile bottom-sheet form panel

### What I Would Add With More Time

| Feature | Why |
|---|---|
| **E2E tests (Playwright)** | Cover the full golden path: drag Start → Task → Approval → Automated → End → connect → Simulate. Unit tests verify logic; E2E verifies the user flow. |
| **Node version history** | Track field-level changes per node with timestamps — lets the admin see what changed and when in a long workflow editing session. |
| **Conditional branch simulation** | Current simulation walks all nodes. Real approval workflows branch — trace only the Approved *or* Rejected path based on a configurable result. |
| **Real backend (FastAPI + PostgreSQL)** | Persist workflows in a database. The mock layer is already abstracted behind typed fetch wrappers in `lib/api/` — swapping in real endpoints requires no component changes. |
| **SSE / WebSocket simulation** | Stream step results from the server as they execute, rather than returning all steps at once. The `SimulationLog` animation already simulates this client-side; real streaming would replace the interval with an event listener. |
| **Storybook** | Isolated development and documentation of node and form components — makes the design system shareable and testable without running the full app. |

---

## Assessment Criteria — Self Evaluation

| Area | What Was Delivered |
|---|---|
| **React Flow proficiency** | 5 fully custom node renderers with typed props, dual source handles on Approval node, custom edge component (SmartEdge) with delete button and colored pill labels, `screenToFlowPosition` drop, `fitView`, minimap |
| **React architecture** | Hooks-first (`useWorkflowStore`, `useGraphValidation`, `useWorkflowStats`, `useAutomations`, `useSimulate`), zero prop-drilling, clean separation: canvas / nodes / forms / sandbox / ui / hooks / lib |
| **Complex form handling** | react-hook-form + zod on all 5 forms, dynamic param inputs that re-render when `actionId` changes, KeyValueEditor for add/remove rows, live canvas sync via `watch()`, per-field error display |
| **Mock API interaction** | MSW v2 with typed handlers, typed fetch wrappers in `lib/api/`, async loading/error state in `useSimulate`, real graph algorithm in the mock engine |
| **Scalability** | Discriminated union means adding a node type requires one interface + one form + one validation case — no changes to existing code. Validation and serialization are pure functions — easily unit-tested and extended. |
| **Communication** | This document, README, PLAN.md, inline code structured to be readable without comments |
| **Delivery speed** | Full implementation including all bonus items and additional features, with 32 unit tests and a production build |

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Canvas | @xyflow/react v12 (React Flow) |
| State + Undo | Zustand v5 + zundo temporal middleware |
| Forms | react-hook-form + zod + @hookform/resolvers |
| Mock API | MSW v2 (browser service worker) |
| Graph layout | @dagrejs/dagre |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Testing | Vitest + @testing-library/react |
| Language | TypeScript (strict mode) |
