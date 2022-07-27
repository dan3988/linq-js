import type { Select, Predictate } from './funcs';
import { FilteringIterator, RangeIterator, SelectingIterator } from "./iterators.js";

export interface Linq<T = any> extends Iterable<T> {
	sum(): number;
	sum(query: Select<T, number | { [Symbol.toPrimitive](hint: "number"): number }>): number;
	count(): number;
	count(filter: Predictate<T>): number;
	any(): boolean;
	any(filter: Predictate<T>): boolean;
	where(filter: Predictate<T>): Linq<T>;
	select<V>(query: Select<T, V>): Linq<V>;
	select<K extends keyof T>(query: K): Linq<T[K]>;
	toArray(): T[];
	toSet(): Set<T>;
	toMap<K>(keySelector: Select<T, K>): Map<K, T>;
	toMap<K, V>(keySelector: Select<T, K>, valueSelector: Select<T, V>): Map<K, V>;
}

export interface LinqConstructor {
	readonly prototype: Linq;

	<T>(values: Iterable<T>): Linq<T>;

	range(start: number, count: number, step?: number): Linq<number>;
}

declare var LinqImpl: {
	readonly prototype: Linq;
	new(): Linq;
}

declare abstract class LinqBase<T = any> extends LinqImpl {
	get length(): number | undefined;
	abstract source(): Iterator<T>;

	predictate?(value: T): boolean;

	constructor();
};

let linq: LinqConstructor = <any>function Linq<T>(value: Iterable<T>): Linq<T> {
	if (new.target != null)
		return undefined!;

	if (value == null)
		throw new TypeError("'values' is undefined.");

	return Array.isArray(value) ? new LinqArray<T>(value) : new LinqIterable<T>(value);
}

linq.range = function(start, count, step?: number) {
	return new LinqRange(start, count, step);
}

export var Linq: LinqConstructor = linq;
export default Linq;

let linqBase: typeof LinqBase = <any>linq;

Object.defineProperty(linqBase, 'length', {
	configurable: true,
	value: null
})

linqBase.prototype.sum = function(query?: Select) {
	let sum = 0;
	for (let value of this) {
		let v = +(query ? query(value) : value);
		if (isNaN(v))
			return NaN;

		sum += v;
	}

	return sum;
}

linqBase.prototype.count = function(filter?: Predictate) {
	let len = this.length;
	if (len != null)
		return len;

	let i = 0;
	for (let value of this)
		if (filter == null || filter(value))
			i++;

	return i;
}

linqBase.prototype.any = function(filter?: Predictate) {
	let en = this[Symbol.iterator]();
	let result = en.next();
	if (filter == null)
		return !result.done;

	while (true) {
		if (filter(result.value))
			return true;

		if ((result = en.next()).done)
			return false;
	}
}

linqBase.prototype.where = function(filter: Predictate) {
	return new LinqFiltered(this, filter);
}

linqBase.prototype.select = function(query: Select) {
	if (typeof query != 'function')
		query = getter.bind(undefined, query);

	return new LinqSelect(this, query);
}

linqBase.prototype.toArray = function() {
	let array = [];
	for (let value of this)
		array.push(value);

	return array;
}

linqBase.prototype.toSet = function() {
	let set = new Set();
	for (let value of this)
		set.add(value);

	return set;
}

linqBase.prototype.toMap = function(keySelector: Select, valueSelector?: Select) {
	const map = new Map();
	for (const item of this) {
		const key = keySelector(item);
		const value = valueSelector ? valueSelector(item) : item;
		map.set(key, value);
	}

	return map;
}

linqBase.prototype[Symbol.iterator] = function() {
	let iter = this.source();
	return this.predictate == null ? iter : new FilteringIterator(iter, this, this.predictate);
}

function getter<T = any, K extends keyof T = any>(key: K, value: T): T[K];
function getter(key: string | symbol | number, value: any): any;
function getter(key: string | symbol | number, value: any): any {
	return value[key];
}

/** @internal */
export class LinqSelect<T, V> extends linqBase<V> {
	readonly #source: LinqBase<T>;
	readonly #select: Select<T, V>;

	constructor(iter: LinqBase<T>, select: Select<T, V>) {
		super();
		this.#source = iter;
		this.#select = select;
	}

	source(): Iterator<V> {
		return new SelectingIterator(this.#source[Symbol.iterator](), undefined, this.#select);
	}
}

/** @internal */
export class LinqFiltered<T> extends linqBase<T> {
	readonly #source: LinqBase<T>;
	readonly #predictate: Predictate<T>;

	constructor(source: LinqBase<T>, predictate: Predictate<T>) {
		super();
		this.#source = source;
		this.#predictate = predictate;
	}

	source(): Iterator<T> {
		return this.#source.source();
	}

	predictate(value: T): boolean {
		let base = this.#source.predictate;
		return (base == null || base.call(this.#source, value)) && this.#predictate(value);
	}
}

/** @internal */
export class LinqIterable<T> extends linqBase<T> {
	readonly #source: Iterable<T>;

	constructor(source: Iterable<T>) {
		super();
		this.#source = source;
	}

	source(): Iterator<T> {
		return this.#source[Symbol.iterator]();
	}
}

/** @internal */
export class LinqArray<T> extends linqBase<T> {
	readonly #source: readonly T[];

	get length(): number {
		return this.#source.length;
	}

	constructor(source: readonly T[]) {
		super();
		this.#source = source;
	}

	count() {
		return this.#source.length;
	}

	any() {
		return this.#source.length > 0;
	}

	toSet(): Set<T> {
		return new Set(this.#source);
	}

	source(): Iterator<T> {
		return this.#source[Symbol.iterator]();
	}
}

/** @internal */
export class LinqRange extends linqBase<number> {
	readonly #start: number;
	readonly #count: number;
	readonly #step: number;

	get length(): number | undefined {
		return this.#count;
	}

	constructor(start: number, count: number, step?: number) {
		super();
		this.#start = start;
		this.#count = count;
		this.#step = step ?? 1;
	}

	source(): Iterator<number, any, undefined> {
		return new RangeIterator(this.#start, this.#count, this.#step);
	}
}