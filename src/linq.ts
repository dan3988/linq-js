import type { BiSelect, Comparer, Constructor, Predictate, Select } from './funcs.js';
import * as it from "./iterators.js";

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

function errNoElements() {
	return new TypeError("Sequence contains no elements");
}

export interface Linq<T = any> extends Iterable<T> {
	first(query?: Predictate<T>): T;
	firstOrDefault(query?: Predictate<T>): T | undefined;

	last(query?: Predictate<T>): T;
	lastOrDefault(query?: Predictate<T>): T | undefined;

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
	
	count(filter?: Predictate<T>): number;
	any(filter?: Predictate<T>): boolean;

	where(filter: Predictate<T>): Linq<T>;

	select<V>(query: Select<T, V>): Linq<V>;
	select<K extends keyof T>(query: K): Linq<T[K]>;
	selectMany<K extends ValidKey<T, Iterable<any>>>(query: K): Linq<T[K] extends Iterable<infer V> ? V : unknown>;
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
	ofType<V>(type: Constructor<V>): Linq<V>;

	concat<V>(...values: Iterable<V>[]): Linq<T | V>;

	join(separator?: string): string;
}

export interface LinqConstructor {
	readonly prototype: Linq;
	<T>(values: Iterable<T>): Linq<T>;

	empty<T = any>(): Linq<T>;
	range(start: number, count: number, step?: number): Linq<number>;
	repeat<T>(value: T, count: number): Linq<T>;
	fromObject(obj: object): Linq<[string, any]>;
	fromObject<V>(obj: object, select: BiSelect<string, any, V>): Linq<V>;
}

interface LinqInternal<T = any> extends Linq<T> {
	get length(): number | undefined;
	source(): Iterator<T>;
	predictate?(value: T): boolean;
}

interface LinqInternalConstructor {
	readonly prototype: LinqInternal;
	<T>(values: Iterable<T>): LinqInternal<T>;
	new<T>(): LinqInternal<T>;
}

