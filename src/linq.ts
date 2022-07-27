import type { Select, Predictate, Constructor, Comparer, BiSelect } from './funcs';
import { ConcatIterator, EmptyIterator, FilteringIterator, RangeIterator, ReverseIterator, SelectingIterator } from "./iterators.js";

type ValidKey<T, R> = keyof { [K in keyof T as T[K] extends R ? K : never]: any };
type NumberLike = number | { [Symbol.toPrimitive](hint: "number"): number };
type SelectType<T = any, R = any> = ValidKey<T, R> | Select<T, R>;

function getter<T = any, K extends keyof T = any>(key: K, value: T): T[K];
function getter(key: string | symbol | number, value: any): any;
function getter(key: string | symbol | number, value: any): any {
	return value[key];
}

function isType(type: string, value: any): boolean {
	return typeof value === type;
}

function isInstance(type: Function, value: any): boolean {
	return value instanceof type;
}

export interface Linq<T = any> extends Iterable<T> {
	sum(): number;
	sum(query: ValidKey<T, NumberLike>): number;
	sum(query: Select<T, NumberLike>): number;
	
	min(): number;
	min(query: ValidKey<T, NumberLike>): number;
	min(query: Select<T, NumberLike>): number;
	
	max(): number;
	max(query: ValidKey<T, NumberLike>): number;
	max(query: Select<T, NumberLike>): number;
	
	average(): number;
	average(query: ValidKey<T, NumberLike>): number;
	average(query: Select<T, NumberLike>): number;
	
	count(): number;
	count(filter: Predictate<T>): number;
	any(): boolean;
	any(filter: Predictate<T>): boolean;
	where(filter: Predictate<T>): Linq<T>;

	select<V>(query: Select<T, V>): Linq<V>;
	select<K extends keyof T>(query: K): Linq<T[K]>;
	selectMany<V, K extends ValidKey<T, Iterable<V>>>(query: K): Linq<V>;
	selectMany<V>(query: Select<T, Iterable<V>>): Linq<V>;

	order(comparer?: Comparer<T>): Linq<T>;
	orderDesc(comparer?: Comparer<T>): Linq<T>;

	orderBy<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): Linq<T>;
	orderBy<V>(query: Select<T, V>, comparer?: Comparer<V>): Linq<T>;

	orderByDesc<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): Linq<T>;
	orderByDesc<V>(query: Select<T, V>, comparer?: Comparer<V>): Linq<T>;

	toObject<K extends PropertyKey>(keySelector: Select<T, K>): Record<K, any>;
	toObject<K extends PropertyKey, V>(keySelector: Select<T, K>, valueSelector: Select<T, V>): Record<K, V>;
	toArray(): T[];
	toSet(): Set<T>;
	toMap<K>(keySelector: Select<T, K>): Map<K, T>;
	toMap<K, V>(keySelector: Select<T, K>, valueSelector: Select<T, V>): Map<K, V>;

	ofType(type: 'string'): Linq<string>;
	ofType(type: 'boolean'): Linq<number>;
	ofType(type: 'number'): Linq<number>;
	ofType(type: 'bigint'): Linq<bigint>;
	ofType(type: 'symbol'): Linq<symbol>;
	ofType(type: 'object'): Linq<object>;
	ofType(type: 'function'): Linq<Function>;
	ofType(type: 'undefined'): Linq<undefined>;
	ofType<T>(type: Constructor<T>): Linq<T>;

	concat<V>(...values: Iterable<V>[]): Linq<T | V>;
}

export interface LinqConstructor {
	readonly prototype: Linq;
	
	<T>(values: Iterable<T>): Linq<T>;

	empty<T = any>(): Linq<T>;
	range(start: number, count: number, step?: number): Linq<number>;
	fromObject(obj: object): Linq<[string, any]>;
	fromObject<V>(obj: object, select: BiSelect<string, any, V>): Linq<V>;
}

declare var LinqImpl: LinqConstructor & { new<T>(): Linq<T> };

