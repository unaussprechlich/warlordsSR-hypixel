"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function lowerBound(array, value, comp) {
    let first = 0;
    let count = array.length;
    while (count > 0) {
        const step = (count / 2) | 0;
        let it = first + step;
        if (comp(array[it], value) <= 0) {
            first = ++it;
            count -= step + 1;
        }
        else
            count = step;
    }
    return first;
}
class OptionNumberError extends TypeError {
    constructor(value, name) {
        super(`Expected \`${name}\` to be a number from 1 and up, got \`${value}\` (${typeof value})`);
    }
}
class ExecutionTimeOutError extends Error {
    constructor(time) {
        super("ExecutionTimeout reached: " + time + " ms");
    }
}
class QueueTimeOutError extends Error {
    constructor(time) {
        super("QueueTimeout reached: " + time + " ms");
    }
}
class Middleware {
    constructor() {
        this.go = next => next();
    }
    use(fn) {
        this.go = (stack => next => stack(fn.bind(this, next.bind(this))))(this.go);
    }
}
class Queue {
    constructor(opts) {
        this._currentlyExecuted = 0;
        this._queue = [];
        this._timeout = null;
        this._heat = 0;
        this._lastHeatReset = Date.now();
        this._lastExecutionCycle = Date.now();
        if (!opts)
            opts = {};
        const options = Object.assign({
            parallel: 1,
            autoStart: true,
            onEmpty: () => { },
            onIdle: () => { },
            rateLimit: 100,
            rateTime: 1000 * 60,
            minRateDelay: 10,
            maxRateDelay: 600,
            maxExecutions: 5
        }, opts);
        if (!(options.parallel >= 1))
            throw new OptionNumberError(options.parallel, "QueueOptions.parallel");
        if (options.parallel > options.rateLimit)
            throw SyntaxError("You can't perform more PARALLEL_EXECUTIONS, then your RATE_LIMIT allows!");
        this._options = options;
        this._isPaused = !options.autoStart;
        setInterval(() => {
            this._heat = 0;
            this._lastHeatReset = Date.now();
        }, this._options.rateTime);
        this._startAutoRateExecution();
    }
    _startAutoRateExecution() {
        this._timeout = setTimeout(() => {
            this._startAutoRateExecution();
            if (this.isEmpty || this.hasOverheat || this.isPaused)
                return;
            let executions = this._options.parallel;
            if (this._currentlyExecuted + this._options.parallel > this._options.maxExecutions)
                executions -= (this._currentlyExecuted + this._options.parallel) - this._options.maxExecutions;
            for (let x = 0; x < executions; x++) {
                this._next();
            }
        }, this._calculateTimeoutTime());
    }
    _calculateTimeoutTime() {
        return this._options.rateTime / (this._options.rateLimit / this._options.parallel);
    }
    static _timeoutPromise(time, err) {
        return new Promise((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                reject(err);
            }, time);
        });
    }
    _enqueue(element) {
        if (this.isEmpty && this._currentlyExecuted == 0 && !this.hasOverheat && !this._isPaused) {
            element.task();
            return;
        }
        if (this.isEmpty || element.options.priority == 0) {
            this._queue.push(element);
        }
        else if (this._queue[this.size - 1].options.priority >= element.options.priority) {
            this._queue.push(element);
        }
        else {
            const index = lowerBound(this._queue, element, (a, b) => b.options.priority - a.options.priority);
            this._queue.splice(index, 0, element);
        }
    }
    _delete(element) {
        this._queue.splice(this._queue.indexOf(element));
    }
    _dequeue() {
        return this._queue.shift();
    }
    get size() {
        return this._queue.length;
    }
    get isEmpty() {
        return this.size != null && this.size == 0;
    }
    get hasNext() {
        return !this.isEmpty;
    }
    _next() {
        if (this.isPaused)
            return;
        if (this.hasOverheat)
            return;
        if (this.isEmpty && this._currentlyExecuted === 0)
            return;
        if (this.isEmpty)
            return;
        const next = this._dequeue();
        if (next) {
            if (this._heat + next.options.heat > this._options.rateLimit)
                return;
            next.task();
        }
    }
    add(fn, opts) {
        return new Promise((resolve, reject) => {
            try {
                if (opts) {
                    if (opts.priority && opts.priority < 0)
                        throw new OptionNumberError(opts.priority, "AddElementOptions.priority");
                    if (opts.executionTimeout && opts.executionTimeout < 0)
                        throw new OptionNumberError(opts.executionTimeout, "AddElementOptions.executionTimeout");
                    if (opts.queueTimeout && opts.queueTimeout < 0)
                        throw new OptionNumberError(opts.queueTimeout, "AddElementOptions.timeout");
                }
                const options = Object.assign({
                    priority: 0,
                    executionTimeout: 0,
                    queueTimeout: 0,
                    heat: 0
                }, opts);
                let task;
                let queueTimeOutId = null;
                if (options.executionTimeout > 0) {
                    task = () => {
                        this._currentlyExecuted++;
                        this._heat += options.heat;
                        Promise.race([
                            fn(),
                            Queue._timeoutPromise(options.executionTimeout, new ExecutionTimeOutError(options.executionTimeout))
                        ]).then(val => {
                            if (queueTimeOutId)
                                clearTimeout(queueTimeOutId);
                            resolve(val);
                            this._currentlyExecuted--;
                        }).catch(err => {
                            if (queueTimeOutId)
                                clearTimeout(queueTimeOutId);
                            reject(err);
                            this._currentlyExecuted--;
                        });
                    };
                }
                else {
                    task = () => {
                        this._currentlyExecuted++;
                        this._heat += options.heat;
                        fn().then(val => {
                            if (queueTimeOutId)
                                clearTimeout(queueTimeOutId);
                            resolve(val);
                            this._currentlyExecuted--;
                        }).catch(err => {
                            if (queueTimeOutId)
                                clearTimeout(queueTimeOutId);
                            reject(err);
                            this._currentlyExecuted--;
                        });
                    };
                }
                const element = { task, options };
                if (options.queueTimeout > 0) {
                    queueTimeOutId = setTimeout(() => {
                        if (queueTimeOutId)
                            clearTimeout(queueTimeOutId);
                        this._delete(element);
                        reject(new QueueTimeOutError(options.queueTimeout));
                    }, options.queueTimeout);
                }
                this._enqueue(element);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    addAll(fns, opts) {
        return Promise.all(fns.map(fn => this.add(fn, opts)));
    }
    resume() {
        this._isPaused = false;
    }
    pause() {
        this._isPaused = true;
    }
    get hasOverheat() {
        return this._heat >= this._options.rateLimit;
    }
    get currentlyExecuted() {
        return this._currentlyExecuted;
    }
    get isPaused() {
        return this._isPaused;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map