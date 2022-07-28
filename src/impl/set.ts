import type { MapOrSet } from "../util.js";
import { LinqInternal } from "../linq-base.js";

/** @internal */
export class LinqSet<T> extends LinqInternal<T> {
	readonly #source: MapOrSet<T>;

	get length(): number {
		return this.#source.size;
	}

	constructor(source: MapOrSet<T>) {
		super();
		this.#source = source;
	}

	count() {
		return this.#source.size;
	}

	any() {
		return this.#source.size > 0;
	}

	toSet(): Set<T> {
		return new Set(this.#source);
	}

	source(): Iterator<T> {
		return this.#source[Symbol.iterator]();
	}
}
