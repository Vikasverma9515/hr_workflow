# HR Workflow Designer — Implementation Plan

> Built on Next.js 16 · React 19 · TypeScript · Tailwind v4 · @xyflow/react · Zustand · MSW

---

## Requirements Checklist (from case study PDF)

| # | Requirement | Phase |
|---|------------|-------|
| 1 | Drag-and-drop workflow canvas (React Flow) | 2 |
| 2 | Start, Task, Approval, Automated Step, End node types | 3 |
| 3 | Sidebar palette — drag nodes onto canvas | 2 |
| 4 | Connect nodes with edges | 2 |
| 5 | Select a node to open edit panel | 3 |
| 6 | Delete nodes/edges | 2 |
| 7 | Auto-validate constraints (Start must be first, etc.) | 5 |
| 8 | Start Node form (title + metadata KV pairs) | 4 |
| 9 | Task Node form (title, desc, assignee, due date, custom KV) | 4 |
| 10 | Approval Node form (title, approver role, auto-approve threshold) | 4 |
| 11 | Automated Step Node form (title, action picker, dynamic params) | 4 |
| 12 | End Node form (end message, summary flag toggle) | 4 |
| 13 | Mock API — GET /automations | 1 |
| 14 | Mock API — POST /simulate | 1 |
| 15 | Sandbox/test panel — serialize graph, simulate, step-by-step log | 5 |
| 16 | Validate structure: missing connections, cycles | 5 |
| 17 | Clean folder structure | All |
| 18 | Reusable custom hooks | All |
| 19 | Type-safe interfaces for every node | 1 |
| 20 | README (architecture, run instructions, decisions, future work) | 6 |

**Bonus targets (if time permits)**

- [ ] Export / Import workflow as JSON
- [ ] Undo/Redo (Zustand with temporal middleware)
- [ ] Minimap + zoom controls
- [ ] Visual error badges on invalid nodes
- [ ] Auto-layout (dagre)

---

## Tech Stack Decisions

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | Next.js 16 (App Router) | Already scaffolded; SSR for perf |
| React Flow | `@xyflow/react` v12 | Latest package name for React Flow v12 |
| State | Zustand v5 | Lightweight, works great with React 19, easy temporal undo |
| Forms | react-hook-form + zod | Controlled, validated, strongly typed |
| Mock API | MSW v2 (browser handler) | Intercepts fetch in-browser; no separate server needed |
| Styling | Tailwind v4 | Already configured |
| Icons | lucide-react | Tree-shakeable, consistent |
| Graph algo | custom BFS/DFS | Cycle detection + topological sort for simulation |

---

## Folder Structure

```
app/
  layout.tsx                 — root layout (fonts, providers)
  page.tsx                   — redirects to /workflow
  workflow/
    page.tsx                 — WorkflowDesigner page shell

components/
  canvas/
    WorkflowCanvas.tsx       — ReactFlow provider + canvas
    NodePalette.tsx          — left sidebar with draggable node chips
    CanvasControls.tsx       — zoom, minimap, fit-view buttons
  nodes/
    StartNode.tsx
    TaskNode.tsx
    ApprovalNode.tsx
    AutomatedStepNode.tsx
    EndNode.tsx
    index.ts                 — nodeTypes map
  forms/
    NodeFormPanel.tsx        — right-panel switcher
    StartNodeForm.tsx
    TaskNodeForm.tsx
    ApprovalNodeForm.tsx
    AutomatedStepNodeForm.tsx
    EndNodeForm.tsx
    shared/
      KeyValueEditor.tsx     — reusable KV pair input
      FormField.tsx          — label + input wrapper
  sandbox/
    SandboxPanel.tsx         — simulate modal/drawer
    SimulationLog.tsx        — step-by-step timeline
  ui/
    Button.tsx
    Badge.tsx
    Modal.tsx
    Toggle.tsx

hooks/
  useWorkflowStore.ts        — Zustand store (nodes, edges, selected)
  useAutomations.ts          — fetches GET /automations via MSW
  useSimulate.ts             — posts POST /simulate via MSW
  useGraphValidation.ts      — cycle detection, connectivity checks

lib/
  api/
    automations.ts           — fetch wrapper for /automations
    simulate.ts              — fetch wrapper for /simulate
  mocks/
    handlers.ts              — MSW request handlers
    browser.ts               — MSW browser setup
    data/
      automations.ts         — mock automation actions data
      simulate.ts            — mock simulation engine
  graph/
    validate.ts              — pure graph validation functions
    serialize.ts             — nodes+edges → workflow JSON
    simulate.ts              — topological traversal logic
  types/
    nodes.ts                 — discriminated union NodeData types
    workflow.ts              — Workflow, SimulationResult types
    api.ts                   — API response types

public/
  msw/                       — MSW service worker (auto-generated)
```

