import { RepeatIterator } from "../iterators.js";
import { LinqInternal } from "../linq.js";
import { errNoElements, invokeSelect, NumberLike, Predicate, SelectType } from "../util.js";

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

	#getAny(required: true, def: undefined, query?: Predicate<T>): T
	#getAny<V>(required: false, def: V, query?: Predicate<T>): T | V;
	#getAny(required: boolean, def?: any, query?: Predicate<T>): any {
		if (this.#count !== 0 && (query == null || query(this.#value)))
			return this.#value;

		if (!required)
			return def;

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

	first(query?: Predicate<T>): T {
		return this.#getAny(true, undefined, query);
	}

	firstOrDefault<V = undefined>(query?: Predicate<T>, def?: V) {
		return this.#getAny(false, def, query);
	}

	last(query?: Predicate<T>) {
		return this.#getAny(true, undefined, query);
	}

	lastOrDefault<V = undefined>(query?: Predicate<T>, def?: V) {
		return this.#getAny(false, def, query);
	}

	any(predicate?: Predicate<T>): boolean {
		return predicate == null ? this.#count > 0 : predicate(this.#value);
	}

	all(predicate: Predicate<T>): boolean {
		return this.#count === 0 || predicate(this.#value);
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

	[Symbol.iterator](): IterableIterator<T> {
		return new RepeatIterator(this.#value, this.#count);
	}
}
