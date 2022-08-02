export type ValidKey<T, R> = keyof { [K in keyof T as T[K] extends R ? K : never]: any };
export type NumberLike = number | { [Symbol.toPrimitive](hint: "number"): number };

export type Awaitable<T> = T | Promise<T>;

export type Select<T = any, V = any> = (value: T) => V;
export type SelectType<T = any, R = any> = ValidKey<T, R> | Select<T, R>;
export type BiSelect<X = any, Y = any, V = any> = (x: X, y: Y) => V;

export type Predictate<T = any> = (value: T) => boolean;
export type Comparer<T = any> = (x: T, y: T) => number;

export interface MapOrSet<T> extends Iterable<T> {
	readonly size: number;
}

export interface Constructor<T = any, TArgs extends any[] = any[]> {
	readonly prototype: T;
	new(...args: TArgs): T;
}

export function errNoElements() {
	return new TypeError("Sequence contains no elements.");
}

export function getter<T = any, K extends keyof T = any>(key: K, value: T): T[K];
export function getter(key: string | symbol | number, value: any): any;
export function getter(key: string | symbol | number, value: any): any {
	return value[key];
}

export function compileQuery<T, V>(select: undefined | SelectType<T, V>, required: true): Select<T, V>;
export function compileQuery<T, V>(select: undefined | SelectType<T, V>, required: false): undefined | Select<T, V>;
export function compileQuery<T, V>(select: undefined | SelectType<T, V>, required: boolean): undefined | Select<T, V> {
	if (select != null) {
		return typeof select === 'function' ? select : getter.bind(undefined, select);
	} else if (required) {
		throw new TypeError("Select function is null or undefined.");
	}
}

export function isType(type: string, value: any): boolean {
	return typeof value === type;
}

export function isInstance(type: Function, value: any): boolean {
	return value instanceof type;
}

export function defaultCompare(x?: any, y?: any): number {
	if (x === undefined) {
		return y === undefined ? 0 : 1;
	} else if (y === undefined) {
		return -1;
	} else {
		let strX = String(x);
		let strY = String(y);
		if (strX < strY)
			return -1;
		
		if (strX > strY)
			return 1;

		return 0;
	}
}

export function invokeSelect<T, V>(value: T, required: boolean, select: SelectType<T, V>): V
export function invokeSelect<T, V>(value: T, required: false, select?: undefined): T
export function invokeSelect<T, V>(value: T, required: false, select: undefined | SelectType<T, V>): V | T
export function invokeSelect(value: any, required: boolean, select?: SelectType) {
	if (select == null) {
		if (required)
			throw new TypeError('A value for the select parameter is required');

		return value;
	} else if (typeof select === 'function') {
		return select(value);
	} else {
		return value[select];
	}
}

export type IterCallback<V = any, R = any> = (result: IteratorResult<V>) => void | undefined | R;

/**
 * A function that returns the {@link this} parameter
 * @param this the value to return
 * @returns the value of {@link this}
 */
export function identity<T>(this: T): T {
	return this;
}

/**
 * A function that returns the first parameter
 * @param arg the value to return
 * @returns the value of {@link arg}
 */
export function firstArg<T>(arg: T): T {
	return arg;
}

/**
 * Wrapper for an array of tuples that uses a single array to hold the values & validates that values added are the correct length.
 */
export class TupleArray<T extends readonly any[]> implements Iterable<T> {
	readonly #tupleSize: number;
	readonly #values: any[];
	#count: number;

	get length() {
		return this.#count;
	}

	constructor(tupleSize: T['length'])  {
		this.#tupleSize = tupleSize;
		this.#values = [];
		this.#count = 0;
	}

	*[Symbol.iterator](): Generator<T> {
		const size = this.#tupleSize;
		const values = this.#values;
		for (let i = 0, j = 0; i < this.#count; i++)
			yield <any>values.slice(j, j += size);
	}

	get(index: number): T | undefined {
		if (index < 0 || index >= this.#count)
			return undefined;

		const size = this.#tupleSize;
		const start = index * size;
		return <any>this.#values.slice(start, start + size);
	}

	insert(start: number, values: TupleArray<T>) {
		let ts = this.#tupleSize;
		if (ts != values.#tupleSize)
			throw new TypeError("Invalid length tuple.");

		this.#count += values.#count;
		this.#values.splice(start, 0, ...values.#values);
		return this;
	}

	shift(): T | undefined {
		if (this.#count === 0)
			return undefined;
		
		this.#count--;
		return <any>this.#values.splice(0, this.#tupleSize);
	}

	unshift(...values: T): this {
		if (values.length != this.#tupleSize)
			throw new TypeError("Invalid length tuple.");

		this.#values.unshift(...values);
		this.#count++;
		return this;
	}

	pop(): T | undefined {
		if (this.#count === 0)
			return undefined;

		let count = --this.#count;
		let size = this.#tupleSize;
		return <any>this.#values.splice(count * size, size);
	}

	push(...values: T): this {
		if (values.length != this.#tupleSize)
			throw new TypeError("Invalid length tuple.");

		this.#values.push(...values);
		this.#count++;
		return this;
	}
}