let linq: Partial<LinqConstructor> = <any>function Linq<T>(value: Iterable<T>): LinqInternal<T> {
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

linq.empty = function<T>() {
	return <LinqInternal<T>>LinqInternal.prototype;
}

linq.range = function(start, count, step) {
	return new LinqRange(start, count, step);
}

linq.repeat = function(value, count) {
	return new LinqRepeat(value, count);
}

linq.fromObject = function(obj: object, select?: BiSelect<string>) {
	let source = Object.entries(obj);
	let linq: LinqInternal = new LinqArray(source);
	if (select != null)
		linq = new LinqSelect(linq, a => select.apply(undefined, a))

	return linq;
}

let LinqInternal: LinqInternalConstructor = <any>linq;

export var Linq: LinqConstructor = linq as any;
export default Linq;

Object.defineProperty(LinqInternal, 'length', {
	configurable: true,
	value: null
})

LinqInternal.prototype.source = function() {
	return it.EmptyIterator.INSTANCE;
}

LinqInternal.prototype[Symbol.iterator] = function() {
	let iter = this.source();
	return this.predictate == null ? iter : new it.FilteringIterator(iter, this, this.predictate);
}

function first<T>(linq: Linq<T>, query: undefined | Predictate<T>, required: true): T;
function first<T>(linq: Linq<T>, query: undefined | Predictate<T>, required: false): T | undefined;
function first(linq: Linq, query: undefined | SelectType, required: boolean) {
	let iter = linq[Symbol.iterator]();
	let { done, value } = iter.next();
	if (!done) {
		if (query == null)
			return value;
		
		if (typeof query !== 'function')
			query = getter.bind(undefined, query);

		do {
			if (query(value))
				return value;

			({ done, value } = iter.next());
		} while (!done);
	}

	if (!required)
		return undefined;

	throw errNoElements();
}

function last<T>(linq: Linq<T>, query: undefined | Predictate<T>, required: true): T;
function last<T>(linq: Linq<T>, query: undefined | Predictate<T>, required: false): T | undefined;
function last(linq: Linq, query: undefined | SelectType, required: boolean) {
	let iter = linq[Symbol.iterator]();
	let { done, value } = iter.next();
	if (!done) {
		if (query == null) {
			for (let last = value; ; last = value) {
				({ done, value } = iter.next());
				if (done)
					return last;
			}
		} else {
			if (typeof query !== 'function')
				query = getter.bind(undefined, query);

			let any = false;
			let last = undefined;
	
			while (true) {
				({ done, value } = iter.next());
				if (done)
					break;

				if (query(value)) {
					last = value;
					any = true;
				}
			}

			if (any)
				return last;
		}
	}

	if (!required)
		return undefined;

	throw errNoElements();
}

LinqInternal.prototype.first = function(query?: Predictate) {
	return first(this, query, true);
}

LinqInternal.prototype.firstOrDefault = function(query?: Predictate) {
	return first(this, query, false);
}

LinqInternal.prototype.last = function(query?: Predictate) {
	return last(this, query, true);
}

LinqInternal.prototype.lastOrDefault = function(query?: Predictate) {
	return last(this, query, false);
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

LinqInternal.prototype.sum = function(query?: SelectType) {
	return arithmetic(this, query, false, 0, (a, b) => a + b);
}

LinqInternal.prototype.min = function(query?: SelectType) {
	return arithmetic(this, query, false, Infinity, (min, v) => min > v ? v : min);
}

LinqInternal.prototype.max = function(query?: SelectType) {
	return arithmetic(this, query, false, -Infinity, (max, v) => max < v ? v : max);
}

LinqInternal.prototype.average = function(query?: SelectType) {
	let [total, count] = arithmetic(this, query, true, 0, (a, b) => a + b);
	if (count === 0)
		throw errNoElements();

	return total / count;
}

LinqInternal.prototype.count = function(filter?: Predictate) {
	let len = this.length;
	if (len != null)
		return len;

	let i = 0;
	for (let value of this)
		if (filter == null || filter(value))
			i++;

	return i;
}

LinqInternal.prototype.any = function(filter?: Predictate) {
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

LinqInternal.prototype.where = function(filter: Predictate) {
	return new LinqFiltered(this, filter);
}

LinqInternal.prototype.select = function(query: SelectType) {
	if (typeof query != 'function')
		query = getter.bind(undefined, query);

	return new LinqSelect(this, query);
}

LinqInternal.prototype.selectMany = function(query: SelectType) {
	if (typeof query != 'function')
		query = getter.bind(undefined, query);

	return new LinqSelectMany(this, query);
}

function defaultCompare(x?: any, y?: any): number {
	x = String(x);
	y = String(y);
	return x.localeCompare(y);
}

LinqInternal.prototype.order = function(comp?: Comparer) {
	if (comp == null)
		comp = defaultCompare;

	return new LinqOrdered(this, false, comp);
}

LinqInternal.prototype.orderDesc = function(comp?: Comparer) {
	if (comp == null)
		comp = defaultCompare;

	return new LinqOrdered(this, true, comp);
}

function orderBy<T>(this: LinqInternal<T>, query: SelectType, comp: Comparer | undefined, desc: boolean) {
	if (comp == null)
		comp = defaultCompare;

	const select = typeof query === 'function' ? query : getter.bind(undefined, query);

	return new LinqOrdered<T>(this, desc, (x, y) => {
		x = select(x);
		y = select(y);
		return comp!(x, y);
	});
}

LinqInternal.prototype.orderBy = function(query: SelectType, comp?: Comparer) {
	return orderBy.call(this, query, comp, false);
}

LinqInternal.prototype.orderByDesc = function(query: SelectType, comp?: Comparer) {
	return orderBy.call(this, query, comp, true);
}

LinqInternal.prototype.toObject = function(keySelector: Select, valueSelector?: Select) {
	const result: any = {};
	for (let item of this) {
		const key = keySelector(item);
		const value = valueSelector ? valueSelector(item) : item;
		result[key] = value;
	}

	return result;
}

LinqInternal.prototype.toArray = function() {
	let array = Array(this.length ?? 0);
	let i = 0;
	for (let value of this)
		array[i++] = value;

	return array;
}

LinqInternal.prototype.toSet = function() {
	let set = new Set();
	for (let value of this)
		set.add(value);

	return set;
}

LinqInternal.prototype.toMap = function(keySelector: Select, valueSelector?: Select) {
	const map = new Map();
	for (const item of this) {
		const key = keySelector(item);
		const value = valueSelector ? valueSelector(item) : item;
		map.set(key, value);
	}

	return map;
}

LinqInternal.prototype.ofType = function(type: string | Function): Linq<any> {
	return new LinqFiltered(this, typeof type === 'string' ? isType.bind(undefined, type) : isInstance.bind(undefined, type));
}

LinqInternal.prototype.concat = function(...values) {
	values.unshift(this);
	return new LinqConcat<any>(values);
}

LinqInternal.prototype.join = function(sep) {
	return this.toArray().join(sep);
}

/** @internal */
export class LinqSelect<T, V> extends LinqInternal<V> {
	readonly #source: LinqInternal<T>;
	readonly #select: Select<T, V>;

	get length(): number | undefined {
		return this.#source.length;
	}

	constructor(iter: LinqInternal<T>, select: Select<T, V>) {
		super();
		this.#source = iter;
		this.#select = select;
	}

	source(): Iterator<V> {
		return new it.SelectingIterator(this.#source, undefined, this.#select);
	}
}

/** @internal */
export class LinqSelectMany<T, V> extends LinqInternal<V> {
	readonly #source: LinqInternal<T>;
	readonly #select: Select<T, Iterable<V>>;

	constructor(iter: LinqInternal<T>, select: Select<T, Iterable<V>>) {
		super();
		this.#source = iter;
		this.#select = select;
	}

	source(): Iterator<V> {
		let select = new it.SelectingIterator(this.#source, undefined, this.#select);
		return new it.ConcatIterator(select);
	}
}

/** @internal */
export class LinqFiltered<T> extends LinqInternal<T> {
	readonly #source: LinqInternal<T>;
	readonly #predictate: Predictate<T>;

	constructor(source: LinqInternal<T>, predictate: Predictate<T>) {
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
export class LinqIterable<T> extends LinqInternal<T> {
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
export class LinqArray<T> extends LinqInternal<T> {
	readonly #source: readonly T[];

	get length(): number {
		return this.#source.length;
	}

	constructor(source: readonly T[]) {
		super();
		this.#source = source;
	}

	first(query?: Predictate<T> | undefined): T {
		let array = this.#source;
		if (array.length === 0)
			throw errNoElements();

		if (query == null)
			return array[0];

		let i = 0;
		while(true) {
			let v = array[i];
			if (query(v))
				return v;

			if (++i === array.length)
				throw errNoElements();
		}
	}

	last(query?: Predictate<T> | undefined): T {
		let array = this.#source;
		if (array.length === 0)
			throw errNoElements();

		let i = array.length - 1;
		if (query == null)
			return array[i];

		while(true) {
			let v = array[i];
			if (query(v))
				return v;

			if (--i === -1)
				throw errNoElements();
		}
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

/** @internal */
export class LinqSet<T> extends LinqInternal<T> {
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
export class LinqRange extends LinqInternal<number> {
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

	min(query?: SelectType): number {
		if (this.#count === 0)
			return Infinity;

		let v = this.#start;
		if (query == null)
			return v;

		if (typeof query !== 'function')
			query = getter.bind(undefined, query);

		let min = Infinity;
		for (let i = 0; i < this.#count; i++, v += this.#step) {
			let val = query(v);
			if (min > val)
				min = val;
		}
		
		return min;
	}

	max(query?: SelectType): number {
		if (this.#count === 0)
			return -Infinity;

		let v = this.#start;
		if (query == null)
			return v;

		if (typeof query !== 'function')
			query = getter.bind(undefined, query);

		let max = -Infinity;
		for (let i = 0; i < this.#count; i++, v += this.#step) {
			let val = query(v);
			if (max < val)
				max = val;
		}
		
		return max;
	}

	first(query?: Predictate<number>) {
		let v = this.firstOrDefault(query);
		if (v == null)
			throw errNoElements();

		return v;
	}

	firstOrDefault(query?: Predictate<number>) {
		if (this.#count === 0)
			throw errNoElements();

		let v = this.#start;
		if (query == null)
			return v;

		for (let i = 0; i < this.#count; i++, v += this.#step)
			if (query(v))
				return v;

		return undefined;
	}

	last(query?: Predictate<number>) {
		let v = this.lastOrDefault(query);
		if (v == null)
			throw errNoElements();

		return v;
	}

	lastOrDefault(query?: Predictate<number>) {
		if (this.#count === 0)
			throw errNoElements();

		let v = this.#start + (this.#count * this.#step);
		if (query == null)
			return v;

		for (let i = 0; i < this.#count; i++, v -= this.#step)
			if (query(v))
				return v;

		return undefined;
	}

	source(): Iterator<number, any, undefined> {
		return new it.RangeIterator(this.#start, this.#count, this.#step);
	}
}

/** @internal */
export class LinqRepeat<T> extends LinqInternal<T> {
	readonly #value: T;
	readonly #count: number;

	get length(): number | undefined {
		return this.#count;
	}

	constructor(value: T, count: number) {
		super();
		this.#value = value;
		this.#count = count;
	}

	#getAny(required: true, query?: Predictate<T>): T
	#getAny(required: false, query?: Predictate<T>): T | undefined;
	#getAny(required: boolean, query?: Predictate<T>) {
		if (this.#count !== 0 && (query == null || query(this.#value)))
			return this.#value;

		if (!required)
			return undefined;

		throw errNoElements();
	}

	/**
	 * Because there is only one value, min(), max() and average() will all return the same value
	 * @param noVal the value to return if count is zero
	 */
	#getMinMaxAvg<V>(noVal: V, query?: SelectType<T, NumberLike>): number | V {
		if (this.#count === 0)
			return noVal;

		let val: any = this.#value;
		if (query != null)
			val = typeof query === 'function' ? query(val) : val[query];

		return +val;
	}
	
	max(query?: SelectType<T, NumberLike>) {
		return this.#getMinMaxAvg(-Infinity, query);
	}
	
	min(query?: SelectType<T, NumberLike>) {
		return this.#getMinMaxAvg(Infinity, query);
	}

	average(query?: SelectType<T, NumberLike>) {
		let v = this.#getMinMaxAvg(undefined, query);
		if (v === undefined)
			throw errNoElements();

		return v;
	}

	first(query?: Predictate<T>): T {
		return this.#getAny(true, query);
	}

	firstOrDefault(query?: Predictate<T>) {
		return this.#getAny(false, query);
	}

	last(query?: Predictate<T>) {
		return this.#getAny(true, query);
	}

	lastOrDefault(query?: Predictate<T>) {
		return this.#getAny(false, query);
	}

	toArray(): T[] {
		return Array(this.#count).fill(this.#value);
	}

	toObject(keySelector: Select, valueSelector?: Select) {
		let key = keySelector(this.#value);
		let value = valueSelector == null ? this.#value : valueSelector(this.#value);
		return { [key]: value };
	}

	toMap(keySelector: Select, valueSelector?: Select) {
		let key = keySelector(this.#value);
		let value = valueSelector == null ? this.#value : valueSelector(this.#value);
		return new Map().set(key, value)
	}

	toSet(): Set<T> {
		return new Set([this.#value]);
	}

	source(): Iterator<T> {
		return new it.RepeatIterator(this.#value, this.#count);
	}
}

/** @internal */
export class LinqConcat<T> extends LinqInternal<T> {
	readonly #values: Linq<T>[];
	readonly #length: number | undefined;

	get length(): number | undefined {
		return this.#length;
	}

	constructor(values: readonly Iterable<T>[]) {
		let l = 0;
		let v: Linq<T>[] = [];
		for (let value of values) {
			let lq: LinqInternal<T> = value instanceof LinqInternal ? value : LinqInternal(value);
			l += lq.length ?? NaN;
			v.push(lq);
		}

		super();
		this.#values = v;
		this.#length = isNaN(l) ? undefined : l;
	}

	source(): Iterator<T, any, undefined> {
		return new it.ConcatIterator(this.#values[Symbol.iterator]());
	}
}

/** @internal */
export class LinqOrdered<T> extends LinqInternal<T> {
	readonly #source: LinqInternal<T>;
	readonly #desc: boolean;
	readonly #comp: undefined | Comparer<T>;

	get length(): number | undefined {
		return this.#source.length;
	}

	constructor(source: LinqInternal<T>, desc: boolean, comp: undefined | Comparer<T>) {
		super();
		this.#source = source;
		this.#comp = comp;
		this.#desc = desc;
	}

	source(): Iterator<T> {
		let all = this.#source.toArray().sort(this.#comp);
		let iterator = this.#desc ? new it.ReverseIterator(all) : all;
		return iterator[Symbol.iterator]();
	}
}