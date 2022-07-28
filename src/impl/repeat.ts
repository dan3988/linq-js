import { RepeatIterator } from "../iterators.js";
import { LinqInternal } from "../linq-base.js";
import { errNoElements, invokeSelect, NumberLike, Predictate, SelectType } from "../util.js";

/** @internal */
export class LinqRepeat<T> extends LinqInternal<T> {
	readonly #value: T;
	readonly #count: number;

	get length(): number | undefined {
		return this.#count;
	}

	constructor(value: T, count: number) {
		super();
		this.#value = value;
		this.#count = count;
	}

	#getAny(required: true, query?: Predictate<T>): T
	#getAny(required: false, query?: Predictate<T>): T | undefined;
	#getAny(required: boolean, query?: Predictate<T>) {
		if (this.#count !== 0 && (query == null || query(this.#value)))
			return this.#value;

		if (!required)
			return undefined;

		throw errNoElements();
	}

	/**
	 * Because there is only one value, min(), max() and average() will all return the same value
	 * @param noVal the value to return if count is zero
	 */
	#getMinMaxAvg<V>(noVal: V, query?: SelectType<T, NumberLike>): number | V {
		if (this.#count === 0)
			return noVal;

		let val: any = this.#value;
		if (query != null)
			val = typeof query === 'function' ? query(val) : val[query];

		return +val;
	}
	
	max(query?: SelectType<T, NumberLike>) {
		return this.#getMinMaxAvg(-Infinity, query);
	}
	
	min(query?: SelectType<T, NumberLike>) {
		return this.#getMinMaxAvg(Infinity, query);
	}

	average(query?: SelectType<T, NumberLike>) {
		let v = this.#getMinMaxAvg(undefined, query);
		if (v === undefined)
			throw errNoElements();

		return v;
	}

	first(query?: Predictate<T>): T {
		return this.#getAny(true, query);
	}

	firstOrDefault(query?: Predictate<T>) {
		return this.#getAny(false, query);
	}

	last(query?: Predictate<T>) {
		return this.#getAny(true, query);
	}

	lastOrDefault(query?: Predictate<T>) {
		return this.#getAny(false, query);
	}

	toArray(): T[] {
		return Array(this.#count).fill(this.#value);
	}

	toObject(keySelector: SelectType<T>, valueSelector?: SelectType<T>) {
		let key = invokeSelect(this.#value, true, keySelector);
		let value = invokeSelect(this.#value, false, valueSelector);
		return { [key]: value };
	}

	toMap(keySelector: SelectType, valueSelector?: SelectType) {
		let key = invokeSelect(this.#value, true, keySelector);
		let value = invokeSelect(this.#value, false, keySelector);
		return new Map().set(key, value)
	}

	toSet(): Set<T> {
		return new Set([this.#value]);
	}

	source(): Iterator<T> {
		return new RepeatIterator(this.#value, this.#count);
	}
}
