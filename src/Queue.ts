import {isNumber} from "util";
import Timer = NodeJS.Timer;

function lowerBound<T>(array : Array<T>, value : T, comp : (a : T, b : T) => number) {
    let first = 0;
    let count = array.length;

    while (count > 0) {
        const step = (count / 2) | 0;
        let it = first + step;

        if (comp(array[it], value) <= 0) {
            first = ++it;
            count -= step + 1;
        } else
            count = step;

    }

    return first;
}

export type Task = () => void;
export type VoidFn = () => void;


export interface QueueOptions {
    parallel?: number,
    autoStart?: boolean,
    onEmpty?: VoidFn;
    onIdle?: VoidFn;
    rateLimit? : number,
    rateTime? : number,
    minRateDelay? : number,
    maxRateDelay? : number,
    maxExecutions? : number
}

interface QueueOptionsNotNull extends QueueOptions{
    parallel: number,
    autoStart: boolean,
    onEmpty: VoidFn;
    onIdle: VoidFn;
    rateLimit : number,
    rateTime : number,
    minRateDelay : number,
    maxRateDelay : number
    maxExecutions : number
}

export interface AddElementOptions {
    priority?: number,
    queueTimeout?: number,
    executionTimeout?: number,
    heat? : number
}

export interface QueueElementOptions extends AddElementOptions{
    priority: number,
    queueTimeout: number,
    executionTimeout : number,
    heat : number
}

export interface QueueElement{
    options : QueueElementOptions
    task: Task,
}

class OptionNumberError extends TypeError{
    constructor(value, name : String){
        super(`Expected \`${name}\` to be a number from 1 and up, got \`${value}\` (${typeof value})`);
    }
}

class ExecutionTimeOutError extends Error{
    constructor(time : number){
        super("ExecutionTimeout reached: " + time + " ms");
    }
}

class QueueTimeOutError extends Error{
    constructor(time : number){
        super("QueueTimeout reached: " + time + " ms");
    }
}


class Middleware {

    use(fn) {
        this.go = (stack => next => stack(fn.bind(this, next.bind(this))))(this.go);
    }

    go = next => next();
}

export class Queue {

    private _currentlyExecuted : number = 0;

    private _isPaused : boolean;
    private _queue : Array<QueueElement> = [];

    private _timeout : Timer | null = null;

    private _heat : number = 0;
    private _lastHeatReset : number = Date.now();
    private _lastExecutionCycle : number = Date.now();

    private readonly _options : QueueOptionsNotNull;

    constructor(opts? : QueueOptions) {

        if(!opts) opts = {};

        const options : QueueOptionsNotNull = Object.assign({
            parallel : 1,
            autoStart: true,
            onEmpty: () => {},
            onIdle: () => {},
            rateLimit : 100,
            rateTime : 1000 * 60,
            minRateDelay : 10,
            maxRateDelay : 600,
            maxExecutions : 5
        }, opts);

        if (!(isNumber(options.parallel) && options.parallel >= 1))
            throw new OptionNumberError(options.parallel, "QueueOptions.parallel");

        if(options.parallel > options.rateLimit)
            throw SyntaxError("You can't perform more PARALLEL_EXECUTIONS, then your RATE_LIMIT allows!");


        this._options = options;
        this._isPaused = !options.autoStart;


        setInterval(() => {
            this._heat = 0;
            this._lastHeatReset = Date.now();
        }, this._options.rateTime);

        this._startAutoRateExecution();
    }

    private _startAutoRateExecution(){
        this._timeout = setTimeout(() => {
            this._startAutoRateExecution();

            if(this.isEmpty || this.hasOverheat || this.isPaused) return;

            let executions = this._options.parallel;
            if(this._currentlyExecuted + this._options.parallel > this._options.maxExecutions)
                executions -= (this._currentlyExecuted + this._options.parallel) - this._options.maxExecutions;

            for(let x = 0; x < executions; x++){
                this._next();
            }

        }, this._calculateTimeoutTime())
    }

    private _calculateTimeoutTime() : number{
        return this._options.rateTime / (this._options.rateLimit / this._options.parallel)
    }

