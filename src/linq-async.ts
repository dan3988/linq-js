import type { LinqCommon, Grouping, IterateCallback, LinqCommonOrdered, LinqFunction } from "./linq-common.js";
import type * as util from "./util.js";

export interface AsyncLinqConstructor extends LinqFunction {
	readonly prototype: AsyncLinq;
	new<T>(value: AsyncIterable<T>): AsyncLinq<T>;
}

export interface AsyncLinq<T = any> extends AsyncIterable<T>, LinqCommon<T> {
	[Symbol.asyncIterator](): AsyncIterableIterator<T>;

	first(predictate?: util.Predictate<T>): Promise<T>;
	/**
	 * Iterates this query, and returns the first matching item, or `undefined` one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The first matching item in this query, or undefined
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	firstOrDefault(query?: util.Predictate<T>): Promise<T | undefined>;
	/**
	 * Iterates this query, and returns the first matching item, or a default value if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @param def The value to return if no match is found
	 * @returns The first matching item in this query, or {@link def}
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	firstOrDefault<V = undefined>(predictate: undefined | util.Predictate<T>, def: V): Promise<T | V>;

	last(predictate?: util.Predictate<T>): Promise<T>;
	/**
	 * Iterates this query, and returns the last matching item, or `undefined` one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The last matching item in this query, or undefined
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	lastOrDefault(predictate?: util.Predictate<T>): Promise<T | undefined>;
	/**
	 * Iterates this query, and returns the last matching item, or a default value if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @param def The value to return if no match is found
	 * @returns The last matching item in this query, or {@link def}
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	lastOrDefault<V = undefined>(predictate: undefined | util.Predictate<T>, def: V): Promise<T | V>;

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

	/**
	 * @param filter A function that tests each element in this sequence for a condition.
	 * @returns A new query that contains the elements that satisfy the condition.
	 */
	where(filter: util.Predictate<T>): AsyncLinq<T>;
	/**
	 * @param key The property key to test for each element.
	 * @returns A new query that contains the elements where the value of {@link key} resolves to a truthy value.
	 */
	where(key: keyof T): AsyncLinq<T>;

	zip<V, R>(other: AsyncIterable<V>, selector: util.BiSelect<T, V, R>): AsyncLinq<R>;

	/**
	 * Transform each element of this collection by calling a function on each element
	 * @param query A function to apply to each element.
	 * @returns A new query that contains the transformed elements.
	 */
	select<V>(query: util.Select<T, V>): AsyncLinq<V>;
	/**
	 * Transform each element of this collection by reading a property on each element
	 * @param key The property key to access on each element.
	 * @returns A new query that contains the transformed elements.
	 */
	select<K extends keyof T>(key: K): AsyncLinq<T[K]>;
	/**
	 * Transform each element of this collection by copying a set of properties on each element to a new object.
	 * @param keys An array of property keys to access on each element.
	 * @returns A new query that contains the transformed elements.
	 */
	select<K extends readonly (keyof T)[]>(keys: K): AsyncLinq<util.KeysToObject<T, K>>;
	/**
	 * Selects an iterable property on each element of this collection and returns a query containing the flattened results
	 * @param key The property key to access on each element.
	 * @returns A new query that contains the results.
	 */
	selectMany<K extends util.ValidKey<T, Iterable<any>>>(key: K): AsyncLinq<T[K] extends Iterable<infer V> ? V : unknown>;
	/**
	 * Projects each element of this collection into an iterable and returns a flattened sequence
	 * @param query A function to apply to each element.
	 * @returns A new query that contains the results.
	 */
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

	join<V, K>(other: AsyncIterable<V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>): AsyncLinq<[outer: T, inner: V]>;
	join<V, K, R>(other: AsyncIterable<V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>, resultSelector: util.Fn<[outer: T, inner: V], R>): AsyncLinq<R>;

	groupJoin<V, K>(other: AsyncIterable<V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>): AsyncLinq<[outer: T, inner: Iterable<V>]>;
	groupJoin<V, K, R>(other: AsyncIterable<V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>, resultSelector: util.Fn<[outer: T, inner: Iterable<V>], R>): AsyncLinq<R>;

	aggregate<V>(initial: V, aggregate: util.BiSelect<V, T, V>): Promise<V>;

	/**
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	iterate<V>(fn: IterateCallback<undefined, T, V>): Promise<V | undefined>;
	/**
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	iterate<E, V>(thisArg: E, fn: IterateCallback<E, T, V>): Promise<V | undefined>;

	/**
	 * @param fn - A function that is called once for each item.
	 */
	forEach(fn: (item: T) => void | never[]): Promise<void>;
	/**
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item.
	 */
	forEach<E>(thisArg: E, fn: (this: E, item: T) => void | never[]): Promise<void>;
	/**
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	forEach<V>(fn: (item: T) => void | never[] | V[]): Promise<V | undefined>;
	/**
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
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