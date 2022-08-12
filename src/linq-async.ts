import type { LinqCommon } from "./index.js";
import type { Grouping, IterateCallback, LinqCommonOrdered } from "./linq-common.js";
import type { BiSelect, Comparer, Constructor, Predictate, Select, NumberLike, ValidKey } from "./util.js";

export interface AsyncLinqConstructor {
	readonly prototype: AsyncLinq;
	new<T>(value: AsyncIterable<T>): AsyncLinq<T>;
}

export interface AsyncLinq<T = any> extends AsyncIterable<T>, LinqCommon<T> {
	first(query?: Predictate<T>): Promise<T>;
	firstOrDefault(query?: Predictate<T>): Promise<T | undefined>;

	last(query?: Predictate<T>): T;
	lastOrDefault(query?: Predictate<T>): Promise<T | undefined>;

	any(predictate?: Predictate<T>): Promise<boolean>;
	all(predictate?: Predictate<T>): Promise<boolean>;

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

	where(filter: Predictate<T>): AsyncLinq<T>;

	zip<V, R>(other: AsyncIterable<V>, selector: BiSelect<T, V, R>): AsyncLinq<R>;

	select<V>(query: Select<T, V>): AsyncLinq<V>;
	select<K extends keyof T>(query: K): AsyncLinq<T[K]>;
	selectMany<K extends ValidKey<T, Iterable<any>>>(query: K): AsyncLinq<T[K] extends Iterable<infer V> ? V : unknown>;
	selectMany<V>(query: Select<T, Iterable<V>>): AsyncLinq<V>;

	distinct(): AsyncLinq<T>;

	order(comparer?: Comparer<T>): AsyncLinq<T>;
	orderDesc(comparer?: Comparer<T>): AsyncLinq<T>;

	orderBy<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): AsyncLinqOrdered<T>;
	orderBy<V>(query: Select<T, V>, comparer?: Comparer<V>): AsyncLinqOrdered<T>;

	orderByDesc<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): AsyncLinqOrdered<T>;
	orderByDesc<V>(query: Select<T, V>, comparer?: Comparer<V>): AsyncLinqOrdered<T>;

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

export interface AsyncLinqOrdered<T> extends AsyncLinq<T>, LinqCommonOrdered<T> {
	thenBy<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): AsyncLinqOrdered<T>;
	thenBy<V>(query: Select<T, V>, comparer?: Comparer<V>): AsyncLinqOrdered<T>;

	thenByDesc<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): AsyncLinqOrdered<T>;
	thenByDesc<V>(query: Select<T, V>, comparer?: Comparer<V>): AsyncLinqOrdered<T>;
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