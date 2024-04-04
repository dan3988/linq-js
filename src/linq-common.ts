import type { Linq, LinqOrdered, AsyncLinq, AsyncLinqOrdered } from "./linq.js";
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

	empty<T = never>(): Linq<T>;
	range(start: number, count: number, step?: number): Linq<number>;
	repeat<const T>(value: T, count: number): Linq<T>;
	fromKeys(obj: object): Linq<string>;
	fromObject(obj: object): Linq<[string, any]>;
	fromObject<V>(obj: object, select: util.BiSelect<string, any, V>): Linq<V>;
}

type AsyncType<Async extends boolean | unknown, IfSync, IfAsync, IfUnknown = IfSync | IfAsync> = Async extends true ? IfAsync : (Async extends false ? IfSync : IfUnknown);
type ReturnLinq<Async extends boolean | unknown, Element> = AsyncType<Async, Linq<Element>, AsyncLinq<Element>, LinqCommon<Element, Async>>;
type ReturnLinqOrdered<Async extends boolean | unknown, Element> = AsyncType<Async, LinqOrdered<Element>, AsyncLinqOrdered<Element>, LinqCommonOrdered<Element, Async>>;
type ReturnElement<Async extends boolean | unknown, Element> = AsyncType<Async, Element, Promise<Element>>;
type InputParam<Async extends boolean | unknown, Element> = AsyncType<Async, Iterable<Element>, AsyncIterable<Element>>;

/**
 * Base type of {@link Linq} and {@link AsyncLinq}. Contains the definitions and JSDocs of functions that have the same parameter types.
 */
export interface LinqCommon<T = any, Async extends boolean | unknown = unknown> {
	[Linq.create](): this;

	/**
	 * Iterates this query, and returns the first matching item, or throws an error if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The first matching item in this query
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	first<V extends T>(predictate?: util.PredictateTyped<T, V>): ReturnElement<Async, V>;
	/**
	 * Iterates this query, and returns the first matching item, or throws an error if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The first matching item in this query
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	first(predictate?: util.Predictate<T>): ReturnElement<Async, T>;
	/**
	 * Iterates this query, and returns the first matching item, or `undefined` one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The first matching item in this query, or undefined
	 */
	firstOrDefault<V extends T>(predictate?: util.PredictateTyped<T, V>): ReturnElement<Async, V>;
	/**
	 * Iterates this query, and returns the first matching item, or `undefined` one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The first matching item in this query, or undefined
	 */
	firstOrDefault(predictate?: util.Predictate<T>): ReturnElement<Async, T | undefined>;
	/**
	 * Iterates this query, and returns the first matching item, or a default value if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @param def The value to return if no match is found
	 * @returns The first matching item in this query, or {@link def}
	 */
	firstOrDefault<V = undefined>(predictate: undefined | util.Predictate<T>, def: V): ReturnElement<Async, T | V>;

	/**
	 * Iterates this query, and returns the last matching item, or throws an error if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The last matching item in this query
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	last<V extends T>(predictate?: util.PredictateTyped<T, V>): ReturnElement<Async, V>;
	/**
	 * Iterates this query, and returns the last matching item, or throws an error if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The last matching item in this query
	 * @throws {TypeError} If this query has no items, or {@link predictate} returns `false` for each item.
	 */
	last(predictate?: util.Predictate<T>): ReturnElement<Async, T>;
	/**
	 * Iterates this query, and returns the last matching item, or `undefined` one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The last matching item in this query, or undefined
	 */
	lastOrDefault<V extends T>(predictate?: util.PredictateTyped<T, V>): ReturnElement<Async, V>;
	/**
	 * Iterates this query, and returns the last matching item, or `undefined` one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns The last matching item in this query, or undefined
	 */
	lastOrDefault(predictate?: util.Predictate<T>): ReturnElement<Async, T | undefined>;
	/**
	 * Iterates this query, and returns the last matching item, or a default value if one is not found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @param def The value to return if no match is found
	 * @returns The last matching item in this query, or {@link def}
	 */
	lastOrDefault<V = undefined>(predictate: undefined | util.Predictate<T>, def: V): ReturnElement<Async, T | V>;

