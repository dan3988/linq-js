import type { Predicate, Select } from "./util.js";

function res<T>(done: false, value?: T): IteratorYieldResult<T>
function res<T>(done: true, value?: T): IteratorReturnResult<T>
function res(done: boolean, value?: any): IteratorResult<any, any> {
	return { done, value };
}

export class AsyncArrayIterator<T> implements AsyncIterableIterator<T> {
	readonly #thisArg: any;
	readonly #fn: () => Promise<T[]>;
	#promise: undefined | Promise<T[]>;

	constructor(thisArg: any, fn: () => Promise<T[]>) {
		this.#thisArg = thisArg;
		this.#fn = fn;
		this.#promise = undefined;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<T> {
		return this;
	}

	next(): Promise<IteratorResult<T>> {
		if (this.#promise == null)
			this.#promise = this.#fn.call(this.#thisArg);
		
		return this.#promise.then(v => v.length === 0 ? res(true) : res(false, v.shift()));
	}
}

export class ReverseIterator<T> implements IterableIterator<T> {
	readonly #values: readonly T[];
	#index: number;

	constructor(values: readonly T[]) {
		this.#values = values;
		this.#index = values.length;
	}

	[Symbol.iterator](): IterableIterator<T> {
		return this;
	}

	next(): IteratorResult<T> {
		if (this.#index === 0)
			return res(true);

		return res(false, this.#values[--this.#index]);
	}
}

export class EmptyIterator implements IterableIterator<never> {
	static readonly INSTANCE = new this();

	[Symbol.iterator](): IterableIterator<never> {
		return this;
	}

	next(): IteratorResult<never, undefined> {
		return res(true);
	}
}

export class SelectingIterator<T, V> implements IterableIterator<V> {
	readonly #iter: Iterator<T>;
	readonly #thisArg: any;
	readonly #select: Select<T, V>;

	constructor(iter: Iterable<T>, thisArg: any, select: Select<T, V>) {
		this.#iter = iter[Symbol.iterator]();
		this.#thisArg = thisArg;
		this.#select = select;
	}

	[Symbol.iterator](): IterableIterator<V> {
		return this;
	}

	next(): IteratorResult<V> {
		const result: IteratorResult<any> = this.#iter.next();
		if (!result.done)
			result.value = this.#select.call(this.#thisArg, result.value);
		
		return result;
	}
}

export class SelectingAsyncIterator<T, V> implements AsyncIterableIterator<V> {
	readonly #iter: AsyncIterator<T>;
	readonly #thisArg: any;
	readonly #select: Select<T, V>;

	constructor(iter: AsyncIterable<T>, thisArg: any, select: Select<T, V>) {
		this.#iter = iter[Symbol.asyncIterator]();
		this.#thisArg = thisArg;
		this.#select = select;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<V> {
		return this;
	}

	next() {
		return this.#iter.next().then((result: IteratorResult<any>) => {
			if (!result.done)
				result.value = this.#select.call(this.#thisArg, result.value);

			return result;
		});
	}
}

export class FilteringIterator<T> implements IterableIterator<T> {
	readonly #iter: Iterator<T>;
	readonly #thisArg: any;
	readonly #filter: Predicate<T>;

	constructor(iter: Iterator<T>, thisArg: any, filter: Predicate<T>) {
		this.#iter = iter;
		this.#thisArg = thisArg;
		this.#filter = filter;
	}

	[Symbol.iterator](): IterableIterator<T> {
		return this;
	}

	next(): IteratorResult<T> {
		while (true) {
			const result: IteratorResult<any> = this.#iter.next();
			if (result.done)
				return result;

			if (this.#filter.call(this.#thisArg, result.value))
				return result;
		}
		
	}
}

export class RangeIterator implements Iterable<number>, Iterator<number, number>, IterableIterator<number> {
	readonly #start: number;
	readonly #count: number;
	readonly #step: number;

	#index: number;
	#current: null | number;

	constructor(start: number, count: number, step: number) {
		this.#start = start;
		this.#count = count;
		this.#step = step;
		this.#index = 0;
		this.#current = null;
	}

	next(): IteratorResult<number, number> {
		if (this.#count === 0)
			return res(true, this.#start);

		if (this.#index === this.#count)
			return res(true, this.#current!);

		this.#index++;
		this.#current = this.#current == null ? this.#start : (this.#current + this.#step);
		return res(false, this.#current);
	}

	[Symbol.iterator](): this {
		return this;
	}
}

export class RepeatIterator<T> implements IterableIterator<T> {
	readonly #value: T;
	#remaining: number;

	constructor(value: T, count: number) {
		this.#value = value;
		this.#remaining = count;
	}

	next(): IteratorResult<T> {
		if (this.#remaining === 0)
			return res(true);

		this.#remaining--;
		return res(false, this.#value);
	}

	[Symbol.iterator](): IterableIterator<T> {
		return this;
	}
}

export class AsyncConcatIterator<T> implements AsyncIterableIterator<T> {
	readonly #iter: Iterator<AsyncIterable<T>>;
	#current: null | AsyncIterator<T>;
	#done: boolean;

	constructor(iter: Iterable<AsyncIterable<T>>) {
		this.#iter = iter[Symbol.iterator]();
		this.#current = null;
		this.#done = false;
	}

	async next(): Promise<IteratorResult<T, any>> {
		if (this.#done)
			return res(true);
		
		let current = this.#current;
		if (current == null) {
			let v = this.#iter.next();
			if (v.done) {
				this.#done = true;
				return res(true);
			}

			current = v.value[Symbol.asyncIterator]();
		}

		while (true) {
			while (true) {
				let { done, value } = await current.next();
				if (done)
					break;

				this.#current = current;
				return res(false, value);
			}

			let v = this.#iter.next();
			if (v.done) {
				this.#done = true;
				this.#current = null;
				return res(true);
			} else {
				current = v.value[Symbol.asyncIterator]();
			}
		}
	}

	[Symbol.asyncIterator](): this {
		return this;
	}
}

export class ConcatIterator<T> implements IterableIterator<T> {
	readonly #iter: Iterator<Iterable<T>>;
	#current: null | Iterator<T>;
	#done: boolean;

	constructor(iter: Iterable<Iterable<T>>) {
		this.#iter = iter[Symbol.iterator]();
		this.#current = null;
		this.#done = false;
	}

	next(): IteratorResult<T, any> {
		if (this.#done)
			return res(true);
		
		let current = this.#current;
		if (current == null) {
			let v = this.#iter.next();
			if (v.done) {
				this.#done = true;
				return res(true);
			}

			current = v.value[Symbol.iterator]();
		}

		while (true) {
			while (true) {
				let { done, value } = current.next();
				if (done)
					break;

				this.#current = current;
				return res(false, value);
			}

			let v = this.#iter.next();
			if (v.done) {
				this.#done = true;
				this.#current = null;
				return res(true);
			} else {
				current = v.value[Symbol.iterator]();
			}
		}
	}

	[Symbol.iterator](): this {
		return this;
	}
}