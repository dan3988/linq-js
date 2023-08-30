import type * as lc from './linq-common.js';
import { returnSelf } from './util.js';
import { EmptyIterator } from './iterators.js';

export type LinqCommon<T = any> = lc.LinqCommon<T>;
export type LinqCommonOrdered<T = any> = lc.LinqCommonOrdered<T>;

/** @internal */
export interface LinqInternal<T = any> extends Linq<T> {
	get length(): number | undefined;
}

/** @internal */
export interface LinqInternalConstructor extends lc.LinqFunction {
	readonly prototype: LinqInternal;
	<T>(values: Iterable<T>): LinqInternal<T>;
	<T>(values: AsyncIterable<T>): AsyncLinq<T>;
	new<T>(values?: Iterable<T>): LinqInternal<T>;
}

export interface LinqConstructor extends lc.LinqFunction {
	readonly prototype: Linq;
	new<T>(values?: Iterable<T>): Linq<T>;
}

export interface Linq<T = any> extends Iterable<T>, lc.LinqCommon<T, false> {
	[Symbol.iterator](): IterableIterator<T>;
}

export interface LinqOrdered<T = any> extends Linq<T>, lc.LinqCommonOrdered<T, false> {
}

export interface AsyncLinqConstructor extends lc.LinqFunction {
	readonly prototype: AsyncLinq;
	new<T>(value: AsyncIterable<T>): AsyncLinq<T>;
}

export interface AsyncLinq<T = any> extends AsyncIterable<T>, lc.LinqCommon<T, true> {
	[Symbol.asyncIterator](): AsyncIterableIterator<T>;
}

export interface AsyncLinqOrdered<T> extends AsyncLinq<T>, lc.LinqCommonOrdered<T, true> {
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

/** @internal */
export var LinqInternal: LinqInternalConstructor = <any>class Linq<T> {
	get length(): number | undefined {
		return undefined;
	}

	readonly #source: Iterable<T>;

	constructor(source: Iterable<T>) {
		this.#source = source ?? EmptyIterator.INSTANCE;
	}

	[Symbol.iterator]() {
		return this.#source[Symbol.iterator]();
	}
}

let linq: lc.LinqFunction = <any>function Linq<T>(value: Iterable<T> | AsyncIterable<T>): LinqCommon<T> {
	if (new.target != null)
		return undefined!;

	if (value == null)
		throw new TypeError("'values' is required.");

	let fn = (<any>value)[LinqCreateSymbol];
	if (fn != null)
		return fn.call(value);

	if (Symbol.iterator in value)
		return new LinqInternal(value);

	if (Symbol.asyncIterator in value)
		return new AsyncLinq(value);
	
	throw new TypeError('Cannot convert ' + value + ' to a Linq object.');
}

Object.setPrototypeOf(LinqInternal, linq);
Object.setPrototypeOf(LinqInternal.prototype, linq.prototype);
Object.setPrototypeOf(AsyncLinq, linq);
Object.setPrototypeOf(AsyncLinq.prototype, linq.prototype);

/** @internal */
export const LinqCreateSymbol: unique symbol = Symbol("Linq.create");

export const Linq: lc.LinqFunction = linq;
export default Linq;

Object.defineProperty(linq, "create", {
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
