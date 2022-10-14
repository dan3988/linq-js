import type * as util from "./util.js";

export interface Grouping<K, V> extends Iterable<V> {
	readonly key: K;
}

export interface IterateCallback<TThis, T, V> {
	(this: TThis, done: true, value: undefined): void | V[];
	(this: TThis, done: false, value: T): void | V[];
}

export interface LinqCommon<T = any> {
	/**
	 * Iterates this query, and returns the first matching item, or throws an error if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The first matching item in this query
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	first(predictate?: util.Predictate<T>): util.Awaitable<T>;
	/**
	 * Iterates this query, and returns the first matching item, or `undefined` one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The first matching item in this query, or undefined
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	firstOrDefault(query?: util.Predictate<T>): util.Awaitable<T | undefined>;

	/**
	 * Iterates this query, and returns the first matching item, or throws an error if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The first matching item in this query
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	last(predictate?: util.Predictate<T>): T;
	/**
	 * Iterates this query, and returns the last matching item, or `undefined` one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The last matching item in this query, or undefined
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	lastOrDefault(predictate?: util.Predictate<T>): util.Awaitable<T | undefined>;

	/**
	 * Iterates this query, and returns `true` if a single item is found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns `true` if an item exists in this query, otherwise `false`
	 */
	any(predictate?: util.Predictate<T>): util.Awaitable<boolean>;

	/**
	 * Iterates this query, and returns `true` if all items in this query match the predictate.
	 * @param predictate A function that will called on each element in the query until it returns `false`
	 * @returns `true` if all items in this query match the predictate, otherwise `false`
	 */
	all(predictate: util.Predictate<T>): util.Awaitable<boolean>;

	/**
	 * Calculates the sum of this sequence.
	 * @returns The sum of this sequence, or `NaN` if an item that cannot be converter to a number is present.
	 */
	sum(): util.Awaitable<number>;
	/**
	 * Calculates the sum of this sequence.
	 * @query A property key that represents a number property in {@link T}
	 * @returns The sum of this sequence, or `NaN` if an item that cannot be converter to a number is present.
	 */
	sum(query: util.ValidKey<T, util.NumberLike>): util.Awaitable<number>;
	/**
	 * Calculates the sum of this sequence.
	 * @query A function that will convert {@link T} to a number.
	 * @returns The sum of this sequence, or `NaN` if an item that cannot be converter to a number is present.
	 */
	sum(query: util.Select<T, util.NumberLike>): util.Awaitable<number>;

	/**
	 * Finds the smallest value in this sequence
	 * @returns The smallest value in this sequence, or `NaN` if an item that cannot be converter to a number is present.
	 */
	min(): util.Awaitable<number>;
	/**
	 * Finds the smallest value in this sequence
	 * @query A property key that represents a number property in {@link T}
	 * @returns The smallest value in this sequence, or `NaN` if an item that cannot be converter to a number is present.
	 */
	min(query: util.ValidKey<T, util.NumberLike>): util.Awaitable<number>;
	/**
	 * Finds the smallest value in this sequence
	 * @query A function that will convert {@link T} to a number.
	 * @returns The smallest value in this sequence, or `NaN` if an item that cannot be converter to a number is present.
	 */
	min(query: util.Select<T, util.NumberLike>): util.Awaitable<number>;

	/**
	 * Finds the largest value in this sequence
	 * @returns The largest value in this sequence, or `NaN` if an item that cannot be converter to a number is present.
	 */
	max(): util.Awaitable<number>;
	/**
	 * Finds the largest value in this sequence
	 * @query A property key that represents a number property in {@link T}
	 * @returns The largest value in this sequence, or `NaN` if an item that cannot be converter to a number is present.
	 */
	max(query: util.ValidKey<T, util.NumberLike>): util.Awaitable<number>;
	/**
	 * Finds the smallest value in this sequence
	 * @query A function that will convert {@link T} to a number.
	 * @returns The largest value in this sequence, or `NaN` if an item that cannot be converter to a number is present.
	 */
	max(query: util.Select<T, util.NumberLike>): util.Awaitable<number>;

	average(): util.Awaitable<number>;
	average(query: util.ValidKey<T, util.NumberLike>): util.Awaitable<number>;
	average(query: util.Select<T, util.NumberLike>): util.Awaitable<number>;

	count(filter?: util.Predictate<T>): util.Awaitable<number>;

	/**
	 * Filter this sequence using a predictate function
	 * @param filter A function that tests each element in this sequence for a condition.
	 * @returns A new query that contains the element that satisfy the condition.
	 */
	where(filter: util.Predictate<T>): LinqCommon<T>;

