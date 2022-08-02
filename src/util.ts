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

async function asyncForEach<T>(values: AsyncIterable<T>, callback: IterCallback<T, void | [any]>) {
	const iter: AsyncIterator<T> = values[Symbol.asyncIterator]();
	while (true) {
		let result = await iter.next();
		let val = callback(result);
		if (val != null)
			return val[0];

		if (result.done)
			break;
	}
}

export function identity<T>(this: T): T {
	return this;
}