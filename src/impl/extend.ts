import { AsyncLinq, Linq, LinqInternal } from "../linq-base.js";
import { compileQuery, isInstance, isType, Predictate, SelectType } from "../util.js";

/** @internal */
export const enum OperationType {
	Select,
	SelectMany,
	Filter
}

type Operation = readonly [type: OperationType, fn: (arg: any) => any];

type IteratorBase<T = any> = Iterator<T> | AsyncIterator<T>;
type StackItem<T, I extends IteratorBase<T>> = readonly [start: number, it: I];

function res(done: boolean, value?: any) {
	return { done, value };
}

type Result<V> = boolean | [V];

abstract class ExtendIteratorBase<I extends IteratorBase, R, V> {
	readonly #symbol: symbol;
	readonly #ops: readonly Operation[];
	readonly #stack: StackItem<any, I>[];
	#currentStart: number;
	#currentIt: I;
	#done: boolean;

	protected get __current() {
		return this.#currentIt;
	}

	constructor(symbol: symbol, it: I, ops: readonly Operation[]) {
		this.#symbol = symbol;
		this.#ops = ops;
		this.#stack = [];
		this.#currentStart = 0;
		this.#currentIt = it;
		this.#done = false;
	}
	
	protected abstract __execute(callback: (this: this, r: IteratorResult<V>) => Result<V>): R;
	protected abstract __done(): R;

	next(): R {
		if (this.#done) {
			return this.__done();
		} else {
			return this.__execute(this.#onNext);
		}
	}

	#onNext(v: IteratorResult<V>): Result<V> {
		let start = this.#currentStart;
		let it = this.#currentIt;

		if (v.done) {
			let next = this.#stack.pop();
			if (next == null) {
				this.#done = true;
				return true;
			}

			let [start, it] = next;
			this.#currentStart = start;
			this.#currentIt = it;
			return false;
		}
		
		let val: any = v.value;

		for (let i = start; i < this.#ops.length; i++) {
			let [type, fn] = this.#ops[i];
			let result = fn(val);
			if (type === OperationType.Select) {
				val = result;
				continue;
			} else if (type === OperationType.SelectMany) {
				const sym = this.#symbol;
				const fn = result[sym];

				if (typeof fn !== "function")
					throw new TypeError("Value does not implement " + sym.description);

				this.#stack.push([start, it]);
				this.#currentIt = it = fn.call(result);
				this.#currentStart = start = i + 1;
				return false;
			} else if (type === OperationType.Filter && result) {
				continue;
			}

			return false;
		}

		return [val];
	}
}


class ExtendIterator extends ExtendIteratorBase<Iterator<any>, IteratorResult<any>, any> implements IterableIterator<any> {
	constructor(it: Iterator<any>, ops: readonly Operation[]) {
		super(Symbol.iterator, it, ops);
	}

	protected __done(): IteratorResult<any, any> {
		return res(true);
	}

	protected __execute(callback: (r: IteratorResult<any, any>) => Result<any>): IteratorResult<any, any> {
		while (true) {
			let result = this.__current.next();
			let ret = callback.call(this, result);
			if (Array.isArray(ret)) {
				return res(false, ret[0]);
			} else if (ret) {
				return res(true);
			}
		}
	}

	[Symbol.iterator]() {
		return this;
	}
}

class AsyncExtendIterator<T> extends ExtendIteratorBase<AsyncIterator<T>, Promise<IteratorResult<T>>, T> implements AsyncIterableIterator<T> {
	constructor(it: AsyncIterator<T>, ops: readonly Operation[]) {
		super(Symbol.asyncIterator, it, ops);
	}

	protected __done() {
		return Promise.resolve(res(true));
	}
	
	protected async __execute(callback: (r: IteratorResult<T, any>) => Result<T>) {
		while (true) {
			let result = await this.__current.next();
			let ret = callback.call(this, result);
			if (Array.isArray(ret)) {
				return res(false, ret);
			} else if (ret) {
				return res(true);
			}
		}
	}

	[Symbol.asyncIterator]() {
		return this;
	}
}

abstract class ExtendBase<T> {
	abstract __extend(type: Operation[0], fn: Operation[1]): T;

	select(query: SelectType): T {
		const select = compileQuery(query, true);
		return this.__extend(OperationType.Select, select);
	}

	selectMany(query: SelectType): T {
		const select = compileQuery(query, true);
		return this.__extend(OperationType.SelectMany, select);
	}

	where(filter: Predictate): T {
		return this.__extend(OperationType.Filter, filter);
	}

	ofType(type: any): T {
		let func = typeof type === 'string' ? isType.bind(undefined, type) : isInstance.bind(undefined, type);
		return this.__extend(OperationType.Filter, func);
	}
}

/** @internal */
export class LinqExtend extends LinqInternal<any> implements ExtendBase<Linq> {
	readonly #source: LinqInternal;
	readonly #ops: Operation[];
	#useLength: boolean;

	get length(): number | undefined {
		return this.#useLength ? this.#source.length : undefined;
	}

	constructor(source: LinqInternal, type: Operation[0], fn: Operation[1]) {
		super();
		this.#source = source;
		this.#ops = [[type, fn]];
		this.#useLength = type === OperationType.Select;
	}

	__extend(type: Operation[0], fn: Operation[1]): LinqExtend {
		let linq = new LinqExtend(this.#source, type, fn);
		linq.#useLength &&= this.#useLength;
		linq.#ops.unshift(...this.#ops);
		return linq;
	}
	
	[Symbol.iterator](): IterableIterator<any> {
		const it = this.#source[Symbol.iterator]();
		return new ExtendIterator(it, this.#ops);
	}
}

/** @internal */
export class AsyncLinqExtend extends AsyncLinq<any> implements ExtendBase<AsyncLinq> {
	readonly #source: AsyncLinq;
	readonly #ops: Operation[];
	
	constructor(source: AsyncLinq, type: Operation[0], fn: Operation[1]) {
		super(source);
		this.#source = source;
		this.#ops = [[type, fn]];
	}

	__extend(type: Operation[0], fn: Operation[1]): AsyncLinqExtend {
		let linq = new AsyncLinqExtend(this.#source, type, fn);
		linq.#ops.unshift(...this.#ops);
		return linq;
	}
	
	[Symbol.asyncIterator](): AsyncIterableIterator<any> {
		const it = this.#source[Symbol.asyncIterator]();
		return new AsyncExtendIterator(it, this.#ops);
	}
}

let props = Object.getOwnPropertyDescriptors(ExtendBase.prototype);
Object.defineProperties(LinqExtend.prototype, props);
Object.defineProperties(AsyncLinqExtend.prototype, props);