---

## Type Design (types/nodes.ts)

All node data uses a **discriminated union** on `type` — this makes form switching trivial and is fully type-safe.

```typescript
type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end'

interface BaseNodeData { label: string }

interface StartNodeData extends BaseNodeData {
  type: 'start'
  title: string
  metadata: Record<string, string>
}

interface TaskNodeData extends BaseNodeData {
  type: 'task'
  title: string
  description: string
  assignee: string
  dueDate: string
  customFields: Record<string, string>
}

interface ApprovalNodeData extends BaseNodeData {
  type: 'approval'
  title: string
  approverRole: 'Manager' | 'HRBP' | 'Director' | string
  autoApproveThreshold: number
}

interface AutomatedStepNodeData extends BaseNodeData {
  type: 'automated'
  title: string
  actionId: string
  actionParams: Record<string, string>
}

interface EndNodeData extends BaseNodeData {
  type: 'end'
  endMessage: string
  showSummary: boolean
}

type HRNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | EndNodeData
```

---

## Phase Breakdown

---

### Phase 0 — Dependencies & Project Config
**Goal:** Install all packages, configure MSW, verify TS paths.

**Tasks:**
1. `npm install @xyflow/react zustand react-hook-form zod lucide-react msw`
2. Add path aliases in `tsconfig.json` (`@/` → project root)
3. Init MSW: `npx msw init public/`
4. Create `lib/mocks/browser.ts` and `lib/mocks/handlers.ts` stubs
5. Mount MSW in `app/layout.tsx` (client-side conditional)
6. Add `@types/node` check, confirm Tailwind v4 theme tokens

**Definition of Done:** `npm run dev` starts without errors, MSW service worker registers in DevTools.

---

### Phase 1 — Types, Mock API Data & API Layer
**Goal:** All TypeScript types defined; mock API is live and testable.

**Tasks:**
1. Write `lib/types/nodes.ts` — full discriminated union (see above)
2. Write `lib/types/workflow.ts` — `Workflow`, `WorkflowEdge`, `SimulationStep`, `SimulationResult`
3. Write `lib/types/api.ts` — `AutomationAction`, `SimulateRequest`, `SimulateResponse`
4. Populate `lib/mocks/data/automations.ts`:
   ```json
   [
     { "id": "send_email", "label": "Send Email", "params": ["to", "subject"] },
     { "id": "generate_doc", "label": "Generate Document", "params": ["template", "recipient"] },
     { "id": "notify_slack", "label": "Notify Slack", "params": ["channel", "message"] },
     { "id": "create_ticket", "label": "Create Ticket", "params": ["project", "summary"] }
   ]
   ```
5. Write `lib/mocks/data/simulate.ts` — pure function that takes workflow JSON, does topological traversal, returns `SimulationStep[]`
6. Write MSW handlers in `lib/mocks/handlers.ts`:
   - `GET /api/automations` → returns automations list
   - `POST /api/simulate` → calls simulate function, returns steps
7. Write `lib/api/automations.ts` and `lib/api/simulate.ts` — typed fetch wrappers

**Definition of Done:** Visiting `/api/automations` in browser returns the JSON array (intercepted by MSW).

---

### Phase 2 — Canvas Shell & Drag-and-Drop
**Goal:** Full-screen canvas with sidebar; nodes can be dragged onto canvas; edges can be drawn; delete works.

**Tasks:**
1. Create `app/workflow/page.tsx` — three-column layout:
   - Left: `NodePalette` (240px, fixed)
   - Center: `WorkflowCanvas` (flex-1)
   - Right: `NodeFormPanel` (320px, slides in when node selected)
2. Create `hooks/useWorkflowStore.ts` — Zustand store:
   ```typescript
   { nodes, edges, selectedNodeId,
     addNode, updateNode, removeNode,
     addEdge, removeEdge,
     setSelectedNode, clearSelection }
   ```
3. Create `components/canvas/WorkflowCanvas.tsx`:
   - `<ReactFlow>` with `nodeTypes`, `edgeTypes`
   - `onDrop` + `onDragOver` for palette → canvas drop
   - `onNodesDelete`, `onEdgesDelete`
   - `onNodeClick` → sets `selectedNodeId`
   - `onConnect` → validates and adds edge
   - `<Background>`, `<Controls>`, `<MiniMap>`