declare abstract class LinqBase<T = any> extends LinqImpl<T> {
	get length(): number | undefined;
	abstract source(): Iterator<T>;

	predictate?(value: T): boolean;

	constructor();
};

let linq = function Linq<T>(value: Iterable<T>): LinqBase<T> {
	if (new.target != null)
		return undefined!;

	if (value == null)
		throw new TypeError("'values' is required.");

	if (Array.isArray(value))
		return new LinqArray<T>(value);

	if (value instanceof Map || value instanceof Set)
		return new LinqSet<T>(value);

	return new LinqIterable<T>(value);
}

let linqBase: typeof LinqBase = linq as any;

linqBase.empty = function() {
	return linq.prototype;
}

linqBase.range = function(start, count, step) {
	return new LinqRange(start, count, step);
}

linqBase.fromObject = function(obj: object, select?: BiSelect<string>) {
	let source = Object.entries(obj);
	let linq: LinqBase = new LinqArray(source);
	if (select != null)
		linq = new LinqSelect(linq, a => select.apply(undefined, a))
	
	return linq;
}

export var Linq: LinqConstructor = linq as any;
export default Linq;

Object.defineProperty(linqBase, 'length', {
	configurable: true,
	value: null
})

linqBase.prototype.source = function() {
	return EmptyIterator.INSTANCE;
}

linqBase.prototype[Symbol.iterator] = function() {
	let iter = this.source();
	return this.predictate == null ? iter : new FilteringIterator(iter, this, this.predictate);
}

function arithmetic(it: Iterable<any>, query: undefined | SelectType, index: false, initial: number, handle: (result: number, value: number) => number): number;
function arithmetic(it: Iterable<any>, query: undefined | SelectType, index: true, initial: number, handle: (result: number, value: number, index: number) => number): [result: number, count: number];
function arithmetic(it: Iterable<any>, query: undefined | SelectType, index: boolean, initial: number, handle: Function): number | [number, number] {
	if (query != null && typeof query !== 'function')
		query = getter.bind(undefined, query);

	if (index) {
		let i = 0;
		for (let value of it) {
			let v = +(query ? query(value) : value);
			if (isNaN(v))
				return [NaN, -1];
	
			initial = handle(initial, v, i++);
		}

		return [initial, i];
	} else {
		for (let value of it) {
			let v = +(query ? query(value) : value);
			if (isNaN(v))
				return NaN;
	
			initial = handle(initial, v);
		}

		return initial;
	}
}

linqBase.prototype.sum = function(query?: SelectType) {
	return arithmetic(this, query, false, 0, (a, b) => a + b);
}

linqBase.prototype.min = function(query?: SelectType) {
	return arithmetic(this, query, false, Infinity, (min, v) => min > v ? v : min);
}

linqBase.prototype.max = function(query?: SelectType) {
	return arithmetic(this, query, false, -Infinity, (max, v) => max < v ? v : max);
}

