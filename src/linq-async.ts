import type { LinqCommon, Grouping, IterateCallback, LinqCommonOrdered, LinqFunction } from "./linq-common.js";
import type * as util from "./util.js";

export interface AsyncLinqConstructor extends LinqFunction {
	readonly prototype: AsyncLinq;
	new<T>(value: AsyncIterable<T>): AsyncLinq<T>;
}

export interface AsyncLinq<T = any> extends AsyncIterable<T>, LinqCommon<T> {
	first(query?: util.Predictate<T>): Promise<T>;
	firstOrDefault(query?: util.Predictate<T>): Promise<T | undefined>;

	last(query?: util.Predictate<T>): T;
	lastOrDefault(query?: util.Predictate<T>): Promise<T | undefined>;

	any(predictate?: util.Predictate<T>): Promise<boolean>;
	all(predictate?: util.Predictate<T>): Promise<boolean>;

	sum(): Promise<number>;
	sum(query: util.ValidKey<T, util.NumberLike>): Promise<number>;
	sum(query: util.Select<T, util.NumberLike>): Promise<number>;

	min(): Promise<number>;
	min(query: util.ValidKey<T, util.NumberLike>): Promise<number>;
	min(query: util.Select<T, util.NumberLike>): Promise<number>;

	max(): Promise<number>;
	max(query: util.ValidKey<T, util.NumberLike>): Promise<number>;
	max(query: util.Select<T, util.NumberLike>): Promise<number>;

	average(): Promise<number>;
	average(query: util.ValidKey<T, util.NumberLike>): Promise<number>;
	average(query: util.Select<T, util.NumberLike>): Promise<number>;

	count(filter?: util.Predictate<T>): Promise<number>;

	where(filter: util.Predictate<T>): AsyncLinq<T>;

	zip<V, R>(other: AsyncIterable<V>, selector: util.BiSelect<T, V, R>): AsyncLinq<R>;

	select<V>(query: util.Select<T, V>): AsyncLinq<V>;
	select<K extends keyof T>(query: K): AsyncLinq<T[K]>;
	select<K extends (keyof T)[]>(keys: K): LinqCommon<util.KeysToObject<T, K>>;
	selectMany<K extends util.ValidKey<T, Iterable<any>>>(query: K): AsyncLinq<T[K] extends Iterable<infer V> ? V : unknown>;
	selectMany<V>(query: util.Select<T, Iterable<V>>): AsyncLinq<V>;

	distinct(): AsyncLinq<T>;

	order(comparer?: util.Comparer<T>): AsyncLinq<T>;
	orderDesc(comparer?: util.Comparer<T>): AsyncLinq<T>;

	orderBy<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): AsyncLinqOrdered<T>;
	orderBy<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): AsyncLinqOrdered<T>;

	orderByDesc<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): AsyncLinqOrdered<T>;
	orderByDesc<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): AsyncLinqOrdered<T>;

	groupBy<K extends keyof T>(query: K): AsyncLinq<Grouping<T[K], T>>;
	groupBy<V>(query: util.Select<T, V>): AsyncLinq<Grouping<V, T>>;

	toObject<K extends PropertyKey>(keySelector: util.Select<T, K>): Promise<Record<K, any>>;
	toObject<K extends PropertyKey, V>(keySelector: util.Select<T, K>, valueSelector: util.Select<T, V>): Promise<Record<K, V>>;
	toArray(): Promise<T[]>;
	toSet(): Promise<Set<T>>;
	toMap<K>(keySelector: util.Select<T, K>): Promise<Map<K, T>>;
	toMap<K, V>(keySelector: util.Select<T, K>, valueSelector: util.Select<T, V>): Promise<Map<K, V>>;
	toMap<K, V extends keyof T>(keySelector: util.Select<T, K>, valueSelector: V): Promise<Map<K, T[V]>>;
	toMap<K extends keyof T>(keySelector: K): Promise<Map<T[K], T>>;
	toMap<K extends keyof T, V>(keySelector: K, valueSelector: util.Select<T, V>): Promise<Map<T[K], V>>;
	toMap<K extends keyof T, V extends keyof T>(keySelector: K, valueSelector: V): Promise<Map<T[K], T[V]>>;

	ofType(type: 'string'): AsyncLinq<string>;
	ofType(type: 'boolean'): AsyncLinq<number>;
	ofType(type: 'number'): AsyncLinq<number>;
	ofType(type: 'bigint'): AsyncLinq<bigint>;
	ofType(type: 'symbol'): AsyncLinq<symbol>;
	ofType(type: 'object'): AsyncLinq<object>;
	ofType(type: 'function'): AsyncLinq<Function>;
	ofType(type: 'undefined'): AsyncLinq<undefined>;
	ofType<V>(type: util.Constructor<V>): AsyncLinq<V>;

	concat<V>(...values: AsyncIterable<V>[]): AsyncLinq<T | V>;

	join<V, K>(other: AsyncLinq<V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>): AsyncLinq<[outer: T, inner: V]>;
	join<V, K, R>(other: AsyncLinq<V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>, resultSelector: util.Fn<[outer: T, inner: V], R>): AsyncLinq<R>;

	aggregate<V>(initial: V, aggregate: util.BiSelect<V, T, V>): Promise<V>;

	iterate<V>(fn: IterateCallback<undefined, T, V>): Promise<V | undefined>;
	iterate<E, V>(thisArg: E, fn: IterateCallback<E, T, V>): Promise<V | undefined>;

	forEach(fn: (item: T) => void | never[]): Promise<void>;
	forEach<E>(thisArg: E, fn: (this: E, item: T) => void | never[]): Promise<void>;
	forEach<V>(fn: (item: T) => void | never[] | V[]): Promise<V | undefined>;
	forEach<E, V>(thisArg: E, fn: (this: E, item: T) => void | never[] | V[]): Promise<V | undefined>;
}

export interface AsyncLinqOrdered<T> extends AsyncLinq<T>, LinqCommonOrdered<T> {
	thenBy<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): AsyncLinqOrdered<T>;
	thenBy<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): AsyncLinqOrdered<T>;

	thenByDesc<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): AsyncLinqOrdered<T>;
	thenByDesc<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): AsyncLinqOrdered<T>;
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