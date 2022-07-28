import type { BiSelect, Comparer, Constructor, Predictate, Select, NumberLike, ValidKey } from "./util.js";

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
	toMap<K, V extends keyof T>(keySelector: Select<T, K>, valueSelector: V): Map<K, T[V]>;
	toMap<K extends keyof T>(keySelector: K): Map<T[K], T>;
	toMap<K extends keyof T, V>(keySelector: K, valueSelector: Select<T, V>): Map<T[K], V>;
	toMap<K extends keyof T, V extends keyof T>(keySelector: K, valueSelector: V): Map<T[K], T[V]>;

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

	forEach(fn: (item: T) => void): void;
	forEach<V>(thisArg: V, fn: (this: V, item: T) => void): void;
}

export interface AsyncLinq<T = any> extends AsyncIterable<T> {
	first(query?: Predictate<T>): Promise<T>;
	firstOrDefault(query?: Predictate<T>): Promise<T | undefined>;

	last(query?: Predictate<T>): T;
	lastOrDefault(query?: Predictate<T>): Promise<T | undefined>;

	sum(): Promise<number>;
	sum(query: ValidKey<T, NumberLike>): Promise<number>;
	sum(query: Select<T, NumberLike>): Promise<number>;

	min(): Promise<number>;
	min(query: ValidKey<T, NumberLike>): Promise<number>;
	min(query: Select<T, NumberLike>): Promise<number>;

	max(): Promise<number>;
	max(query: ValidKey<T, NumberLike>): Promise<number>;
	max(query: Select<T, NumberLike>): Promise<number>;

	average(): Promise<number>;
	average(query: ValidKey<T, NumberLike>): Promise<number>;
	average(query: Select<T, NumberLike>): Promise<number>;
	
	count(filter?: Predictate<T>): Promise<number>;
	any(filter?: Predictate<T>): Promise<boolean>;

	where(filter: Predictate<T>): AsyncLinq<T>;

	select<V>(query: Select<T, V>): AsyncLinq<V>;
	select<K extends keyof T>(query: K): AsyncLinq<T[K]>;
	selectMany<K extends ValidKey<T, Iterable<any>>>(query: K): AsyncLinq<T[K] extends Iterable<infer V> ? V : unknown>;
	selectMany<V>(query: Select<T, Iterable<V>>): AsyncLinq<V>;

	order(comparer?: Comparer<T>): AsyncLinq<T>;
	orderDesc(comparer?: Comparer<T>): AsyncLinq<T>;

	orderBy<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): AsyncLinq<T>;
	orderBy<V>(query: Select<T, V>, comparer?: Comparer<V>): AsyncLinq<T>;

	orderByDesc<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): AsyncLinq<T>;
	orderByDesc<V>(query: Select<T, V>, comparer?: Comparer<V>): AsyncLinq<T>;

	toObject<K extends PropertyKey>(keySelector: Select<T, K>): Promise<Record<K, any>>;
	toObject<K extends PropertyKey, V>(keySelector: Select<T, K>, valueSelector: Select<T, V>): Promise<Record<K, V>>;
	toArray(): Promise<T[]>;
	toSet(): Promise<Set<T>>;
	toMap<K>(keySelector: Select<T, K>): Promise<Map<K, T>>;
	toMap<K, V>(keySelector: Select<T, K>, valueSelector: Select<T, V>): Promise<Map<K, V>>;
	toMap<K, V extends keyof T>(keySelector: Select<T, K>, valueSelector: V): Promise<Map<K, T[V]>>;
	toMap<K extends keyof T>(keySelector: K): Promise<Map<T[K], T>>;
	toMap<K extends keyof T, V>(keySelector: K, valueSelector: Select<T, V>): Promise<Map<T[K], V>>;
	toMap<K extends keyof T, V extends keyof T>(keySelector: K, valueSelector: V): Promise<Map<T[K], T[V]>>;

	ofType(type: 'string'): AsyncLinq<string>;
	ofType(type: 'boolean'): AsyncLinq<number>;
	ofType(type: 'number'): AsyncLinq<number>;
	ofType(type: 'bigint'): AsyncLinq<bigint>;
	ofType(type: 'symbol'): AsyncLinq<symbol>;
	ofType(type: 'object'): AsyncLinq<object>;
	ofType(type: 'function'): AsyncLinq<Function>;
	ofType(type: 'undefined'): AsyncLinq<undefined>;
	ofType<V>(type: Constructor<V>): AsyncLinq<V>;

	concat<V>(...values: Iterable<V>[]): AsyncLinq<T | V>;

	join(separator?: string): Promise<string>;

	forEach(fn: (item: T) => void): Promise<void>;
	forEach<V>(thisArg: V, fn: (this: V, item: T) => void): Promise<void>;
}

export interface AsyncLinqConstructor {
	readonly prototype: AsyncLinq;
	new<T>(value: AsyncIterable<T>): AsyncLinq<T>;
}

export var AsyncLinq: AsyncLinqConstructor = <any>class AsyncLinq<T> {
	readonly #source: AsyncIterable<T>;

	constructor(source: AsyncIterable<T>) {
		this.#source = source;
	}

	[Symbol.asyncIterator]() {
		return this.#source[Symbol.asyncIterator]();
	}
}

export interface LinqConstructor {
	readonly prototype: Linq;
	<T>(values: Iterable<T>): Linq<T>;
	<T>(values: AsyncIterable<T>): AsyncLinq<T>;

	empty<T = any>(): Linq<T>;
	range(start: number, count: number, step?: number): Linq<number>;
	repeat<T>(value: T, count: number): Linq<T>;
	fromObject(obj: object): Linq<[string, any]>;
	fromObject<V>(obj: object, select: BiSelect<string, any, V>): Linq<V>;
}

/** @internal */
export interface LinqInternal<T = any> extends Linq<T> {
	get length(): number | undefined;
	source(): Iterator<T>;
	predictate?(value: T): boolean;
}

interface LinqInternalConstructor {
	readonly prototype: LinqInternal;
	<T>(values: Iterable<T>): LinqInternal<T>;
	new<T>(): LinqInternal<T>;
}

/** @internal */
export interface Factory {
	(value: any): any;
}

const factories: Factory[] = [];

/** @internal */
export function addFactory(factory: Factory): void {
	factories.unshift(factory);
}

addFactory((v) => new LinqIterable(v));

let linq: LinqConstructor = <any>function Linq<T>(value: Iterable<T>): LinqInternal<T> {
	if (new.target != null)
		return undefined!;

	if (value == null)
		throw new TypeError("'values' is required.");

	for (let factory of factories) {
		let v = factory(value);
		if (v != null)
			return v;
	}
	
	throw new TypeError('Cannot convert ' + value + ' to a Linq object.');
}

/** @internal */
export var LinqInternal: LinqInternalConstructor = <any>linq;

export var Linq: LinqConstructor = linq as any;
export default Linq;

class LinqIterable<T> extends LinqInternal<T> {
	readonly #source: Iterable<T>;

	constructor(source: Iterable<T>) {
		super();
		this.#source = source;
	}

	source(): Iterator<T> {
		return this.#source[Symbol.iterator]();
	}
}
