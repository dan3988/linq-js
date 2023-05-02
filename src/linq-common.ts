import type { Linq } from "./linq-base.js";
import type { AsyncLinq } from "./linq-async.js";
import type * as util from "./util.js";

export interface Grouping<K, V> extends Iterable<V> {
	readonly key: K;
}

export type IterateCallback<TThis, T, V> = (this: TThis, result: IteratorResult<T>) => void | readonly [V];

export interface LinqFunction {
	readonly create: unique symbol;
	readonly prototype: LinqCommon;
	<T>(values: Iterable<T>): Linq<T>;
	<T>(values: AsyncIterable<T>): AsyncLinq<T>;

	isLinq(v: any): v is Linq<any>;
	isAsyncLinq(v: any): v is AsyncLinq<any>;

	empty<T = any>(): Linq<T>;
	range(start: number, count: number, step?: number): Linq<number>;
	repeat<T>(value: T, count: number): Linq<T>;
	fromObject(obj: object): Linq<[string, any]>;
	fromObject<V>(obj: object, select: util.BiSelect<string, any, V>): Linq<V>;
}

/**
 * Base type of {@link Linq} and {@link AsyncLinq}. Contains the definitions and JSDocs of functions that have the same parameter types.
 */
export interface LinqCommon<T = any> {
	[Linq.create](): this;

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
	 */
	firstOrDefault(query?: util.Predictate<T>): util.Awaitable<T | undefined>;
	/**
	 * Iterates this query, and returns the first matching item, or a default value if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @param def The value to return if no match is found
	 * @returns The first matching item in this query, or {@link def}
	 */
	firstOrDefault<V = undefined>(predictate: undefined | util.Predictate<T>, def: V): util.Awaitable<T | V>;

	/**
	 * Iterates this query, and returns the first matching item, or throws an error if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The first matching item in this query
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	last(predictate?: util.Predictate<T>): util.Awaitable<T>;
	/**
	 * Iterates this query, and returns the last matching item, or `undefined` one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The last matching item in this query, or undefined
	 */
	lastOrDefault(predictate?: util.Predictate<T>): util.Awaitable<T | undefined>;
	/**
	 * Iterates this query, and returns the last matching item, or a default value if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @param def The value to return if no match is found
	 * @returns The last matching item in this query, or {@link def}
	 */
	lastOrDefault<V = undefined>(predictate: undefined | util.Predictate<T>, def: V): util.Awaitable<T | V>;

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
	 * @returns The sum of this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	sum(): util.Awaitable<number>;
	/**
	 * Calculates the sum of this sequence.
	 * @query A property key that represents a number property in {@link T}
	 * @returns The sum of this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	sum(query: util.ValidKey<T, util.NumberLike>): util.Awaitable<number>;
	/**
	 * Calculates the sum of this sequence.
	 * @query A function that will convert {@link T} to a number.
	 * @returns The sum of this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	sum(query: util.Select<T, util.NumberLike>): util.Awaitable<number>;

	/**
	 * Finds the smallest value in this sequence
	 * @returns The smallest value in this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	min(): util.Awaitable<number>;
	/**
	 * Finds the smallest value in this sequence
	 * @query A property key that represents a number property in {@link T}
	 * @returns The smallest value in this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	min(query: util.ValidKey<T, util.NumberLike>): util.Awaitable<number>;
	/**
	 * Finds the smallest value in this sequence
	 * @query A function that will convert {@link T} to a number.
	 * @returns The smallest value in this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	min(query: util.Select<T, util.NumberLike>): util.Awaitable<number>;

	/**
	 * Finds the largest value in this sequence
	 * @returns The largest value in this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	max(): util.Awaitable<number>;
	/**
	 * Finds the largest value in this sequence
	 * @query A property key that represents a number property in {@link T}
	 * @returns The largest value in this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	max(query: util.ValidKey<T, util.NumberLike>): util.Awaitable<number>;
	/**
	 * Finds the smallest value in this sequence
	 * @query A function that will convert {@link T} to a number.
	 * @returns The largest value in this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	max(query: util.Select<T, util.NumberLike>): util.Awaitable<number>;

	average(): util.Awaitable<number>;
	average(query: util.ValidKey<T, util.NumberLike>): util.Awaitable<number>;
	average(query: util.Select<T, util.NumberLike>): util.Awaitable<number>;

	count(filter?: util.Predictate<T>): util.Awaitable<number>;

	/**
	 * Filter this sequence using a predictate function
	 * @param filter A function that tests each element in this sequence for a condition.
	 * @returns A new query that contains the elements that satisfy the condition.
	 */
	where(filter: util.Predictate<T>): LinqCommon<T>;
	/**
	 * Filter this sequence using a property key
	 * @param key The property key to test for each element.
	 * @returns A new query that contains the elements where the value of {@link key} resolves to a truthy value.
	 */
	where(key: keyof T): LinqCommon<T>;

	/**
	 * Transform each element of this collection by calling a function on each element
	 * @param query A function to apply to each element.
	 * @returns A new query that contains the transformed elements.
	 */
	select<V>(query: util.Select<T, V>): LinqCommon<V>;
	/**
	 * Transform each element of this collection by reading a property on each element
	 * @param key The property key to access on each element.
	 * @returns A new query that contains the transformed elements.
	 */
	select<K extends keyof T>(key: K): LinqCommon<T[K]>;
	/**
	 * Transform each element of this collection by copying a set of properties on each element to a new object.
	 * @param keys An array of property keys to access on each element.
	 * @returns A new query that contains the transformed elements.
	 */
	select<K extends readonly (keyof T)[]>(keys: K): LinqCommon<util.KeysToObject<T, K>>;
	/**
	 * Selects an iterable property on each element of this collection and returns a query containing the flattened results
	 * @param key The property key to access on each element.
	 * @returns A new query that contains the results.
	 */
	selectMany<K extends util.ValidKey<T, Iterable<any>>>(key: K): LinqCommon<T[K] extends Iterable<infer V> ? V : unknown>;
	/**
	 * Projects each element of this collection into an iterable and returns a flattened sequence
	 * @param query A function to apply to each element.
	 * @returns A new query that contains the results.
	 */
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

	/**
	 * Create a string using the elements in the sequence, separated by the specified separator string
	 * @param sep The string to insert between each element in the sequence (defaults to an empty string)
	 */
	joinText(sep?: string): util.Awaitable<string>;

	/**
	 * Skip a specified number of elements in the sequence
	 * @param count The amount of elements to skip
	 */
	skip(count: number): LinqCommon<T>;
	/**
	 * Return a sequence containing specified number of elements
	 * @param count The maximum amount of elements to include in the sequence
	 */
	take(count: number): LinqCommon<T>;

	aggregate<V>(initial: V, aggregate: util.BiSelect<V, T, V>): util.Awaitable<V>;

	/**
	 * Iterate this query and call a function with each result from the iterator.
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	iterate<V>(fn: IterateCallback<undefined, T, V>): util.Awaitable<V>;
	/**
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	iterate<E, V>(thisArg: E, fn: IterateCallback<E, T, V>): util.Awaitable<V>;

	/**
     * Iterate this query and call a function for each item.
	 * @param fn - A function that is called once for each item.
	 */
	forEach(fn: (item: T) => void | never[]): util.Awaitable<void>;
	/**
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item.
	 */
	forEach<E>(thisArg: E, fn: (this: E, item: T) => void | never[]): util.Awaitable<void>;
	/**
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	forEach<V>(fn: (item: T) => void | never[] | V[]): util.Awaitable<V | undefined>;
	/**
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
