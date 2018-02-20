export declare type Task = () => void;
export declare type VoidFn = () => void;
export interface QueueOptions {
    parallel?: number;
    autoStart?: boolean;
    onEmpty?: VoidFn;
    onIdle?: VoidFn;
    rateLimit?: number;
    rateTime?: number;
    minRateDelay?: number;
    maxRateDelay?: number;
    maxExecutions?: number;
}
export interface AddElementOptions {
    priority?: number;
    queueTimeout?: number;
    executionTimeout?: number;
    heat?: number;
}
export interface QueueElementOptions extends AddElementOptions {
    priority: number;
    queueTimeout: number;
    executionTimeout: number;
    heat: number;
}
export interface QueueElement {
    options: QueueElementOptions;
    task: Task;
}
export declare class Queue {
    private _currentlyExecuted;
    private _isPaused;
    private _queue;
    private _timeout;
    private _heat;
    private _lastHeatReset;
    private _lastExecutionCycle;
    private readonly _options;
    constructor(opts?: QueueOptions);
    private _startAutoRateExecution();
    private _calculateTimeoutTime();
    private static _timeoutPromise<ReturnType, T>(time, err);
    private _enqueue(element);
    private _delete(element);
    private _dequeue();
    readonly size: number;
    readonly isEmpty: Boolean;
    readonly hasNext: Boolean;
    private _next();
    add<ReturnType>(fn: () => Promise<ReturnType>, opts?: AddElementOptions): Promise<ReturnType>;
    addAll(fns: any, opts: AddElementOptions): Promise<[{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]>;
    resume(): void;
    pause(): void;
    readonly hasOverheat: Boolean;
    readonly currentlyExecuted: number;
    readonly isPaused: boolean;
}
