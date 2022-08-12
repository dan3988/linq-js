import { LinqInternal } from "../linq-base.js";
import { errNoElements, Predictate } from "../util.js";

interface ReadOnlyArray<T> extends Iterable<T> {
	readonly length: number;
	readonly [i: number]: T;
}

/** @internal */
export class LinqArray<T> extends LinqInternal<T> {
	readonly #source: ReadOnlyArray<T>;

	get length(): number {
		return this.#source.length;
	}

	constructor(source: ReadOnlyArray<T>) {
		super();
		this.#source = source;
	}

	#first(query: undefined | Predictate<T>, required: true): T;
	#first(query: undefined | Predictate<T>, required: false): T | undefined;
	#first(query: undefined | Predictate<T>, required: boolean) {
		let array = this.#source;
		if (array.length !== 0) {
			if (query == null)
				return array[0];
	
			let i = 0;
			while(true) {
				let v = array[i];
				if (query(v))
					return v;
	
				if (++i === array.length)
					break;
			}
		}

		if (required)
			throw errNoElements();

		return undefined;
	}

	#last(query: undefined | Predictate<T>, required: true): T;
	#last(query: undefined | Predictate<T>, required: false): T | undefined;
	#last(query: undefined | Predictate<T>, required: boolean) {
		let array = this.#source;
		if (array.length !== 0) {
			let i = array.length - 1;
			if (query == null)
				return array[i];
	
			while(true) {
				let v = array[i];
				if (query(v))
					return v;
	
				if (--i === -1)
					break;
			}
		}

		if (required)
			throw errNoElements();

		return undefined;
	}

	first(query?: Predictate<T>) {
		return this.#first(query, true);
	}

	firstOrDefault(query?: Predictate<T>) {
		return this.#first(query, false);
	}

	last(query?: Predictate<T>) {
		return this.#last(query, true);
	}

	lastOrDefault(query?: Predictate<T>) {
		return this.#last(query, false);
	}

	any(predictate?: Predictate<T>): boolean {
		const source = this.#source;
		if (predictate == null)
			return source.length !== 0;

		for (let i = 0; i < source.length; i++)
			if (predictate(source[i]))
				return true;

		return false;
	}

	all(predictate: Predictate<T>): boolean {
		const source = this.#source;
		for (let i = 0; i < source.length; i++)
			if (!predictate(source[i]))
				return false;

		return true;
	}

	count() {
		return this.#source.length;
	}

	toArray(): T[] {
		return Array.from(this.#source)
	}

	toSet(): Set<T> {
		return new Set(this.#source);
	}

	[Symbol.iterator](): Iterator<T> {
		return this.#source[Symbol.iterator]();
	}
}