4. Create `components/canvas/NodePalette.tsx`:
   - Cards for each node type (Start, Task, Approval, Automated, End)
   - `draggable` + `onDragStart` that sets `dataTransfer` with node type
   - Color-coded per type (green=Start, blue=Task, orange=Approval, purple=Automated, red=End)
5. Handle canvas `onDrop`: convert screen coords → flow coords with `screenToFlowPosition`

**Definition of Done:** Drag 3 nodes onto canvas, draw edges between them, delete one — all reflected in store.

---

### Phase 3 — Custom Node Components
**Goal:** Each node type has a distinct, informative visual component with correct handles.

**Tasks for each node (StartNode, TaskNode, ApprovalNode, AutomatedStepNode, EndNode):**

1. **StartNode** — Green circle/pill, only `source` handle at bottom
   - Shows: title, "START" badge
   - No target handle (entry point)

2. **TaskNode** — Blue card
   - Shows: title, assignee chip, due date, description snippet
   - Source handle (bottom) + Target handle (top)

3. **ApprovalNode** — Orange diamond/card
   - Shows: title, approver role badge, threshold
   - Source handle (bottom, two outputs: Approved/Rejected) + Target handle (top)

4. **AutomatedStepNode** — Purple card with gear icon
   - Shows: title, action label
   - Source + Target handles

5. **EndNode** — Red circle, only `target` handle at top
   - Shows: end message, summary flag indicator
   - No source handle (exit point)

**Shared node behaviors:**
- Selected state: ring highlight
- Error state: red border + error badge (from validation)
- Hover: subtle shadow

**Definition of Done:** All 5 node types render correctly on canvas with proper handles.

---

### Phase 4 — Node Form Panel (Key Requirement)
**Goal:** Right panel with fully controlled, validated forms per node type. Editing updates the node in real time.

**Architecture:**
- `NodeFormPanel` reads `selectedNodeId` from store, finds node data, switches on `type`
- Each form uses `react-hook-form` with a `zod` schema
- `onChange` / `onBlur` triggers `updateNode` in the store
- Forms are controlled via `useForm` + `reset` when `selectedNodeId` changes

**Tasks:**

1. `components/forms/shared/FormField.tsx` — `label + input/textarea` wrapper, shows validation error
2. `components/forms/shared/KeyValueEditor.tsx` — dynamic add/remove rows of `key: value` pairs
3. `components/forms/StartNodeForm.tsx`:
   - Title input (required)
   - KeyValueEditor for metadata
4. `components/forms/TaskNodeForm.tsx`:
   - Title (required), Description (textarea), Assignee, Due Date (date input)
   - KeyValueEditor for custom fields
5. `components/forms/ApprovalNodeForm.tsx`:
   - Title, Approver Role (select: Manager / HRBP / Director / Custom), Auto-approve threshold (number)
6. `components/forms/AutomatedStepNodeForm.tsx`:
   - Title
   - Action picker (select, populated from GET /automations via `useAutomations` hook)
   - Dynamic param inputs rendered from selected action's `params` array
7. `components/forms/EndNodeForm.tsx`:
   - End Message (textarea)
   - Summary Flag (Toggle / checkbox)
8. `components/forms/NodeFormPanel.tsx`:
   - Slide-in panel (right side)
   - Header with node type icon + "Close" button
   - Renders correct form based on `node.type`

**Definition of Done:** Select a Task node → form appears; edit title → node label updates live on canvas.

---

### Phase 5 — Validation & Sandbox Panel
**Goal:** Graph validation + full simulation flow with step-by-step log.

**Validation Rules (`lib/graph/validate.ts`):**
```
1. Must have exactly one Start node
2. Must have at least one End node
3. Start node must have no incoming edges
4. End node must have no outgoing edges
5. All nodes must be reachable from Start (connectivity check — BFS)
6. No cycles (DFS cycle detection)
7. Task nodes must have a title
8. Automated nodes must have an action selected
```

**Tasks:**
1. Write `lib/graph/validate.ts` — pure functions, returns `ValidationError[]` with `{ nodeId, message }`
2. Write `lib/graph/serialize.ts` — nodes + edges → `Workflow` JSON
3. Write `lib/graph/simulate.ts` — topological sort → walk nodes, produce `SimulationStep[]` per node
4. Create `hooks/useGraphValidation.ts` — runs validation on every store change, exposes `errors` map
5. Wire validation errors into node rendering: nodes with errors get red border + tooltip
6. Create `components/sandbox/SandboxPanel.tsx`:
   - "Run Simulation" button in top bar
   - Opens modal/drawer
   - On open: runs `validate`, shows errors if any
   - If valid: calls `POST /api/simulate` with serialized workflow
   - Shows loading spinner during fetch
