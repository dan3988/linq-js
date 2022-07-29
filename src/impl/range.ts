import { RangeIterator } from "../iterators.js";
import { LinqInternal } from "../linq-base.js";
import { errNoElements, getter, Predictate, SelectType } from "../util.js";

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

		if (typeof query !== 'function')
			query = getter.bind(undefined, query);

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

		if (typeof query !== 'function')
			query = getter.bind(undefined, query);

		let max = -Infinity;
		for (let i = 0; i < this.#count; i++, v += this.#step) {
			let val = query(v);
			if (max < val)
				max = val;
		}
		
		return max;
	}

	first(query?: Predictate<number>) {
		let v = this.firstOrDefault(query);
		if (v == null)
			throw errNoElements();

		return v;
	}

	firstOrDefault(query?: Predictate<number>) {
		if (this.#count === 0)
			throw errNoElements();

		let v = this.#start;
		if (query == null)
			return v;

		for (let i = 0; i < this.#count; i++, v += this.#step)
			if (query(v))
				return v;

		return undefined;
	}

	last(query?: Predictate<number>) {
		let v = this.lastOrDefault(query);
		if (v == null)
			throw errNoElements();

		return v;
	}

	lastOrDefault(query?: Predictate<number>) {
		if (this.#count === 0)
			throw errNoElements();

		let v = this.#start + (this.#count * this.#step);
		if (query == null)
			return v - this.#step;

		for (let i = 0; i < this.#count; i++)
			if (query(v -= this.#step))
				return v;

		return undefined;
	}

	[Symbol.iterator](): Iterator<number> {
		return new RangeIterator(this.#start, this.#count, this.#step);
	}
}
