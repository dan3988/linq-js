import type { LinqCommon, LinqCommonOrdered, LinqFunction } from "./linq-common.js";

export interface AsyncLinqConstructor extends LinqFunction {
	readonly prototype: AsyncLinq;
	new<T>(value: AsyncIterable<T>): AsyncLinq<T>;
}

export interface AsyncLinq<T = any> extends AsyncIterable<T>, LinqCommon<T, true> {
	[Symbol.asyncIterator](): AsyncIterableIterator<T>;
}

export interface AsyncLinqOrdered<T> extends AsyncLinq<T>, LinqCommonOrdered<T, true> {
}
