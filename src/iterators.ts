import { Predictate, Select } from "./funcs";

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
		if (this.#count == 0)
			return { done: true, value: this.#start };

		if (this.#index == this.#count)
			return { done: true, value: this.#current! };

		this.#index++;
		this.#current = this.#current == null ? this.#start : (this.#current + this.#step);
		return { done: false, value: this.#current };
	}

	[Symbol.iterator](): Iterator<number, number, undefined> {
		return this;
	}

}