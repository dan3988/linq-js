import type { Grouping, IterateCallback, LinqCommon, LinqCommonOrdered, LinqFunction } from "./linq-common.js";
import type * as util from "./util.js";

export interface LinqConstructor extends LinqFunction {
	readonly prototype: Linq;
	new<T>(values?: Iterable<T>): Linq<T>;
}

export interface Linq<T = any> extends Iterable<T>, LinqCommon<T> {
	[Symbol.iterator](): IterableIterator<T>;

	first(predictate?: util.Predictate<T>): T;
	/**
	 * Iterates this query, and returns the first matching item, or `undefined` one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The first matching item in this query, or undefined
	 */
	firstOrDefault(query?: util.Predictate<T>): T | undefined;
	/**
	 * Iterates this query, and returns the first matching item, or a default value if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @param def The value to return if no match is found
	 * @returns The first matching item in this query, or {@link def}
	 */
	firstOrDefault<V = undefined>(predictate: undefined | util.Predictate<T>, def: V): T | V;

	last(predictate?: util.Predictate<T>): T;
	/**
	 * Iterates this query, and returns the last matching item, or `undefined` one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The last matching item in this query, or undefined
	 */
	lastOrDefault(predictate?: util.Predictate<T>): T | undefined;
	/**
	 * Iterates this query, and returns the last matching item, or a default value if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @param def The value to return if no match is found
	 * @returns The last matching item in this query, or {@link def}
	 */
	lastOrDefault<V = undefined>(predictate: undefined | util.Predictate<T>, def: V): T | V;

	any(predictate?: util.Predictate<T>): boolean;
	all(predictate?: util.Predictate<T>): boolean;

	sum(): number;
	sum(query: util.ValidKey<T, util.NumberLike>): number;
	sum(query: util.Select<T, util.NumberLike>): number;

	min(): number;
	min(query: util.ValidKey<T, util.NumberLike>): number;
	min(query: util.Select<T, util.NumberLike>): number;

	max(): number;
	max(query: util.ValidKey<T, util.NumberLike>): number;
	max(query: util.Select<T, util.NumberLike>): number;

	average(): number;
	average(query: util.ValidKey<T, util.NumberLike>): number;
	average(query: util.Select<T, util.NumberLike>): number;

	count(filter?: util.Predictate<T>): number;

	zip<V, R>(other: Iterable<V>, selector: util.BiSelect<T, V, R>): Linq<R>;

	/**
	 * @param filter A function that tests each element in this sequence for a condition.
	 * @returns A new query that contains the elements that satisfy the condition.
	 */
	where(filter: util.Predictate<T>): Linq<T>;
	/**
	 * @param key The property key to test for each element.
	 * @returns A new query that contains the elements where the value of {@link key} resolves to a truthy value.
	 */
	where(key: keyof T): Linq<T>;

	/**
	 * Transform each element of this collection by calling a function on each element
	 * @param query A function to apply to each element.
	 * @returns A new query that contains the transformed elements.
	 */
	select<V>(query: util.Select<T, V>): Linq<V>;
	/**
	 * Transform each element of this collection by reading a property on each element
	 * @param key The property key to access on each element.
	 * @returns A new query that contains the transformed elements.
	 */
	select<K extends keyof T>(key: K): Linq<T[K]>;
	/**
	 * Transform each element of this collection by copying a set of properties on each element to a new object.
	 * @param keys An array of property keys to access on each element.
	 * @returns A new query that contains the transformed elements.
	 */
	select<K extends readonly (keyof T)[]>(keys: K): Linq<util.KeysToObject<T, K>>;
	/**
	 * Selects an iterable property on each element of this collection and returns a query containing the flattened results
	 * @param key The property key to access on each element.
	 * @returns A new query that contains the results.
	 */
	selectMany<K extends util.ValidKey<T, Iterable<any>>>(key: K): Linq<T[K] extends Iterable<infer V> ? V : unknown>;
	/**
	 * Projects each element of this collection into an iterable and returns a flattened sequence
	 * @param query A function to apply to each element.
	 * @returns A new query that contains the results.
	 */
	selectMany<V>(query: util.Select<T, Iterable<V>>): Linq<V>;

