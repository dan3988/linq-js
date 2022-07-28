import { ConcatIterator } from '../iterators.js';
import { Linq, LinqInternal } from '../linq-base.js';

/** @internal */
export class LinqConcat<T> extends LinqInternal<T> {
	readonly #values: Linq<T>[];
	readonly #length: number | undefined;

	get length(): number | undefined {
		return this.#length;
	}

	constructor(values: readonly Iterable<T>[]) {
		let l = 0;
		let v: Linq<T>[] = [];
		for (let value of values) {
			let lq: LinqInternal<T> = value instanceof LinqInternal ? value : LinqInternal(value);
			l += lq.length ?? NaN;
			v.push(lq);
		}

		super();
		this.#values = v;
		this.#length = isNaN(l) ? undefined : l;
	}

	source(): Iterator<T, any, undefined> {
		return new ConcatIterator(this.#values[Symbol.iterator]());
	}
}
