import type * as l from './linq.js';
import type * as lc from './linq-common.js';
import type * as la from './linq-async.js';
import { returnSelf } from './util.js';

export type LinqCommon<T = any> = lc.LinqCommon<T>;
export type LinqCommonOrdered<T = any> = lc.LinqCommonOrdered<T>;

export type Linq<T = any> = l.Linq<T>;
export type LinqOrdered<T = any> = l.LinqOrdered<T>;
export type LinqConstructor = l.LinqConstructor;

export type AsyncLinq<T = any> = la.AsyncLinq<T>;
export type AsyncLinqOrdered<T = any> = la.AsyncLinqOrdered<T>;
export type AsyncLinqConstructor = la.AsyncLinqConstructor;

export var AsyncLinq: AsyncLinqConstructor = <any>class AsyncLinq<T> {
	readonly #source: AsyncIterable<T>;

	constructor(source: AsyncIterable<T>) {
		this.#source = source;
	}

	[Symbol.asyncIterator]() {
		return this.#source[Symbol.asyncIterator]();
	}
}

/** @internal */
export interface LinqInternal<T = any> extends Linq<T> {
	get length(): number | undefined;
}

interface LinqInternalConstructor {
	readonly prototype: LinqInternal;
	<T>(values: Iterable<T>): LinqInternal<T>;
	<T>(values: AsyncIterable<T>): AsyncLinq<T>;
	new<T>(): LinqInternal<T>;
}

/** @internal */
export interface Factory {
	(value: any): any;
}

let linq: LinqConstructor = <any>function Linq<T>(value: Iterable<T> | AsyncIterable<T>): LinqCommon<T> {
	if (new.target != null)
		return undefined!;

	if (value == null)
		throw new TypeError("'values' is required.");

	let fn = (<any>value)[LinqCreateSymbol];
	if (fn != null)
		return fn.call(value);

	if (Symbol.iterator in value)
		return new LinqIterable(value);

	if (Symbol.asyncIterator in value)
		return new AsyncLinq(value);
	
	throw new TypeError('Cannot convert ' + value + ' to a Linq object.');
}

/** @internal */
export const LinqCreateSymbol: unique symbol = Symbol("Linq.create");
/** @internal */
export const LinqInternal: LinqInternalConstructor = <any>linq;

export const Linq: LinqConstructor = linq as any;
export default Linq;

Object.defineProperty(LinqInternal, "create", {
	value: LinqCreateSymbol
});

Object.defineProperty(LinqInternal.prototype, LinqCreateSymbol, {
	configurable: true,
	writable: true,
	value: returnSelf
});

Object.defineProperty(AsyncLinq.prototype, LinqCreateSymbol, {
	configurable: true,
	writable: true,
	value: returnSelf
});

class LinqIterable<T> extends LinqInternal<T> {
	readonly #source: Iterable<T>;

	constructor(source: Iterable<T>) {
		super();
		this.#source = source;
	}

	[Symbol.iterator]() {
		return this.#source[Symbol.iterator]();
	}
}
