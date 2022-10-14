import type { AsyncLinq } from "./linq-async.js";
import type { Grouping, IterateCallback, LinqCommon, LinqCommonOrdered } from "./linq-common.js";
import type { BiSelect, Comparer, Constructor, KeysToObject, NumberLike, Predictate, Select, ValidKey } from "./util.js";

export interface LinqConstructor {
	readonly create: unique symbol;
	readonly prototype: Linq;
	<T>(values: Iterable<T>): Linq<T>;
	<T>(values: AsyncIterable<T>): AsyncLinq<T>;

	empty<T = any>(): Linq<T>;
	range(start: number, count: number, step?: number): Linq<number>;
	repeat<T>(value: T, count: number): Linq<T>;
	fromObject(obj: object): Linq<[string, any]>;
	fromObject<V>(obj: object, select: BiSelect<string, any, V>): Linq<V>;
}

export interface Linq<T = any> extends Iterable<T>, LinqCommon<T> {
	first(predictate?: Predictate<T>): T;
	firstOrDefault(predictate?: Predictate<T>): T | undefined;

	last(predictate?: Predictate<T>): T;
	lastOrDefault(predictate?: Predictate<T>): T | undefined;

	any(predictate?: Predictate<T>): boolean;
	all(predictate?: Predictate<T>): boolean;

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

	zip<V, R>(other: Iterable<V>, selector: BiSelect<T, V, R>): Linq<R>;

	where(filter: Predictate<T>): Linq<T>;

	select<V>(query: Select<T, V>): Linq<V>;
	select<K extends keyof T>(query: K): Linq<T[K]>;
	select<K extends (keyof T)[]>(keys: K): Linq<KeysToObject<T, K>>;
	selectMany<K extends ValidKey<T, Iterable<any>>>(query: K): Linq<T[K] extends Iterable<infer V> ? V : unknown>;
	selectMany<V>(query: Select<T, Iterable<V>>): Linq<V>;

	distinct(): Linq<T>;

	order(comparer?: Comparer<T>): Linq<T>;
	orderDesc(comparer?: Comparer<T>): Linq<T>;

	orderBy<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): LinqOrdered<T>;
	orderBy<V>(query: Select<T, V>, comparer?: Comparer<V>): LinqOrdered<T>;

	orderByDesc<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): LinqOrdered<T>;
	orderByDesc<V>(query: Select<T, V>, comparer?: Comparer<V>): LinqOrdered<T>;

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

export interface LinqOrdered<T = any> extends Linq<T>, LinqCommonOrdered<T> {
	thenBy<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): LinqOrdered<T>;
	thenBy<V>(query: Select<T, V>, comparer?: Comparer<V>): LinqOrdered<T>;

	thenByDesc<K extends keyof T>(query: K, comparer?: Comparer<T[K]>): LinqOrdered<T>;
	thenByDesc<V>(query: Select<T, V>, comparer?: Comparer<V>): LinqOrdered<T>;
}