	/**
	 * Iterates this query, and returns `true` if a single item is found.
	 * @param predictate A function that will called on each element in the query until it returns `true`
	 * @returns `true` if an item exists in this query, otherwise `false`
	 */
	any(predictate?: util.Predictate<T>): ReturnElement<Async, boolean>;

	/**
	 * Iterates this query, and returns `true` if all items in this query match the predictate.
	 * @param predictate A function that will called on each element in the query until it returns `false`
	 * @returns `true` if all items in this query match the predictate, otherwise `false`
	 */
	all(predictate: util.Predictate<T>): ReturnElement<Async, boolean>;

	/**
	 * Calculates the sum of this sequence.
	 * @returns The sum of this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	sum(): ReturnElement<Async, number>;
	/**
	 * Calculates the sum of this sequence.
	 * @query A property key that represents a number property in {@link T}
	 * @returns The sum of this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	sum(query: util.ValidKey<T, util.NumberLike>): ReturnElement<Async, number>;
	/**
	 * Calculates the sum of this sequence.
	 * @query A function that will convert {@link T} to a number.
	 * @returns The sum of this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	sum(query: util.Select<T, util.NumberLike>): ReturnElement<Async, number>;

	/**
	 * Finds the smallest value in this sequence
	 * @returns The smallest value in this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	min(): ReturnElement<Async, number>;
	/**
	 * Finds the smallest value in this sequence
	 * @query A property key that represents a number property in {@link T}
	 * @returns The smallest value in this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	min(query: util.ValidKey<T, util.NumberLike>): ReturnElement<Async, number>;
	/**
	 * Finds the smallest value in this sequence
	 * @query A function that will convert {@link T} to a number.
	 * @returns The smallest value in this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	min(query: util.Select<T, util.NumberLike>): ReturnElement<Async, number>;

	/**
	 * Finds the largest value in this sequence
	 * @returns The largest value in this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	max(): ReturnElement<Async, number>;
	/**
	 * Finds the largest value in this sequence
	 * @query A property key that represents a number property in {@link T}
	 * @returns The largest value in this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	max(query: util.ValidKey<T, util.NumberLike>): ReturnElement<Async, number>;
	/**
	 * Finds the smallest value in this sequence
	 * @query A function that will convert {@link T} to a number.
	 * @returns The largest value in this sequence, or `NaN` if an item that cannot be converted to a number is present.
	 */
	max(query: util.Select<T, util.NumberLike>): ReturnElement<Async, number>;

	average(): ReturnElement<Async, number>;
	average(query: util.ValidKey<T, util.NumberLike>): ReturnElement<Async, number>;
	average(query: util.Select<T, util.NumberLike>): ReturnElement<Async, number>;

	count(filter?: util.Predictate<T>): ReturnElement<Async, number>;

	/**
	 * Filter this sequence using a predictate function
	 * @param predictate A function that tests each element in this sequence for a condition.
	 * @returns A new query that contains the elements that satisfy the condition.
	 */
	where<V extends T>(predictate: util.PredictateTyped<T, V>): ReturnLinq<Async, V>;
	/**
	 * Filter this sequence using a predictate function
	 * @param predictate A function that tests each element in this sequence for a condition.
	 * @returns A new query that contains the elements that satisfy the condition.
	 */
	where(predictate: util.Predictate<T>): ReturnLinq<Async, T>;
	/**
	 * Filter this sequence using a property key
	 * @param key The property key to test for each element.
	 * @returns A new query that contains the elements where the value of {@link key} resolves to a truthy value.
	 */
	where(key: keyof T): ReturnLinq<Async, T>;
	/**
	 * Filter this sequence to only truthy values
	 * @returns A new query that contains the elements that are truthy.
	 */
	where(): ReturnLinq<Async, Exclude<T, util.FalsyValue>>;

