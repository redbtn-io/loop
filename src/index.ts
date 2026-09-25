/**
 * @redbtn/loop - LP-1 Loop SDK and Attachable Tool Surface
 * Canonical SDK providing LP-1 types, client functions, and attachable tool definitions
 * for redOps Operations and RedBtn fleet orchestrators.
 */

export type ControlMode = 'running' | 'paused' | 'step' | 'stopped';
export type DirectiveKind = 'goal' | 'task' | 'constraint' | 'question' | 'control' | 'feedback' | 'approval';
export type DirectivePriority = 'P0' | 'P1' | 'P2' | 'P3' | number;

export interface LaneSpec {
  id: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

export interface Lp1Spec {
  lp?: string;
  loopId: string;
  name: string;
  owner?: string;
  mission?: string;
  lanes: LaneSpec[];
  [key: string]: unknown;
}

export interface Lp1Control {
  mode: ControlMode;
  reason?: string;
  reasonCode?: string;
  stopType?: 'soft' | 'hard';
  until?: string;
  nextTickAt?: string;
  setBy?: string | { email: string; userId: string; at: string };
  setAt?: string;
  [key: string]: unknown;
}

export interface LaneStatus {
  phase?: string;
  heartbeatAt?: string;
  health?: 'ok' | 'degraded' | 'error' | 'unknown';
  lastResult?: Record<string, unknown> | null;
  activeTask?: string;
  [key: string]: unknown;
}

export type Lp1Status = Record<string, LaneStatus>;

export interface Lp1Directive {
  id?: string;
  kind: DirectiveKind;
  text: string;
  priority: DirectivePriority;
  to?: string;
  author?: { kind: string; id: string } | string;
  verifiedWriter?: { kind: string; email: string; at: string };
  createdAt?: string;
  at?: string;
  expiresAt?: string;
  status?: 'new' | 'acked' | 'active' | 'done' | 'rejected';
  refs?: unknown[];
  [key: string]: unknown;
}

export interface Lp1Tick {
  id: string;
  lane: string;
  runId?: string;
  startedAt?: string;
  at?: string;
  durationMs?: number;
  packBytes?: number;
  decision?: string;
  text?: string;
  outcome?: string;
  evidence?: string;
  raw?: unknown;
  [key: string]: unknown;
}

export interface Lp1Event {
  id: string;
  at: string;
  type: string;
  text?: string;
  message?: string;
  severity?: string;
  raw?: unknown;
  [key: string]: unknown;
}

export interface PlanStep {
  id: string;
  task: string;
  status: 'ready' | 'running' | 'done' | 'blocked' | 'failed';
  attempts?: number;
  lane?: string;
  result?: unknown;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface QuotaInfo {
  isQuotaPaused: boolean;
  reason?: string;
  until?: string;
  resetText?: string;
  canOverride: boolean;
}

export interface AttachableLoopTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const LOOP_ATTACHABLE_TOOLS: AttachableLoopTool[] = [
  {
    name: 'loop_get_status',
    description: 'Get real-time operational status, health, active task, and lane states for a loop.',
    parameters: {
      type: 'object',
      properties: {
        loopId: {
          type: 'string',
          description: 'Unique loop identifier (e.g. 0d-1uKBu3Mrp). Must not include leading loop- prefix.',
        },
      },
      required: ['loopId'],
    },
  },
  {
    name: 'loop_send_directive',
    description: 'Inject an LP-1 steering directive into a running loop inbox. Web directives land as approvals.',
    parameters: {
      type: 'object',
      properties: {
        loopId: {
          type: 'string',
          description: 'Unique loop identifier.',
        },
        kind: {
          type: 'string',
          enum: ['goal', 'task', 'constraint', 'question', 'control', 'feedback', 'approval'],
          description: 'Directive category.',
        },
        text: {
          type: 'string',
          description: 'Directive instructions or text body.',
        },
        priority: {
          type: 'string',
          enum: ['P0', 'P1', 'P2', 'P3'],
          description: 'P0 interrupts immediately; P1 next tick priority; P2 standard backlog queue; P3 background.',
        },
        to: {
          type: 'string',
          description: 'Target lane (defaults to director).',
        },
        expiresAt: {
          type: 'string',
          description: 'Optional ISO timestamp when this directive expires.',
        },
      },
      required: ['loopId', 'kind', 'text'],
    },
  },
  {
    name: 'loop_control',
    description: 'Mutate the lifecycle state of a loop (pause, resume, step, stop).',
    parameters: {
      type: 'object',
      properties: {
        loopId: {
          type: 'string',
          description: 'Unique loop identifier.',
        },
        action: {
          type: 'string',
          enum: ['pause', 'resume', 'step', 'stop'],
          description: 'Lifecycle transition to execute.',
        },
        reason: {
          type: 'string',
          description: 'Human or agent justification for this lifecycle transition.',
        },
      },
      required: ['loopId', 'action'],
    },
  },
  {
    name: 'loop_query_ledger',
    description: 'Query historical tick records and milestone events from the loop execution ledger.',
    parameters: {
      type: 'object',
      properties: {
        loopId: {
          type: 'string',
          description: 'Unique loop identifier.',
        },
        type: {
          type: 'string',
          enum: ['all', 'tick', 'event', 'directive'],
          description: 'Record type filter. Use all to query without tag restriction.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of records to return (defaults to 20, max 100).',
        },
      },
      required: ['loopId'],
    },
  },
];

export interface LoopClientConfig {
  baseUrl?: string;
  token?: string;
  headers?: Record<string, string>;
}

export class LoopClient {
  private baseUrl: string;
  private token?: string;
  private customHeaders: Record<string, string>;