    private static _timeoutPromise<ReturnType, T extends Error>(time : number, err : T){
        return new Promise<ReturnType>((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                reject(err)
            }, time)
        })
    }

    private _enqueue(element : QueueElement) : void{

        if(this.isEmpty && this._currentlyExecuted == 0 && !this.hasOverheat && !this._isPaused){
            element.task();
            return;
        }

        if(this.isEmpty || element.options.priority == 0){
            this._queue.push(element);
        } else if (this._queue[this.size - 1].options.priority >= element.options.priority) {
            this._queue.push(element);
        } else {
            const index = lowerBound(this._queue, element, (a, b) => b.options.priority - a.options.priority);
            this._queue.splice(index, 0, element);
        }
    }

    private _delete(element : QueueElement) : void{
        this._queue.splice(this._queue.indexOf(element))
    }

    private _dequeue() : QueueElement | undefined {
        return this._queue.shift();
    }

    get size() : number {
        return this._queue.length;
    }

    get isEmpty() : Boolean{
        return this.size != null && this.size == 0
    }

    get hasNext() : Boolean{
        return !this.isEmpty
    }

    private _next(){

        if (this.isPaused) return;
        if(this.hasOverheat)return;
        if (this.isEmpty && this._currentlyExecuted === 0) return;
        if (this.isEmpty)return;

        const next = this._dequeue();
        if(next){
            if(this._heat + next.options.heat > this._options.rateLimit) return;
            next.task();
        }
    }


    add<ReturnType>(fn: () => Promise<ReturnType> , opts? : AddElementOptions) {
        return new Promise<ReturnType>((resolve, reject) => {
            try{
                if(opts){
                    if(opts.priority && opts.priority < 0 ) throw new OptionNumberError(opts.priority, "AddElementOptions.priority");
                    if(opts.executionTimeout && opts.executionTimeout < 0) throw new OptionNumberError(opts.executionTimeout, "AddElementOptions.executionTimeout");
                    if(opts.queueTimeout && opts.queueTimeout < 0) throw new OptionNumberError(opts.queueTimeout, "AddElementOptions.timeout");
                }

                const options : QueueElementOptions = Object.assign({
                    priority: 0,
                    executionTimeout : 0,
                    queueTimeout : 0,
                    heat : 0
                }, opts);

                let task : Task;

                let queueTimeOutId : Timer | null = null;

                if(options.executionTimeout > 0){
                    task = () => {
                        this._currentlyExecuted++;
                        this._heat += options.heat;

                        Promise.race([
                            fn(),
                            Queue._timeoutPromise<ReturnType, ExecutionTimeOutError>(options.executionTimeout, new ExecutionTimeOutError(options.executionTimeout))
                        ]).then(val => {
                            if(queueTimeOutId) clearTimeout(queueTimeOutId);
                            resolve(val);
                            this._currentlyExecuted--;
                        }).catch( err => {
                            if(queueTimeOutId) clearTimeout(queueTimeOutId);
                            reject(err);
                            this._currentlyExecuted--;
                        });
                    };
                } else {
                    task = () => {
                        this._currentlyExecuted++;
                        this._heat += options.heat;

                        fn().then(
                            val => {
                                if(queueTimeOutId) clearTimeout(queueTimeOutId);
                                resolve(val);
                                this._currentlyExecuted--;
                            }).catch( err => {
                                if(queueTimeOutId) clearTimeout(queueTimeOutId);
                                reject(err);
                                this._currentlyExecuted--;
                            });
                    };
                }

                const element : QueueElement = {task, options};

                if(options.queueTimeout > 0){
                    queueTimeOutId = setTimeout(() => {
                        if(queueTimeOutId) clearTimeout(queueTimeOutId);
                        this._delete(element);
                        reject(new QueueTimeOutError(options.queueTimeout))
                    }, options.queueTimeout)
                }

                this._enqueue(element);
            } catch(err){
                reject(err)
            }
        });
    }

    addAll(fns, opts : AddElementOptions) {
        return Promise.all(fns.map(fn => this.add(fn, opts)));
    }

    resume() {
        this._isPaused = false;
    }

    pause() {
        this._isPaused = true;
    }

    get hasOverheat() : Boolean{
        return this._heat >= this._options.rateLimit
    }

    get currentlyExecuted() {
        return this._currentlyExecuted;
    }

    get isPaused() {
        return this._isPaused;
    }
}