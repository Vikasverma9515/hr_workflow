# HR Workflow Designer

A visual HR workflow builder — Tredence Analytics Full Stack Engineering Intern (AI Agentic Platforms) case study.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square) ![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square) ![Tests](https://img.shields.io/badge/Tests-32%20passing-22c55e?style=flat-square)

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/workflow`.

```bash
npm test        # run 32 unit tests
npm run build   # production build check
```

> The app uses **MSW (Mock Service Worker)** to intercept API calls in the browser. No backend needed — look for `[MSW] Started` in the browser console on first load.

---

## What It Does

Build, validate, and simulate HR process workflows visually — drag nodes onto a canvas, connect them, fill in details, then run a simulation to trace execution step by step.

---

## Features

### Canvas & Editing
| Feature | Detail |
|---------|--------|
| Drag-and-drop palette | 5 node types — drag from sidebar to canvas |
| Live node editing | Click any node to open its form; changes reflect on the canvas instantly |
| Smart edges | Approval node has **Approved** (green) and **Rejected** (red) outputs |
| Undo / Redo | `Ctrl+Z` / `Ctrl+Y` — powered by Zustand `zundo` temporal middleware |
| Copy / Paste nodes | `Ctrl+C` / `Ctrl+V` — paste offset by 40px |
| Delete | `Backspace` or `Delete` key |
| Auto-layout | Dagre top-to-bottom layout with one click |
| Export / Import | Download or upload workflow as JSON |
| 3 built-in templates | Employee Onboarding, Leave Approval, Document Verification |
| Node search | Filter the palette by name or description |
| Keyboard shortcuts | Press `?` to open the shortcuts reference |
| localStorage auto-save | Workflow survives page refresh |

### Node Types & Forms
| Node | Form Fields |
|------|-------------|
| **Start** | Title, metadata key-value pairs |
| **Task** | Title, description, assignee, due date, custom key-value fields |
| **Approval** | Title, approver role (Manager / HRBP / Director / VP / C-Suite), auto-approve threshold % |
| **Automated Step** | Title, action picker (from `GET /api/automations`), dynamic param inputs per action |
| **End** | End message, show summary toggle |

### Validation (8 Rules)
Validated live on every change — errors shown in the Sandbox panel and as red-border badges on the offending node.

1. Exactly one Start node
2. At least one End node
3. Start node has no incoming edges
4. End node has no outgoing edges
5. All nodes reachable from Start — BFS connectivity check
6. No cycles — DFS white / grey / black coloring
7. Task nodes must have a non-empty title
8. Automated nodes must have an action selected

### Simulation
- Serializes the graph to `POST /api/simulate` (MSW-intercepted)
- Mock engine runs **Kahn's algorithm** (topological sort) — real correctness check, not fake data
- Results animate step by step in the Sandbox panel (380ms per step)
- Blocked if any validation rule fails

### Mock API (MSW v2)
| Endpoint | Response |
|----------|----------|
| `GET /api/automations` | 6 actions: Send Email, Generate Document, Notify Slack, Create Ticket, Update HRIS, Send Webhook |
| `POST /api/simulate` | Topological sort → `SimulationStep[]` with per-node status, message, timestamps |

### TopBar Stats (live)
Complexity score (Simple / Moderate / Complex), approval gate count, automation count, branch count — all update as you build.

---

## Tech Stack

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | Next.js 16 App Router | SSR, file-based routing, `'use client'` boundary control |
| Canvas | `@xyflow/react` v12 | React Flow — handles pan/zoom/connect/minimap |
| State | Zustand v5 + zundo | Flat store, undo/redo via temporal middleware |
| Forms | react-hook-form + zod | Schema-validated, controlled, zero re-render overhead |
| Mock API | MSW v2 | Intercepts `fetch` in-browser — no separate server |
| Styling | Tailwind CSS v4 | `@import "tailwindcss"` syntax, `@theme {}` tokens |
| Icons | lucide-react | Tree-shakeable, consistent stroke weight |
| Layout algo | `@dagrejs/dagre` | Graph auto-layout (topological sort) |
| Testing | Vitest + Testing Library | Fast, ESM-native, jsdom environment |

---

## Project Structure

```
app/
  workflow/page.tsx         — Designer shell (ReactFlowProvider + layout)

components/
  canvas/
    WorkflowCanvas.tsx      — Drop zone, keyboard shortcuts, pan/zoom
    NodePalette.tsx         — Draggable node sidebar with search + templates
    TopBar.tsx              — Stats, undo/redo, export/import, simulate
  nodes/                    — 5 custom node renderers (per-node error badges)
  forms/
    NodeFormPanel.tsx       — Right panel switcher (desktop + mobile sheet)
    *NodeForm.tsx           — One form per node type
    shared/KeyValueEditor   — Dynamic add/remove key-value rows
  sandbox/
    SandboxPanel.tsx        — Validation results + simulation runner
    SimulationLog.tsx       — Animated timeline (step reveal)
  ui/
    Toast.tsx               — Slide-in notifications (success / error / info)
    KeyboardShortcutsModal  — Shortcut reference (? key)

hooks/
  useWorkflowStore.ts       — Zustand store: nodes, edges, clipboard, undo
  useGraphValidation.ts     — Memoized validation + errorsForNode(id)
  useWorkflowStats.ts       — Complexity score, gate/automation/branch counts
  useAutomations.ts         — GET /api/automations
  useSimulate.ts            — POST /api/simulate

lib/
  types/nodes.ts            — Discriminated union: HRNodeData
  graph/validate.ts         — 8 pure validation rules → ValidationError[]
  graph/serialize.ts        — nodes + edges → SimulateRequest
  graph/autolayout.ts       — Dagre layout wrapper
  mocks/                    — MSW handlers + Kahn's algorithm sim engine

__tests__/                  — 32 Vitest unit tests
```

---

## Key Design Decisions

**Discriminated union for node data** — `HRNodeData = StartNodeData | TaskNodeData | ...` with a `type` field makes every form switch exhaustively type-safe. No `any`, no casting except through `unknown`.

**Validation as a pure function** — `validateWorkflow(nodes, edges)` has no side effects; memoized in `useGraphValidation`. Any component can call `errorsForNode(id)` for per-node error rendering without re-running the full check.

**MSW for the mock API** — The simulation engine inside the MSW handler runs a real Kahn's topological sort. The Sandbox panel tests actual graph correctness, not a hardcoded response.

**Connection guard in the store** — `onConnect` blocks connections to Start nodes, from End nodes, and duplicate source→target pairs — user can't build an invalid graph structure even before hitting Simulate.

**Undo scope is partialised** — `zundo` only tracks `{nodes, edges}`, not `selectedNodeId` or `workflowName`. Selection/rename don't pollute the undo stack.
