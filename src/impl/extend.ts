import { AsyncLinq, Linq, LinqInternal } from "../linq-base.js";
import { getter, isInstance, isType, Predictate, SelectType } from "../util.js";

type Modifier = readonly [type: 'select' | 'selectMany' | 'filter', fn: (arg: any) => any];

function *loop(source: Iterable<any>, mods: readonly Modifier[], start: number): Generator<any> {
	for (const value of source) {
		let v: any = value;
		let accept = true;
		for (let i = start; i < mods.length; i++) {
			let [type, fn] = mods[i];
			let result = fn(v);
			if (type === 'select') {
				v = result;
				continue;
			} else if (type === 'selectMany') {
				for (let v of loop(result, mods, i + 1))
					yield v;
			} else if (type === 'filter' && result) {
				continue;
			}

			accept = false;
			break;
		}

		if (accept)
			yield v;
	}
}

async function *loopAsync(source: AsyncIterable<any>, mods: readonly Modifier[], start: number): AsyncGenerator<any> {
	for await (const value of source) {
		let v: any = value;
		let accept = true;
		for (let i = start; i < mods.length; i++) {
			let [type, fn] = mods[i];
			let result = fn(v);
			if (type === 'select') {
				v = result;
				continue;
			} else if (type === 'selectMany') {
				for (let v of loop(result, mods, i + 1))
					yield v;
			} else if (type === 'filter' && result) {
				continue;
			}

			accept = false;
			break;
		}

		if (accept)
			yield v;
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
		return loop(this.#source, this.#mods, 0);
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
		return loopAsync(this.#source, this.#mods, 0);
	}
}

let props = Object.getOwnPropertyDescriptors(ExtendBase.prototype);
Object.defineProperties(LinqExtend.prototype, props);
Object.defineProperties(AsyncLinqExtend.prototype, props);
