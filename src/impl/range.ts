import { RangeIterator } from "../iterators.js";
import { LinqInternal } from "../linq.js";
import { compileQuery, errNoElements, Predicate, SelectType } from "../util.js";

/** @internal */
export class LinqRange extends LinqInternal<number> {
	readonly #start: number;
	readonly #count: number;
	readonly #step: number;

	get length(): number | undefined {
		return this.#count;
	}

	constructor(start: number, count: number, step?: number) {
		super();
		this.#start = start;
		this.#count = count;
		this.#step = step ?? 1;
	}

	min(query?: SelectType): number {
		if (this.#count === 0)
			return Infinity;

		let v = this.#start;
		if (query == null)
			return v;

		query = compileQuery(query, true);

		let min = Infinity;
		for (let i = 0; i < this.#count; i++, v += this.#step) {
			let val = query(v);
			if (min > val)
				min = val;
		}
		
		return min;
	}

	max(query?: SelectType): number {
		if (this.#count === 0)
			return -Infinity;

		let v = this.#start;
		if (query == null)
			return v + (this.#step * (this.#count - 1));

		query = compileQuery(query, true);

		let max = -Infinity;
		for (let i = 0; i < this.#count; i++, v += this.#step) {
			let val = query(v);
			if (max < val)
				max = val;
		}
		
		return max;
	}

	first(query?: Predicate<number>) {
		let v = this.firstOrDefault(query);
		if (v == null)
			throw errNoElements();

		return v;
	}

	firstOrDefault<V = undefined>(query?: Predicate<number>, def?: V) {
		if (this.#count === 0)
			throw errNoElements();

		let v = this.#start;
		if (query == null)
			return v;

		for (let i = 0; i < this.#count; i++, v += this.#step)
			if (query(v))
				return v;

		return def;
	}

	last(query?: Predicate<number>) {
		let v = this.lastOrDefault(query);
		if (v == null)
			throw errNoElements();

		return v;
	}

	lastOrDefault<V = undefined>(query?: Predicate<number>, def?: V) {
		if (this.#count === 0)
			throw errNoElements();

		let v = this.#start + (this.#count * this.#step);
		if (query == null)
			return v - this.#step;

		for (let i = 0; i < this.#count; i++)
			if (query(v -= this.#step))
				return v;

		return def;
	}

	any(predicate?: Predicate<number>): boolean {
		if (predicate == null)
			return this.#count > 0;

		let v = this.#start;
		for (let i = 0; i < this.#count; i++, v += this.#step)
			if (predicate(v))
				return true;

		return false;
	}

	all(predicate: Predicate<number>): boolean {
		let v = this.#start;
		for (let i = 0; i < this.#count; i++, v += this.#step)
			if (!predicate(v))
				return false;

		return true;
	}

	[Symbol.iterator](): IterableIterator<number> {
		return new RangeIterator(this.#start, this.#count, this.#step);
	}
}
