import type { AsyncLinq } from "./linq-async.js";
import type { Grouping, IterateCallback, LinqCommon, LinqCommonOrdered } from "./linq-common.js";
import type * as util from "./util.js";

export interface LinqConstructor {
	readonly create: unique symbol;
	readonly prototype: Linq;
	<T>(values: Iterable<T>): Linq<T>;
	<T>(values: AsyncIterable<T>): AsyncLinq<T>;

	empty<T = any>(): Linq<T>;
	range(start: number, count: number, step?: number): Linq<number>;
	repeat<T>(value: T, count: number): Linq<T>;
	fromObject(obj: object): Linq<[string, any]>;
	fromObject<V>(obj: object, select: util.BiSelect<string, any, V>): Linq<V>;
}

export interface Linq<T = any> extends Iterable<T>, LinqCommon<T> {
	first(predictate?: util.Predictate<T>): T;
	firstOrDefault(predictate?: util.Predictate<T>): T | undefined;

	last(predictate?: util.Predictate<T>): T;
	lastOrDefault(predictate?: util.Predictate<T>): T | undefined;

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

	where(filter: util.Predictate<T>): Linq<T>;

	select<V>(query: util.Select<T, V>): Linq<V>;
	select<K extends keyof T>(query: K): Linq<T[K]>;
	select<K extends (keyof T)[]>(keys: K): Linq<util.KeysToObject<T, K>>;
	selectMany<K extends util.ValidKey<T, Iterable<any>>>(query: K): Linq<T[K] extends Iterable<infer V> ? V : unknown>;
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

	ofType(type: 'string'): Linq<string>;
	ofType(type: 'boolean'): Linq<number>;
	ofType(type: 'number'): Linq<number>;
	ofType(type: 'bigint'): Linq<bigint>;
	ofType(type: 'symbol'): Linq<symbol>;
	ofType(type: 'object'): Linq<object>;
	ofType(type: 'function'): Linq<Function>;
	ofType(type: 'undefined'): Linq<undefined>;
	ofType<V>(type: util.Constructor<V>): Linq<V>;

	concat<V>(...values: Iterable<V>[]): Linq<T | V>;

	join(separator?: string): string;

	aggregate<V>(initial: V, aggregate: util.BiSelect<V, T, V>): V;

	iterate<V>(fn: IterateCallback<undefined, T, V>): V | undefined;
	iterate<E, V>(thisArg: E, fn: IterateCallback<E, T, V>): V | undefined;

	forEach(fn: (item: T) => void | never[]): void;
	forEach<E>(thisArg: E, fn: (this: E, item: T) => void | never[]): void;
	forEach<V>(fn: (item: T) => void | never[] | V[]): V | undefined;
	forEach<E, V>(thisArg: E, fn: (this: E, item: T) => void | never[] | V[]): V | undefined;
}

export interface LinqOrdered<T = any> extends Linq<T>, LinqCommonOrdered<T> {
	thenBy<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): LinqOrdered<T>;
	thenBy<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): LinqOrdered<T>;

	thenByDesc<K extends keyof T>(query: K, comparer?: util.Comparer<T[K]>): LinqOrdered<T>;
	thenByDesc<V>(query: util.Select<T, V>, comparer?: util.Comparer<V>): LinqOrdered<T>;
}
