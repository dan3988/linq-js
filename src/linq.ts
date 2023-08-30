import type { LinqCommon, LinqCommonOrdered, LinqFunction } from "./linq-common.js";

export interface LinqConstructor extends LinqFunction {
	readonly prototype: Linq;
	new<T>(values?: Iterable<T>): Linq<T>;
}

export interface Linq<T = any> extends Iterable<T>, LinqCommon<T, false> {
	[Symbol.iterator](): IterableIterator<T>;
}

export interface LinqOrdered<T = any> extends Linq<T>, LinqCommonOrdered<T, false> {
}
