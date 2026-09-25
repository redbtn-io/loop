# @redbtn/loop

Canonical LP-1 Loop SDK and attachable tool surface for redOps Operations and RedBtn fleet agents.

## Features

- **LP-1 Types**: Complete TypeScript interfaces for `Spec`, `Control`, `Status`, `Directive`, `Tick`, and `Event`.
- **Client**: Typed client for loop operations against RedBtn Hub and redLoop API endpoints.
- **Attachable Tool Surface**: Dynamic OpenAI / MCP tool definitions (`loop_get_status`, `loop_send_directive`, `loop_control`, `loop_query_ledger`) for attaching running loops to redOps Operations.

## Installation

```bash
npm install @redbtn/loop --registry https://registry.redbtn.io
```

## Usage

```typescript
import { LoopClient, LOOP_ATTACHABLE_TOOLS } from '@redbtn/loop';

const client = new LoopClient({
  baseUrl: 'https://loop.redbtn.io',
  token: process.env.REDBTN_API_KEY
});

// Query live status
const status = await client.getLoopStatus('0d-1uKBu3Mrp');

// Send directive
await client.sendDirective('0d-1uKBu3Mrp', {
  kind: 'task',
  text: 'Verify deployment status on worker delta',
  priority: 'P1'
});

// Mutate control lifecycle
await client.controlLoop('0d-1uKBu3Mrp', 'pause', 'Routine maintenance');
```

## Attaching to redOps Operations

Inject `LOOP_ATTACHABLE_TOOLS` into the agent tool context and delegate execution using `client.executeTool(toolName, args)`.
