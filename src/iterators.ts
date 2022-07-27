import { Predictate, Select } from "./funcs";

function res<T>(done: false, value?: T): IteratorYieldResult<T>
function res<T>(done: true, value?: T): IteratorReturnResult<T>
function res(done: boolean, value?: any): IteratorResult<any, any> {
	return { done, value };
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

	constructor(iter: Iterator<T>, thisArg: any, select: Select<T, V>) {
		this.#iter = iter;
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

export class FilteringIterator<T> implements IterableIterator<T> {
	readonly #iter: Iterator<T>;
	readonly #thisArg: any;
	readonly #filter: Predictate<T>;

	constructor(iter: Iterator<T>, thisArg: any, filter: Predictate<T>) {
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

export class RangeIterator implements Iterable<number>, Iterator<number, number> {
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

	[Symbol.iterator](): Iterator<number, number, undefined> {
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

export class ConcatIterator<T> implements IterableIterator<T> {
	readonly #it: Iterator<Iterable<T>>;
	#current: null | Iterator<T>;
	#done: boolean;

	constructor(it: Iterator<Iterable<T>>) {
		this.#it = it;
		this.#current = null;
		this.#done = false;
	}

	next(): IteratorResult<T, any> {
		if (this.#done)
			return res(true);
		
		let current = this.#current;
		if (current == null) {
			let v = this.#it.next();
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

			let v = this.#it.next();
			if (v.done) {
				this.#done = true;
				this.#current = null;
				return res(true);
			} else {
				current = v.value[Symbol.iterator]();
			}
		}

	}

	[Symbol.iterator](): IterableIterator<T> {
		return this;
	}
}