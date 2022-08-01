import { AsyncLinq, Linq, LinqInternal } from "../linq-base.js";
import { getter, isInstance, isType, Predictate, SelectType } from "../util.js";

type Modifier = readonly [type: 'select' | 'selectMany' | 'filter', fn: (arg: any) => any];

function res(done: boolean, value?: any) {
	return { done, value };
}

class ExtendIterator implements IterableIterator<any> {
	readonly #mods: readonly Modifier[];
	readonly #stack: any[];
	#currentStart: number;
	#currentIt: Iterator<any>;
	#done: boolean;

	constructor(it: Iterator<any>, mods: readonly Modifier[]) {
		this.#mods = mods;
		this.#stack = [];
		this.#currentStart = 0;
		this.#currentIt = it;
		this.#done = false;
	}

	next(): IteratorResult<any> {
		if (this.#done)
			return res(true);
		
		let stack = this.#stack;
		let mods = this.#mods;
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

			for (let i = start; i < mods.length; i++) {
				let [type, fn] = mods[i];
				let result = fn(val);
				if (type === 'select') {
					val = result;
					continue;
				} else if (type === 'selectMany') {
					stack.unshift(start, it);
					start = i + 1;
					it = result[Symbol.iterator]();
					accept = false;
					this.#currentIt = it;
					this.#currentStart = start;
					break;
				} else if (type === 'filter' && result) {
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
	readonly #mods: readonly Modifier[];
	readonly #stack: any[];
	#currentStart: number;
	#currentIt: AsyncIterator<any>;
	#done: boolean;

	constructor(it: AsyncIterator<any>, mods: readonly Modifier[]) {
		this.#mods = mods;
		this.#stack = [];
		this.#currentStart = 0;
		this.#currentIt = it;
		this.#done = false;
	}

	async next(): Promise<IteratorResult<any>> {
		if (this.#done)
			return res(true);
		
		let stack = this.#stack;
		let mods = this.#mods;
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

			for (let i = start; i < mods.length; i++) {
				let [type, fn] = mods[i];
				let result = fn(val);
				if (type === 'select') {
					val = result;
					continue;
				} else if (type === 'selectMany') {
					stack.unshift(start, it);
					start = i + 1;
					it = result[Symbol.iterator]();
					accept = false;
					this.#currentIt = it;
					this.#currentStart = start;
					break;
				} else if (type === 'filter' && result) {
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
	abstract __extend(type: Modifier[0], fn: Modifier[1]): T;

	select(query: SelectType): T {
		if (typeof query !== 'function')
			query = getter.bind(undefined, query);

		return this.__extend('select', query);
	}

	selectMany(query: SelectType): T {
		if (typeof query !== 'function')
			query = getter.bind(undefined, query);

		return this.__extend('selectMany', query);
	}

	where(filter: Predictate): T {
		return this.__extend('filter', filter);
	}

	ofType(type: any): T {
		let func = typeof type === 'string' ? isType.bind(undefined, type) : isInstance.bind(undefined, type);
		return this.__extend('filter', func);
	}
}

/** @internal */
export class LinqExtend extends LinqInternal<any> implements ExtendBase<Linq> {
	readonly #source: LinqInternal;
	readonly #mods: Modifier[];
	#useLength: boolean;

	get length(): number | undefined {
		return this.#useLength ? this.#source.length : undefined;
	}

	constructor(source: LinqInternal, type: Modifier[0], fn: Modifier[1]) {
		super();
		this.#source = source;
		this.#mods = [[type, fn]];
		this.#useLength = type === 'select';
	}

	__extend(type: Modifier[0], fn: Modifier[1]): LinqExtend {
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
	readonly #mods: Modifier[];
	
	constructor(source: AsyncLinq, type: Modifier[0], fn: Modifier[1]) {
		super(source);
		this.#source = source;
		this.#mods = [[type, fn]];
	}

	__extend(type: Modifier[0], fn: Modifier[1]): AsyncLinqExtend {
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