7. Create `components/sandbox/SimulationLog.tsx`:
   - Renders `SimulationStep[]` as vertical timeline
   - Each step: node icon, node title, status (pending → running → done), timestamp
   - Steps animate in sequentially (300ms delay each, CSS transition)
   - Final "Workflow Complete" or "Failed" summary

**Definition of Done:** Build an onboarding workflow (Start → Task → Approval → End), click Simulate, see 4 steps animate in the log.

---

### Phase 6 — Polish, Responsive Design & README
**Goal:** Production-quality finish, works on all screen sizes, README complete.

**Tasks:**

**Responsive:**
- Mobile (< 768px): Palette collapses to bottom sheet or top toolbar; form panel overlays canvas full-width
- Tablet (768–1024px): Palette icon-only sidebar; form panel slides over canvas
- Desktop (> 1024px): Three-column layout as designed

**UX Polish:**
- Empty state on canvas: dashed border + "Drag a node to begin" message
- Top bar: workflow name (editable inline), Save JSON button, Run Simulation button
- Node count badge in top bar
- Keyboard: `Delete`/`Backspace` removes selected node; `Escape` deselects
- Smooth edge animation (animated: true on new edges)

**README tasks:**
1. Architecture overview diagram (ASCII or text)
2. How to run (`npm install` → `npm run dev`)
3. Design decisions (why Zustand, why MSW, discriminated union rationale)
4. What's complete vs. what's next
5. Known assumptions

**Definition of Done:** App runs, looks clean, README answers all case study submission points.

---

### Bonus Phase — Extras (time permitting)
1. **Export/Import JSON** — top-bar buttons, `JSON.stringify(serialize())` download, `FileReader` import
2. **Undo/Redo** — Zustand `temporal` middleware wrapping `nodes` + `edges`
3. **Auto-layout** — `dagre` library, "Auto Layout" button in controls
4. **Node templates** — palette shows preset workflow templates (e.g., "Onboarding Starter")

---

## Implementation Order Summary

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Bonus
  deps      types     canvas    nodes     forms     sandbox   polish    extras
  (30m)     (30m)     (60m)     (45m)     (60m)     (60m)     (45m)    (if time)
```

**Total estimated time: ~5.5 hours core + extras**

---

## Critical Gotchas to Watch

1. **Next.js 16 / React 19** — `@xyflow/react` must be a client component (`'use client'`). MSW browser mounting must also be client-side only. Use `dynamic(() => import(...), { ssr: false })` for the canvas page if needed.
2. **Tailwind v4** — uses `@import "tailwindcss"` syntax (not `@tailwind base/components/utilities`). Custom colors go in `@theme {}` block in globals.css.
3. **React Flow node updates** — always use immutable updates via the store; do NOT mutate node.data directly.
4. **MSW v2** — uses `http.get()` / `http.post()` handlers (not `rest.get()`). Init with `worker.start({ onUnhandledRequest: 'bypass' })`.
5. **screenToFlowPosition** — use `useReactFlow()` hook inside `ReactFlowProvider`; the canvas component must be a child of the provider.
6. **Handles** — `Position.Top` for target, `Position.Bottom` for source. ApprovalNode needs two source handles with unique `id` props.

---

## Validation Rules — Formal Spec

```
RULE 1: exactly_one_start
  nodes.filter(n => n.type === 'start').length === 1

RULE 2: at_least_one_end
  nodes.filter(n => n.type === 'end').length >= 1

RULE 3: start_no_incoming
  edges.filter(e => e.target === startNode.id).length === 0

RULE 4: end_no_outgoing
  for each endNode: edges.filter(e => e.source === endNode.id).length === 0

RULE 5: all_reachable
  BFS from startNode; visited.size === nodes.length

RULE 6: no_cycles
  DFS with white/grey/black coloring; grey→grey edge = cycle

RULE 7: task_has_title
  for each taskNode: data.title.trim().length > 0

RULE 8: automated_has_action
  for each automatedNode: data.actionId !== ''
```

---

## Mock Simulation Engine Logic

```
1. Validate workflow (abort if errors)
2. Topological sort (Kahn's algorithm on adjacency list)
3. Walk sorted node list:
   - For each node, emit SimulationStep { nodeId, nodeType, title, status: 'running', startedAt }
   - Sleep 500ms (mock processing time)
   - Emit update: status: 'done', completedAt
4. After all nodes: emit { type: 'complete', message: endNode.data.endMessage }
```

The MSW `/simulate` handler runs this synchronously and returns all steps at once; the frontend replays them with `setInterval` / `setTimeout` for the animated log.
