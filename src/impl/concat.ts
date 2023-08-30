import { AsyncConcatIterator, ConcatIterator } from '../iterators.js';
import { Linq, LinqInternal, AsyncLinq } from '../linq.js';

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
			let lq: LinqInternal<T> = value instanceof LinqInternal ? value : <any>Linq(value);
			l += lq.length ?? NaN;
			v.push(lq);
		}

		super();
		this.#values = v;
		this.#length = isNaN(l) ? undefined : l;
	}

	concat<V>(...values: Iterable<V>[]): Linq<T | V>
	concat(...values: Iterable<any>[]): Linq<any> {
		return new LinqConcat<any>([...this.#values, ...values]);
	}

	[Symbol.iterator](): IterableIterator<T> {
		return new ConcatIterator(this.#values[Symbol.iterator]());
	}
}

/** @internal */
export class AsyncLinqConcat<T> extends AsyncLinq<T> {
	readonly #values: AsyncLinq<T>[];

	constructor(values: readonly AsyncIterable<T>[]) {
		let v: AsyncLinq<T>[] = [];
		for (let value of values) {
			let lq: AsyncLinq<T> = value instanceof AsyncLinq ? value : Linq(value);
			v.push(lq);
		}

		super(undefined!);
		this.#values = v;
	}

	concat<V>(...values: AsyncIterable<V>[]): AsyncLinq<T | V>
	concat(...values: AsyncIterable<any>[]): AsyncLinq<any> {
		return new AsyncLinqConcat<any>([...this.#values, ...values]);
	}

	[Symbol.iterator](): AsyncIterableIterator<T> {
		return new AsyncConcatIterator(this.#values);
	}
}