	/**
	 * Transform each element of this collection by calling a function on each element
	 * @param query A function to apply to each element.
	 * @returns A new query that contains the transformed elements.
	 */
	select<V>(query: util.Select<T, V>): ReturnLinq<Async, V>;
	/**
	 * Transform each element of this collection by reading a property on each element
	 * @param key The property key to access on each element.
	 * @returns A new query that contains the transformed elements.
	 */
	select<K extends keyof T>(key: K): ReturnLinq<Async, T[K]>;
	/**
	 * Transform each element of this collection by copying a set of properties on each element to a new object.
	 * @param keys An array of property keys to access on each element.
	 * @returns A new query that contains the transformed elements.
	 */
	select<K extends readonly (keyof T)[]>(keys: K): ReturnLinq<Async, util.KeysToObject<T, K>>;
	/**
	 * Selects an iterable property on each element of this collection and returns a query containing the flattened results
	 * @param key The property key to access on each element.
	 * @returns A new query that contains the results.
	 */
	selectMany<K extends util.ValidKey<T, Iterable<any>>>(key: K): ReturnLinq<Async, T[K] extends Iterable<infer V> ? V : unknown>;
	/**
	 * Projects each element of this collection into an iterable and returns a flattened sequence
	 * @param query A function to apply to each element.
	 * @returns A new query that contains the results.
	 */
	selectMany<V>(query: util.Select<T, Iterable<V>>): ReturnLinq<Async, V>;

	distinct(): ReturnLinq<Async, T>;

	order(comparer?: util.Comparer<T>): ReturnLinq<Async, T>;
	orderDesc(comparer?: util.Comparer<T>): ReturnLinq<Async, T>;