linqBase.prototype.average = function(query?: SelectType) {
	let [total, count] = arithmetic(this, query, true, 0, (a, b) => a + b);
	return total / count;
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

linqBase.prototype.select = function(query: SelectType) {
	if (typeof query != 'function')
		query = getter.bind(undefined, query);

	return new LinqSelect(this, query);
}

linqBase.prototype.selectMany = function(query: SelectType) {
	if (typeof query != 'function')
		query = getter.bind(undefined, query);

	return new LinqSelectMany(this, query);
}

function defaultCompare(x?: any, y?: any): number {
	x = String(x);
	y = String(y);
	return x.localeCompare(y);
}

linqBase.prototype.order = function(comp?: Comparer) {
	if (comp == null)
		comp = defaultCompare;

	return new LinqOrdered(this, false, comp);
}

linqBase.prototype.orderDesc = function(comp?: Comparer) {
	if (comp == null)
		comp = defaultCompare;

	return new LinqOrdered(this, true, comp);
}

function orderBy<T>(this: LinqBase<T>, query: SelectType, comp: Comparer | undefined, desc: boolean) {
	if (comp == null)
		comp = defaultCompare;

	const select = typeof query === 'function' ? query : getter.bind(undefined, query);

	return new LinqOrdered<T>(this, desc, (x, y) => {
		x = select(x);
		y = select(y);
		return comp!(x, y);
	});
}

linqBase.prototype.orderBy = function(query: SelectType, comp?: Comparer) {
	return orderBy.call(this, query, comp, false);
}

linqBase.prototype.orderByDesc = function(query: SelectType, comp?: Comparer) {
	return orderBy.call(this, query, comp, true);
}

linqBase.prototype.toObject = function(keySelector: Select, valueSelector?: Select) {
	const result: any = {};
	for (let item of this) {
		const key = keySelector(item);
		const value = valueSelector ? valueSelector(item) : item;
		result[key] = value;
	}

	return result;
}

linqBase.prototype.toArray = function() {
	let array = Array(this.length ?? 0);
	let i = 0;
	for (let value of this)
		array[i] = value;

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

linqBase.prototype.ofType = function(type: string | Function): Linq<any> {
	return new LinqFiltered(this, typeof type === 'string' ? isType.bind(undefined, type) : isInstance.bind(undefined, type));
}

linqBase.prototype.concat = function(...values) {
	values.unshift(this);
	return new LinqConcat<any>(values);
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
export class LinqSelectMany<T, V> extends linqBase<V> {
	readonly #source: LinqBase<T>;
	readonly #select: Select<T, Iterable<V>>;

	constructor(iter: LinqBase<T>, select: Select<T, Iterable<V>>) {
		super();
		this.#source = iter;
		this.#select = select;
	}

	source(): Iterator<V> {
		let it = new SelectingIterator(this.#source[Symbol.iterator](), undefined, this.#select);
		return new ConcatIterator(it);
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

	toArray(): T[] {
		return Array.from(this.#source)
	}

	toSet(): Set<T> {
		return new Set(this.#source);
	}

	source(): Iterator<T> {
		return this.#source[Symbol.iterator]();
	}
}

interface MapOrSet<T> extends Iterable<T> {
	readonly size: number;
}

export class LinqSet<T> extends linqBase<T> {
	readonly #source: MapOrSet<T>;

	get length(): number {
		return this.#source.size;
	}

	constructor(source: MapOrSet<T>) {
		super();
		this.#source = source;
	}

	count() {
		return this.#source.size;
	}

	any() {
		return this.#source.size > 0;
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

export class LinqConcat<T> extends linqBase<T> {
	readonly #values: Linq<T>[];
	readonly #length: number | undefined;

	get length(): number | undefined {
		return this.#length;
	}

	constructor(values: readonly Iterable<T>[]) {
		let l = 0;
		let v: Linq<T>[] = [];
		for (let value of values) {
			let lq: LinqBase<T> = value instanceof linqBase ? value : linq(value);
			l += lq.length ?? NaN;
			v.push(lq);
		}

		super();
		this.#values = v;
		this.#length = isNaN(l) ? undefined : l;
	}

	source(): Iterator<T, any, undefined> {
		return new ConcatIterator(this.#values[Symbol.iterator]());
	}
}

export class LinqOrdered<T> extends linqBase<T> {
	readonly #source: LinqBase<T>;
	readonly #desc: boolean;
	readonly #comp: undefined | Comparer<T>;

	get length(): number | undefined {
		return this.#source.length;
	}

	constructor(source: LinqBase<T>, desc: boolean, comp: undefined | Comparer<T>) {
		super();
		this.#source = source;
		this.#comp = comp;
		this.#desc = desc;
	}

	source(): Iterator<T> {
		let all = this.#source.toArray().sort(this.#comp);
		let it = this.#desc ? new ReverseIterator(all) : all;
		return it[Symbol.iterator]();
	}
}