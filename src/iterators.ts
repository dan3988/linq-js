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