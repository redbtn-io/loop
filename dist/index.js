/**
 * @redbtn/loop - LP-1 Loop SDK and Attachable Tool Surface
 * Canonical SDK providing LP-1 types, client functions, and attachable tool definitions
 * for redOps Operations and RedBtn fleet orchestrators.
 */
export const LOOP_ATTACHABLE_TOOLS = [
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
                    enum: ['pause', 'resume', 'run', 'step', 'stop'],
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
export class LoopClient {
    baseUrl;
    token;
    customHeaders;
    constructor(config = {}) {
        this.baseUrl = (config.baseUrl || 'https://loop.redbtn.io').replace(/\/$/, '');
        this.token = config.token;
        this.customHeaders = config.headers || {};
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            ...this.customHeaders,
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }
    async getLoopStatus(loopId) {
        const res = await fetch(`${this.baseUrl}/api/loops/${encodeURIComponent(loopId)}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!res.ok) {
            throw new Error(`Failed to get loop status: HTTP ${res.status}`);
        }
        return res.json();
    }
    async sendDirective(loopId, directive) {
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
    async controlLoop(loopId, action, reason) {
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
    async queryLedger(loopId, options = {}) {
        const params = new URLSearchParams();
        if (options.type && options.type !== 'all') {
            params.set('type', options.type);
        }
        const cleanLimit = Math.min(Math.max(options.limit || 20, 1), 100);
        params.set('limit', String(cleanLimit));
        const qs = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`${this.baseUrl}/api/loops/${encodeURIComponent(loopId)}/records${qs}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        if (!res.ok) {
            throw new Error(`Failed to query ledger: HTTP ${res.status}`);
        }
        return res.json();
    }
    async executeTool(name, args) {
        const loopId = String(args.loopId || '');
        if (!loopId) {
            throw new Error('loopId argument is required');
        }
        switch (name) {
            case 'loop_get_status':
                return this.getLoopStatus(loopId);
            case 'loop_send_directive':
                return this.sendDirective(loopId, {
                    kind: args.kind || 'task',
                    text: String(args.text || ''),
                    priority: args.priority || 'P1',
                    to: args.to ? String(args.to) : undefined,
                    expiresAt: args.expiresAt ? String(args.expiresAt) : undefined,
                });
            case 'loop_control':
                return this.controlLoop(loopId, args.action, args.reason ? String(args.reason) : undefined);
            case 'loop_query_ledger':
                return this.queryLedger(loopId, {
                    type: args.type || 'all',
                    limit: typeof args.limit === 'number' ? args.limit : 20,
                });
            default:
                throw new Error(`Unknown loop tool: ${name}`);
        }
    }
}
//# sourceMappingURL=index.js.map