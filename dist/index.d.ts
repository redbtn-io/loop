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
    setBy?: string | {
        email: string;
        userId: string;
        at: string;
    };
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
    author?: {
        kind: string;
        id: string;
    } | string;
    verifiedWriter?: {
        kind: string;
        email: string;
        at: string;
    };
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
export declare const LOOP_ATTACHABLE_TOOLS: AttachableLoopTool[];
export interface LoopClientConfig {
    baseUrl?: string;
    token?: string;
    headers?: Record<string, string>;
}
export declare class LoopClient {
    private baseUrl;
    private token?;
    private customHeaders;
    constructor(config?: LoopClientConfig);
    private getHeaders;
    getLoopStatus(loopId: string): Promise<Record<string, unknown>>;
    sendDirective(loopId: string, directive: {
        kind: DirectiveKind;
        text: string;
        priority?: DirectivePriority;
        to?: string;
        expiresAt?: string;
    }): Promise<Record<string, unknown>>;
    controlLoop(loopId: string, action: 'pause' | 'resume' | 'step' | 'stop', reason?: string): Promise<Record<string, unknown>>;
    queryLedger(loopId: string, options?: {
        type?: 'all' | 'tick' | 'event' | 'directive';
        limit?: number;
    }): Promise<Record<string, unknown>>;
    executeTool(name: string, args: Record<string, unknown>): Promise<unknown>;
}
//# sourceMappingURL=index.d.ts.map