	select<V>(query: util.Select<T, V>): LinqCommon<V>;
	select<K extends keyof T>(query: K): LinqCommon<T[K]>;
	select<K extends (keyof T)[]>(keys: K): LinqCommon<util.KeysToObject<T, K>>;
	selectMany<K extends util.ValidKey<T, Iterable<any>>>(query: K): LinqCommon<T[K] extends Iterable<infer V> ? V : unknown>;
	selectMany<V>(query: util.Select<T, Iterable<V>>): LinqCommon<V>;

	distinct(): LinqCommon<T>;

	order(comparer?: util.Comparer<T>): LinqCommon<T>;
	orderDesc(comparer?: util.Comparer<T>): LinqCommon<T>;

	orderBy<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): LinqCommon<T> & LinqCommonOrdered<T>;
	orderBy<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): LinqCommon<T> & LinqCommonOrdered<T>;

	orderByDesc<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): LinqCommon<T> & LinqCommonOrdered<T>;
	orderByDesc<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): LinqCommon<T> & LinqCommonOrdered<T>;

	groupBy<K extends keyof T>(query: K): LinqCommon<Grouping<T[K], T>>;
	groupBy<V>(query: util.Select<T, V>): LinqCommon<Grouping<V, T>>;

	toObject<K extends PropertyKey>(keySelector: util.Select<T, K>): util.Awaitable<Record<K, any>>;
	toObject<K extends PropertyKey, V>(keySelector: util.Select<T, K>, valueSelector: util.Select<T, V>): util.Awaitable<Record<K, V>>;
	toArray(): util.Awaitable<T[]>;
	toSet(): util.Awaitable<Set<T>>;
	toMap<K>(keySelector: util.Select<T, K>): util.Awaitable<Map<K, T>>;
	toMap<K, V>(keySelector: util.Select<T, K>, valueSelector: util.Select<T, V>): util.Awaitable<Map<K, V>>;
	toMap<K, V extends keyof T>(keySelector: util.Select<T, K>, valueSelector: V): util.Awaitable<Map<K, T[V]>>;
	toMap<K extends keyof T>(keySelector: K): util.Awaitable<Map<T[K], T>>;
	toMap<K extends keyof T, V>(keySelector: K, valueSelector: util.Select<T, V>): util.Awaitable<Map<T[K], V>>;
	toMap<K extends keyof T, V extends keyof T>(keySelector: K, valueSelector: V): util.Awaitable<Map<T[K], T[V]>>;

	ofType(type: 'string'): LinqCommon<string>;
	ofType(type: 'boolean'): LinqCommon<number>;
	ofType(type: 'number'): LinqCommon<number>;
	ofType(type: 'bigint'): LinqCommon<bigint>;
	ofType(type: 'symbol'): LinqCommon<symbol>;
	ofType(type: 'object'): LinqCommon<object>;
	ofType(type: 'function'): LinqCommon<Function>;
	ofType(type: 'undefined'): LinqCommon<undefined>;
	ofType<V>(type: util.Constructor<V>): LinqCommon<V>;

	join(separator?: string): util.Awaitable<string>;

	aggregate<V>(initial: V, aggregate: util.BiSelect<V, T, V>): util.Awaitable<V>;

	/**
	 * Iterate this query and call a function with each result from the iterator.
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @returns The result from {@link fn}, if any.
	 */
	iterate<V>(fn: IterateCallback<undefined, T, V>): util.Awaitable<V | undefined>;
	/**
	 * Iterate this query and call a function with each result from the iterator.
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	iterate<E, V>(thisArg: E, fn: IterateCallback<E, T, V>): util.Awaitable<V | undefined>;

	/**
     * Iterate this query and call a function for each item.
	 * @param fn - A function that is called once for each item.
	 */
	forEach(fn: (item: T) => void | never[]): util.Awaitable<void>;
	/**
     * Iterate this query and call a function for each item.
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item.
	 */
	forEach<E>(thisArg: E, fn: (this: E, item: T) => void | never[]): util.Awaitable<void>;
	/**
     * Iterate this query and call a function for each item.
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	forEach<V>(fn: (item: T) => void | never[] | V[]): util.Awaitable<V | undefined>;
	/**
     * Iterate this query and call a function for each item.
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	forEach<E, V>(thisArg: E, fn: (this: E, item: T) => void | never[] | V[]): util.Awaitable<V | undefined>;
}

export interface LinqCommonOrdered<T = any> {
	thenBy<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): LinqCommon<T> & LinqCommonOrdered<T>;
	thenBy<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): LinqCommon<T> & LinqCommonOrdered<T>;

	thenByDesc<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): LinqCommon<T> & LinqCommonOrdered<T>;
	thenByDesc<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): LinqCommon<T> & LinqCommonOrdered<T>;
}
