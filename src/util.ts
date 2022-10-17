import type { LinqCommon } from "./linq-common";

export type Fn<TArgs extends any[] = any[], TResult = any, TThis = void> = (this: TThis, ...args: TArgs) => TResult;

export type ValidKey<T, R> = keyof { [K in keyof T as T[K] extends R ? K : never]: any };
export type ValidKeys<T, R> = (ValidKey<T, R>)[];
export type NumberLike = number | { [Symbol.toPrimitive](hint: "number"): number };

export type Awaitable<T> = T | Promise<T>;

export type Select<T = any, V = any> = Fn<[value: T], V>;
export type SelectKeyType<T = any, R = any> = ValidKey<T, R> | Select<T, R>;
export type SelectType<T = any, R = any> = ValidKey<T, R> | ValidKeys<T, R> | Select<T, R>;
export type BiSelect<X = any, Y = any, V = any> = Fn<[x: X, y: Y], V>;
export type KeysToObject<TSource, TKeys extends (keyof TSource)[]> = { [P in TKeys[number]]: TSource[P] }

export type Predictate<T = any> = Fn<[value: T], boolean>;
export type Comparer<T = any> = Fn<[x: T, y: T], number>;

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

function keyToString(key: any): string {
	switch (typeof key) {
		case "symbol":
		case "number":
			return key.toString();
		default:
			key = String(key);
			return JSON.stringify(key);
	}
}

export function defineFunction<T, K extends keyof T>(self: T, key: K, func: T[K] extends Fn<infer A, infer V> ? Fn<A, V, T> : never): void {
	if (typeof func !== 'function')
		throw new TypeError("Parameter 'func' is not a function.");

	Object.defineProperty(func, "name", {
		configurable: true,
		value: String(key)
	});

	Object.defineProperty(self, key, {
		configurable: true,
		writable: true,
		value: func
	});
}

export function defineCommonFunction<T, K extends keyof LinqCommon>(self: LinqCommon<T>, key: K, func: LinqCommon<T>[K] extends (...args: infer A) => Awaitable<infer V> ? (this: LinqCommon<T>, ...args: A) => Awaitable<V | undefined> : never): void {
	defineFunction(self, key, func as any);
}

export function returnSelf<T>(this: T): T {
	return this;
}

export interface GetAllFunction {
	<T, K extends ValidKeys<T, any>>(this: K, value: T): KeysToObject<T, K>;
	(this: readonly PropertyKey[], value: any): any;
	readonly keys: readonly PropertyKey[];
}

export interface GetterFunction {
	<T, K extends keyof T>(this: K, value: T): T[K];
	(this: PropertyKey, value: any): any;
	readonly key: PropertyKey;
}

export function getAll(this: readonly PropertyKey[], value: any): any {
	const result: any = {};
	for (const key of this)
		result[key] = value[key];

	return result;
}

const getAllToString = function toString(this: GetAllFunction) {
	return "getAll([" + this.keys.map(keyToString).join(", ") + "])";
}

export function getter(this: PropertyKey, value: any): any {
	return value[this];
}

const getterToString = function toString(this: GetterFunction) {
	return "getter(" + keyToString(this.key) + ")";
}

export function createGetter(key: PropertyKey): GetterFunction {
	let fn = getter.bind(key);

	Object.defineProperty(fn, 'toString', {
		writable: true,
		configurable: true,
		value: getterToString
	});

	Object.defineProperty(fn, 'key', {
		configurable: true,
		value: key
	});

	return fn as any;
}

export function createGetAll(keys: Iterable<PropertyKey>): GetAllFunction {
	let roKeys = Object.freeze([...keys]);
	let fn = getAll.bind(roKeys);

	Object.defineProperty(fn, 'toString', {
		writable: true,
		configurable: true,
		value: getAllToString
	});

	Object.defineProperty(fn, 'keys', {
		configurable: true,
		value: roKeys
	});

	return fn as any;
}

export function compileQuery<T, V>(select: undefined | SelectType<T, V>, required: true): Select<T, V>;
export function compileQuery<T, V>(select: undefined | SelectType<T, V>, required: false): undefined | Select<T, V>;
export function compileQuery<T, V>(select: undefined | SelectType<T, V>, required: boolean): undefined | Select<T, V> {
	if (select != null) {
		if (typeof select === "function")
			return select;

		return Array.isArray(select) ? createGetAll(select) : createGetter(select);
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
export function invokeSelect(value: any, required: boolean, select?: PropertyKey | PropertyKey[] | Select): any
export function invokeSelect(value: any, required: boolean, select?: PropertyKey | PropertyKey[] | Select) {
	if (select == null) {
		if (required)
			throw new TypeError('A value for the select parameter is required');

		return value;
	} else if (typeof select === 'function') {
		return select(value);
	} else if (Array.isArray(select)) {
		return getAll.call(select, value);
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

export interface TypedArray<N extends number | bigint> extends ArrayLike<N>, Iterable<N>, ArrayBufferView {
	readonly BYTES_PER_ELEMENT: number;
}

export interface TypedArrayConstructor<N extends number | bigint = any> {
	readonly prototype: TypedArray<N>;
	readonly BYTES_PER_ELEMENT: number;
    new(length: number): TypedArray<N>;
    new(array: Iterable<N>): TypedArray<N>;
    new(buffer: ArrayBufferLike, byteOffset?: number, length?: number): TypedArray<N>;
}

export const typedArrayViews: readonly TypedArrayConstructor[] = [
	Int8Array,
	Uint8Array,
	Uint8ClampedArray,
	Int16Array,
	Uint16Array,
	Int32Array,
	Uint32Array,
	Float32Array,
	Float64Array,
	BigInt64Array,
	BigUint64Array
];

export function getSharedPrototypes<TBase, TValues extends TBase>(base: TBase, values: readonly TValues[]): TValues[] {
	let set = new Set<TValues>();
	for (let value of values) {
		let last = value;
		let next = Object.getPrototypeOf(value);
		while (true) {
			if (next == base) {
				next = last;
				set.add(next);
				break;
			}

			if (next == null)
				break;

			last = next;
			next = Object.getPrototypeOf(next);
		}
	}

	return Array.from(set);
}