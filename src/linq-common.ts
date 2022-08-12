import type { Awaitable, BiSelect, Comparer, Constructor, NumberLike, Predictate, Select, ValidKey } from "./util.js";

export interface Grouping<K, V> extends Iterable<V> {
	readonly key: K;
}

export interface IterateCallback<TThis, T, V> {
	(this: TThis, done: true, value: undefined): void | V[];
	(this: TThis, done: false, value: T): void | V[];
}

export interface LinqCommon<T = any> {
	first(query?: Predictate<T>): Awaitable<T>;
	firstOrDefault(query?: Predictate<T>): Awaitable<T | undefined>;

	last(query?: Predictate<T>): T;
	lastOrDefault(query?: Predictate<T>): Awaitable<T | undefined>;

	sum(): Awaitable<number>;
	sum(query: ValidKey<T, NumberLike>): Awaitable<number>;
	sum(query: Select<T, NumberLike>): Awaitable<number>;

	min(): Awaitable<number>;
	min(query: ValidKey<T, NumberLike>): Awaitable<number>;
	min(query: Select<T, NumberLike>): Awaitable<number>;

	max(): Awaitable<number>;
	max(query: ValidKey<T, NumberLike>): Awaitable<number>;
	max(query: Select<T, NumberLike>): Awaitable<number>;

	average(): Awaitable<number>;
	average(query: ValidKey<T, NumberLike>): Awaitable<number>;
	average(query: Select<T, NumberLike>): Awaitable<number>;

	count(filter?: Predictate<T>): Awaitable<number>;
	any(filter?: Predictate<T>): Awaitable<boolean>;

	where(filter: Predictate<T>): LinqCommon<T>;

	select<V>(query: Select<T, V>): LinqCommon<V>;
	select<K extends keyof T>(query: K): LinqCommon<T[K]>;
	selectMany<K extends ValidKey<T, Iterable<any>>>(query: K): LinqCommon<T[K] extends Iterable<infer V> ? V : unknown>;
	selectMany<V>(query: Select<T, Iterable<V>>): LinqCommon<V>;

	distinct(): LinqCommon<T>;

	order(comparer?: Comparer<T>): LinqCommon<T>;
	orderDesc(comparer?: Comparer<T>): LinqCommon<T>;

	orderBy<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): LinqCommon<T> & LinqCommonOrdered<T>;
	orderBy<V>(query: Select<T, V>, comparer?: Comparer<V>): LinqCommon<T> & LinqCommonOrdered<T>;

	orderByDesc<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): LinqCommon<T> & LinqCommonOrdered<T>;
	orderByDesc<V>(query: Select<T, V>, comparer?: Comparer<V>): LinqCommon<T> & LinqCommonOrdered<T>;

	groupBy<K extends keyof T>(query: K): LinqCommon<Grouping<T[K], T>>;
	groupBy<V>(query: Select<T, V>): LinqCommon<Grouping<V, T>>;

	toObject<K extends PropertyKey>(keySelector: Select<T, K>): Awaitable<Record<K, any>>;
	toObject<K extends PropertyKey, V>(keySelector: Select<T, K>, valueSelector: Select<T, V>): Awaitable<Record<K, V>>;
	toArray(): Awaitable<T[]>;
	toSet(): Awaitable<Set<T>>;
	toMap<K>(keySelector: Select<T, K>): Awaitable<Map<K, T>>;
	toMap<K, V>(keySelector: Select<T, K>, valueSelector: Select<T, V>): Awaitable<Map<K, V>>;
	toMap<K, V extends keyof T>(keySelector: Select<T, K>, valueSelector: V): Awaitable<Map<K, T[V]>>;
	toMap<K extends keyof T>(keySelector: K): Awaitable<Map<T[K], T>>;
	toMap<K extends keyof T, V>(keySelector: K, valueSelector: Select<T, V>): Awaitable<Map<T[K], V>>;
	toMap<K extends keyof T, V extends keyof T>(keySelector: K, valueSelector: V): Awaitable<Map<T[K], T[V]>>;

	ofType(type: 'string'): LinqCommon<string>;
	ofType(type: 'boolean'): LinqCommon<number>;
	ofType(type: 'number'): LinqCommon<number>;
	ofType(type: 'bigint'): LinqCommon<bigint>;
	ofType(type: 'symbol'): LinqCommon<symbol>;
	ofType(type: 'object'): LinqCommon<object>;
	ofType(type: 'function'): LinqCommon<Function>;
	ofType(type: 'undefined'): LinqCommon<undefined>;
	ofType<V>(type: Constructor<V>): LinqCommon<V>;

	concat<V>(...values: Iterable<V>[]): LinqCommon<T | V>;

	join(separator?: string): Awaitable<string>;

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

export interface LinqCommonOrdered<T = any> {
	thenBy<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): LinqCommon<T> & LinqCommonOrdered<T>;
	thenBy<V>(query: Select<T, V>, comparer?: Comparer<V>): LinqCommon<T> & LinqCommonOrdered<T>;

	thenByDesc<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): LinqCommon<T> & LinqCommonOrdered<T>;
	thenByDesc<V>(query: Select<T, V>, comparer?: Comparer<V>): LinqCommon<T> & LinqCommonOrdered<T>;
}
