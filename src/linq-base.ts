import type { BiSelect, Comparer, Constructor, Predictate, Select, NumberLike, ValidKey, Awaitable } from "./util.js";

export interface Grouping<K, V> extends Iterable<V> {
	readonly key: K;
}

export interface Linq<T = any> extends Iterable<T>, LinqCommon<T> {
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

	zip<V, R>(other: Iterable<V>, selector: BiSelect<T, V, R>): Linq<R>;

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

	groupBy<K extends keyof T>(query: K): Linq<Grouping<T[K], T>>;
	groupBy<V>(query: Select<T, V>): Linq<Grouping<V, T>>;

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

	aggregate<V>(initial: V, aggregate: BiSelect<V, T, V>): V;

	iterate<V>(fn: IterateCallback<undefined, T, V>): V | undefined;
	iterate<E, V>(thisArg: E, fn: IterateCallback<E, T, V>): V | undefined;

	forEach(fn: (item: T) => void | never[]): void;
	forEach<E>(thisArg: E, fn: (this: E, item: T) => void | never[]): void;
	forEach<V>(fn: (item: T) => void | never[] | V[]): V | undefined;
	forEach<E, V>(thisArg: E, fn: (this: E, item: T) => void | never[] | V[]): V | undefined;
}

export interface AsyncLinq<T = any> extends AsyncIterable<T>, LinqCommon<T> {
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

	zip<V, R>(other: AsyncIterable<V>, selector: BiSelect<T, V, R>): AsyncLinq<R>;

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

	groupBy<K extends keyof T>(query: K): AsyncLinq<Grouping<T[K], T>>;
	groupBy<V>(query: Select<T, V>): AsyncLinq<Grouping<V, T>>;

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

	aggregate<V>(initial: V, aggregate: BiSelect<V, T, V>): Promise<V>;

	iterate<V>(fn: IterateCallback<undefined, T, V>): Promise<V | undefined>;
	iterate<E, V>(thisArg: E, fn: IterateCallback<E, T, V>): Promise<V | undefined>;

	forEach(fn: (item: T) => void | never[]): Promise<void>;
	forEach<E>(thisArg: E, fn: (this: E, item: T) => void | never[]): Promise<void>;
	forEach<V>(fn: (item: T) => void | never[] | V[]): Promise<V | undefined>;
	forEach<E, V>(thisArg: E, fn: (this: E, item: T) => void | never[] | V[]): Promise<V | undefined>;
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

interface IterateCallback<TThis, T, V> {
	(this: TThis, done: true, value: undefined): void | V[];
	(this: TThis, done: false, value: T): void | V[];
}

/** @internal */
export interface LinqCommon<T> {
	aggregate<V>(initial: V, aggregate: BiSelect<V, T, V>): Awaitable<V>;

	/**
	 * Iterate this query and call a function with each result from the iterator.
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @returns The result from {@link fn}, if any.
	 */
	iterate<V>(fn: IterateCallback<undefined, T, V>): Awaitable<V | undefined>;
	/**
	 * Iterate this query and call a function with each result from the iterator.
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	iterate<E, V>(thisArg: E, fn: IterateCallback<E, T, V>): Awaitable<V | undefined>;

	/**
     * Iterate this query and call a function for each item.
	 * @param fn - A function that is called once for each item.
	 */
	forEach(fn: (item: T) => void | never[]): Awaitable<void>;
	/**
     * Iterate this query and call a function for each item.
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item.
	 */
	forEach<E>(thisArg: E, fn: (this: E, item: T) => void | never[]): Awaitable<void>;
	/**
     * Iterate this query and call a function for each item.
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	forEach<V>(fn: (item: T) => void | never[] | V[]): Awaitable<V | undefined>;
	/**
     * Iterate this query and call a function for each item.
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	forEach<E, V>(thisArg: E, fn: (this: E, item: T) => void | never[] | V[]): Awaitable<V | undefined>;
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
}

interface LinqInternalConstructor {
	readonly prototype: LinqInternal;
	<T>(values: Iterable<T>): LinqInternal<T>;
	<T>(values: AsyncIterable<T>): AsyncLinq<T>;
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

addFactory(v => Symbol.iterator in v ? new LinqIterable(v as any) : undefined);

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

	[Symbol.iterator]() {
		return this.#source[Symbol.iterator]();
	}
}