  constructor(config: LoopClientConfig = {}) {
    this.baseUrl = (config.baseUrl || 'https://loop.redbtn.io').replace(/\/$/, '');
    this.token = config.token;
    this.customHeaders = config.headers || {};
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.customHeaders,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async getLoopStatus(loopId: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/api/loops/${encodeURIComponent(loopId)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to get loop status: HTTP ${res.status}`);
    }
    return res.json();
  }

  async sendDirective(
    loopId: string,
    directive: {
      kind: DirectiveKind;
      text: string;
      priority?: DirectivePriority;
      to?: string;
      expiresAt?: string;
    }
  ): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/api/loops/${encodeURIComponent(loopId)}/directives`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(directive),
    });
    if (!res.ok) {
      throw new Error(`Failed to send directive: HTTP ${res.status}`);
    }
    return res.json();
  }

  async controlLoop(
    loopId: string,
    action: 'pause' | 'resume' | 'step' | 'stop',
    reason?: string
  ): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/api/loops/${encodeURIComponent(loopId)}/control`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action, reason }),
    });
    if (!res.ok) {
      throw new Error(`Failed to update loop control: HTTP ${res.status}`);
    }
    return res.json();
  }

  async queryLedger(
    loopId: string,
    options: { type?: 'all' | 'tick' | 'event' | 'directive'; limit?: number } = {}
  ): Promise<Record<string, unknown>> {
    const params = new URLSearchParams();
    if (options.type && options.type !== 'all') {
      params.set('type', options.type);
    }
    const cleanLimit = Math.min(Math.max(options.limit || 20, 1), 100);
    params.set('limit', String(cleanLimit));
    const qs = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(
      `${this.baseUrl}/api/loops/${encodeURIComponent(loopId)}/records${qs}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to query ledger: HTTP ${res.status}`);
    }
    return res.json();
  }

  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const loopId = String(args.loopId || '');
    if (!loopId) {
      throw new Error('loopId argument is required');
    }

    switch (name) {
      case 'loop_get_status':
        return this.getLoopStatus(loopId);

      case 'loop_send_directive':
        return this.sendDirective(loopId, {
          kind: (args.kind as DirectiveKind) || 'task',
          text: String(args.text || ''),
          priority: (args.priority as DirectivePriority) || 'P1',
          to: args.to ? String(args.to) : undefined,
          expiresAt: args.expiresAt ? String(args.expiresAt) : undefined,
        });

      case 'loop_control':
        return this.controlLoop(
          loopId,
          args.action as 'pause' | 'resume' | 'step' | 'stop',
          args.reason ? String(args.reason) : undefined
        );

      case 'loop_query_ledger':
        return this.queryLedger(loopId, {
          type: (args.type as 'all' | 'tick' | 'event' | 'directive') || 'all',
          limit: typeof args.limit === 'number' ? args.limit : 20,
        });

      default:
        throw new Error(`Unknown loop tool: ${name}`);
    }
  }
}