	orderBy<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): ReturnLinqOrdered<Async, T>;
	orderBy<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): ReturnLinqOrdered<Async, T>;

	orderByDesc<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): ReturnLinqOrdered<Async, T>;
	orderByDesc<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): ReturnLinqOrdered<Async, T>;

	groupBy<K extends keyof T>(query: K): ReturnLinq<Async, Grouping<T[K], T>>;
	groupBy<V>(query: util.Select<T, V>): ReturnLinq<Async, Grouping<V, T>>;

	toObject<K extends PropertyKey>(keySelector: util.Select<T, K>): ReturnElement<Async, Record<K, any>>;
	toObject<K extends PropertyKey, V>(keySelector: util.Select<T, K>, valueSelector: util.Select<T, V>): ReturnElement<Async, Record<K, V>>;
	toArray(): ReturnElement<Async, T[]>;
	toSet(): ReturnElement<Async, Set<T>>;
	toMap<K>(keySelector: util.Select<T, K>): ReturnElement<Async, Map<K, T>>;
	toMap<K, V>(keySelector: util.Select<T, K>, valueSelector: util.Select<T, V>): ReturnElement<Async, Map<K, V>>;
	toMap<K, V extends keyof T>(keySelector: util.Select<T, K>, valueSelector: V): ReturnElement<Async, Map<K, T[V]>>;
	toMap<K extends keyof T>(keySelector: K): ReturnElement<Async, Map<T[K], T>>;
	toMap<K extends keyof T, V>(keySelector: K, valueSelector: util.Select<T, V>): ReturnElement<Async, Map<T[K], V>>;
	toMap<K extends keyof T, V extends keyof T>(keySelector: K, valueSelector: V): ReturnElement<Async, Map<T[K], T[V]>>;

	ofType(type: 'string'): ReturnLinq<Async, Extract<T, string>>;
	ofType(type: 'boolean'): ReturnLinq<Async, Extract<T, boolean>>;
	ofType(type: 'number'): ReturnLinq<Async, Extract<T, number>>;
	ofType(type: 'bigint'): ReturnLinq<Async, Extract<T, bigint>>;
	ofType(type: 'symbol'): ReturnLinq<Async, Extract<T, symbol>>;
	ofType(type: 'object'): ReturnLinq<Async, Extract<T, object | null>>;
	ofType(type: 'function'): ReturnLinq<Async, Extract<T, Function>>;
	ofType(type: 'undefined'): ReturnLinq<Async, undefined>;
	ofType(type: ObjectConstructor): ReturnLinq<Async, Exclude<T, string | boolean | number | bigint | symbol | null | undefined>>;
	ofType<V>(type: util.Constructor<V>): ReturnLinq<Async, Extract<T, V>>;

	concat<V>(...values: InputParam<Async, V>[]): ReturnLinq<Async, T | V>;

	/**
	 * Create a string using the elements in the sequence, separated by the specified separator string
	 * @param sep The string to insert between each element in the sequence (defaults to an empty string)
	 */
	joinText(sep?: string): ReturnElement<Async, string>;

	join<V, K>(other: InputParam<Async, V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>): ReturnLinq<Async, [outer: T, inner: V]>;
	join<V, K, R>(other: InputParam<Async, V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>, resultSelector: util.Fn<[outer: T, inner: V], R>): ReturnLinq<Async, R>;

	groupJoin<V, K>(other: InputParam<Async, V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>): ReturnLinq<Async, [outer: T, inner: Iterable<V>]>;
	groupJoin<V, K, R>(other: InputParam<Async, V>, outerKeySelector: util.SelectKeyType<T, K>, innerKeySelector: util.SelectKeyType<V, K>, resultSelector: util.Fn<[outer: T, inner: Iterable<V>], R>): ReturnLinq<Async, R>;

	zip<V, R>(other: InputParam<Async, V>, selector: util.BiSelect<T, V, R>): ReturnLinq<Async, R>;

	/**
	 * Skip a specified number of elements in the sequence
	 * @param count The amount of elements to skip
	 */
	skip(count: number): ReturnLinq<Async, T>;
	/**
	 * Return a sequence containing specified number of elements
	 * @param count The maximum amount of elements to include in the sequence
	 */
	take(count: number): ReturnLinq<Async, T>;

	aggregate<V>(initial: V, aggregate: util.BiSelect<V, T, V>): ReturnElement<Async, V>;

	/**
	 * Iterate this query and call a function with each result from the iterator.
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	iterate<V>(fn: IterateCallback<undefined, T, V>): ReturnElement<Async, V>;
	/**
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	iterate<E, V>(thisArg: E, fn: IterateCallback<E, T, V>): ReturnElement<Async, V>;

	/**
	 * Iterate this query and call a function for each item.
	 * @param fn - A function that is called once for each item.
	 */
	forEach(fn: (item: T) => void | never[]): ReturnElement<Async, void>;
	/**
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item.
	 */
	forEach<E>(thisArg: E, fn: (this: E, item: T) => void | never[]): ReturnElement<Async, void>;
	/**
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	forEach<V>(fn: (item: T) => void | never[] | V[]): ReturnElement<Async, V | undefined>;
	/**
	 * @param thisArg - The object to passed into {@link fn} as the {@code this} argument
	 * @param fn - A function that is called once for each item. This function can return an array, which will cause the iteration to stop and the first value in the array to be returned.
	 * @returns The result from {@link fn}, if any.
	 */
	forEach<E, V>(thisArg: E, fn: (this: E, item: T) => void | never[] | V[]): ReturnElement<Async, V | undefined>;
}

export interface LinqCommonOrdered<T = any, Async extends boolean | unknown = unknown> extends LinqCommon<T, Async> {
	thenBy<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): ReturnLinqOrdered<Async, T>;
	thenBy<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): ReturnLinqOrdered<Async, T>;

	thenByDesc<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): ReturnLinqOrdered<Async, T>;
	thenByDesc<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): ReturnLinqOrdered<Async, T>;
}
