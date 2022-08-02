import { AsyncLinq, Linq, LinqInternal } from "../linq-base.js";
import { getter, isInstance, isType, Predictate, SelectType } from "../util.js";

const enum OperationType {
	Select,
	SelectMany,
	Filter
}

type Operation = readonly [type: OperationType, fn: (arg: any) => any];

function res(done: boolean, value?: any) {
	return { done, value };
}

class ExtendIterator implements IterableIterator<any> {
	readonly #ops: readonly Operation[];
	readonly #stack: any[];
	#currentStart: number;
	#currentIt: Iterator<any>;
	#done: boolean;

	constructor(it: Iterator<any>, ops: readonly Operation[]) {
		this.#ops = ops;
		this.#stack = [];
		this.#currentStart = 0;
		this.#currentIt = it;
		this.#done = false;
	}

	next(): IteratorResult<any> {
		if (this.#done)
			return res(true);
		
		let stack = this.#stack;
		let ops = this.#ops;
		let start = this.#currentStart;
		let it = this.#currentIt;

		while (true) {
			let v = it.next();
			if (v.done) {
				if (stack.length === 0) {
					this.#done = true;
					return res(true);
				}

				[start, it] = stack.splice(0, 2);
				this.#currentStart = start;
				this.#currentIt = it;
				continue;
			}
			
			let val: any = v.value;
			let accept = true;

			for (let i = start; i < ops.length; i++) {
				let [type, fn] = ops[i];
				let result = fn(val);
				if (type === OperationType.Select) {
					val = result;
					continue;
				} else if (type === OperationType.SelectMany) {
					stack.unshift(start, it);
					start = i + 1;
					it = result[Symbol.iterator]();
					accept = false;
					this.#currentIt = it;
					this.#currentStart = start;
					break;
				} else if (type === OperationType.Filter && result) {
					continue;
				}

				accept = false;
				break;
			}

			if (accept)
				return res(false, val);
		}
	}

	[Symbol.iterator]() {
		return this;
	}
}

class AsyncExtendIterator implements AsyncIterableIterator<any> {
	readonly #ops: readonly Operation[];
	readonly #stack: any[];
	#currentStart: number;
	#currentIt: AsyncIterator<any>;
	#done: boolean;

	constructor(it: AsyncIterator<any>, ops: readonly Operation[]) {
		this.#ops = ops;
		this.#stack = [];
		this.#currentStart = 0;
		this.#currentIt = it;
		this.#done = false;
	}

	async next(): Promise<IteratorResult<any>> {
		if (this.#done)
			return res(true);
		
		let stack = this.#stack;
		let ops = this.#ops;
		let start = this.#currentStart;
		let it = this.#currentIt;

		while (true) {
			let v = await it.next();
			if (v.done) {
				if (stack.length === 0) {
					this.#done = true;
					return res(true);
				}

				[start, it] = stack.splice(0, 2);
				this.#currentStart = start;
				this.#currentIt = it;
				continue;
			}
			
			let val: any = v.value;
			let accept = true;

			for (let i = start; i < ops.length; i++) {
				let [type, fn] = ops[i];
				let result = fn(val);
				if (type === OperationType.Select) {
					val = result;
					continue;
				} else if (type === OperationType.SelectMany) {
					stack.unshift(start, it);
					start = i + 1;
					it = result[Symbol.iterator]();
					accept = false;
					this.#currentIt = it;
					this.#currentStart = start;
					break;
				} else if (type === OperationType.Filter && result) {
					continue;
				}

				accept = false;
				break;
			}

			if (accept)
				return res(false, val);
		}
	}

	[Symbol.asyncIterator]() {
		return this;
	}
}

abstract class ExtendBase<T> {
	abstract __extend(type: Operation[0], fn: Operation[1]): T;

	select(query: SelectType): T {
		if (typeof query !== 'function')
			query = getter.bind(undefined, query);

		return this.__extend(OperationType.Select, query);
	}

	selectMany(query: SelectType): T {
		if (typeof query !== 'function')
			query = getter.bind(undefined, query);

		return this.__extend(OperationType.SelectMany, query);
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
	readonly #mods: Operation[];
	#useLength: boolean;

	get length(): number | undefined {
		return this.#useLength ? this.#source.length : undefined;
	}

	constructor(source: LinqInternal, type: Operation[0], fn: Operation[1]) {
		super();
		this.#source = source;
		this.#mods = [[type, fn]];
		this.#useLength = type === OperationType.Select;
	}

	__extend(type: Operation[0], fn: Operation[1]): LinqExtend {
		let linq = new LinqExtend(this.#source, type, fn);
		linq.#useLength &&= this.#useLength;
		linq.#mods.unshift(...this.#mods);
		return linq;
	}
	
	[Symbol.iterator](): Iterator<any> {
		const it = this.#source[Symbol.iterator]();
		return new ExtendIterator(it, this.#mods);
	}
}

/** @internal */
export class AsyncLinqExtend extends AsyncLinq<any> implements ExtendBase<AsyncLinq> {
	readonly #source: AsyncLinq;
	readonly #mods: Operation[];
	
	constructor(source: AsyncLinq, type: Operation[0], fn: Operation[1]) {
		super(source);
		this.#source = source;
		this.#mods = [[type, fn]];
	}

	__extend(type: Operation[0], fn: Operation[1]): AsyncLinqExtend {
		let linq = new AsyncLinqExtend(this.#source, type, fn);
		linq.#mods.unshift(...this.#mods);
		return linq;
	}
	
	[Symbol.asyncIterator](): AsyncIterator<any> {
		const it = this.#source[Symbol.asyncIterator]();
		return new AsyncExtendIterator(it, this.#mods);
	}
}

let props = Object.getOwnPropertyDescriptors(ExtendBase.prototype);
Object.defineProperties(LinqExtend.prototype, props);
Object.defineProperties(AsyncLinqExtend.prototype, props);