	distinct(): Linq<T>;

	order(comparer?: util.Comparer<T>): Linq<T>;
	orderDesc(comparer?: util.Comparer<T>): Linq<T>;

	orderBy<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): LinqOrdered<T>;
	orderBy<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): LinqOrdered<T>;

	orderByDesc<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): LinqOrdered<T>;
	orderByDesc<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): LinqOrdered<T>;

	groupBy<K extends keyof T>(query: K): Linq<Grouping<T[K], T>>;
	groupBy<V>(query: util.Select<T, V>): Linq<Grouping<V, T>>;

	toObject<K extends PropertyKey>(keySelector: util.Select<T, K>): Record<K, any>;
	toObject<K extends PropertyKey, V>(keySelector: util.Select<T, K>, valueSelector: util.Select<T, V>): Record<K, V>;
	toArray(): T[];
	toSet(): Set<T>;
	toMap<K>(keySelector: util.Select<T, K>): Map<K, T>;
	toMap<K, V>(keySelector: util.Select<T, K>, valueSelector: util.Select<T, V>): Map<K, V>;
	toMap<K, V extends keyof T>(keySelector: util.Select<T, K>, valueSelector: V): Map<K, T[V]>;
	toMap<K extends keyof T>(keySelector: K): Map<T[K], T>;
	toMap<K extends keyof T, V>(keySelector: K, valueSelector: util.Select<T, V>): Map<T[K], V>;
	toMap<K extends keyof T, V extends keyof T>(keySelector: K, valueSelector: V): Map<T[K], T[V]>;

	ofType(type: 'string'): Linq<Extract<T, string>>;
	ofType(type: 'boolean'): Linq<Extract<T, number>>;
	ofType(type: 'number'): Linq<Extract<T, number>>;
	ofType(type: 'bigint'): Linq<Extract<T, bigint>>;
	ofType(type: 'symbol'): Linq<Extract<T, symbol>>;
	ofType(type: 'object'): Linq<Extract<T, object>>;
	ofType(type: 'function'): Linq<Extract<T, Function>>;
	ofType(type: 'undefined'): Linq<Extract<T, undefined>>;
	ofType<V>(type: util.Constructor<V>): Linq<Extract<T, V>>;

	skip(count: number): Linq<T>;
	take(count: number): Linq<T>;

	concat<V>(...values: Iterable<V>[]): Linq<T | V>;

	joinText(sep?: string): string;

	join<V, K>(other: Iterable<V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>): Linq<[outer: T, inner: V]>;
	join<V, K, R>(other: Iterable<V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>, resultSelector: util.Fn<[outer: T, inner: V], R>): Linq<R>;

	groupJoin<V, K>(other: Iterable<V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>): Linq<[outer: T, inner: Iterable<V>]>;
	groupJoin<V, K, R>(other: Iterable<V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>, resultSelector: util.Fn<[outer: T, inner: Iterable<V>], R>): Linq<R>;

	aggregate<V>(initial: V, aggregate: util.BiSelect<V, T, V>): V;

	/**
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	iterate<V>(fn: IterateCallback<undefined, T, V>): V | undefined;
	/**
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	iterate<E, V>(thisArg: E, fn: IterateCallback<E, T, V>): V | undefined;

	/**
	 * @param fn - A function that is called once for each item.
	 */
	forEach(fn: (item: T) => void | never[]): void;
	/**
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item.
	 */
	forEach<E>(thisArg: E, fn: (this: E, item: T) => void | never[]): void;
	/**
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	forEach<V>(fn: (item: T) => void | never[] | V[]): V | undefined;
	/**
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	forEach<E, V>(thisArg: E, fn: (this: E, item: T) => void | never[] | V[]): V | undefined;
}

export interface LinqOrdered<T = any> extends Linq<T>, LinqCommonOrdered<T> {
	thenBy<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): LinqOrdered<T>;
	thenBy<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): LinqOrdered<T>;

	thenByDesc<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): LinqOrdered<T>;
	thenByDesc<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): LinqOrdered<T>;
}
