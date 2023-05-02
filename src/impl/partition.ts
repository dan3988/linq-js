import Linq, { LinqInternal } from "../linq-base";

/** @internal */
export class LinqPartition<T> extends LinqInternal<T> {
	readonly #source: LinqInternal<T>;
	readonly #length: undefined | number;
	readonly #offset: number;
	readonly #count: undefined | number;

	get length() {
		return this.#length;
	}

	constructor(source: LinqInternal<T>, offset: number, count?: number) {
		super(source);
		let len = source.length;
		this.#length = len && Math.max(0, len - offset);
		this.#source = source;
		this.#offset = offset;
		this.#count = count;
	}

	take(count: number): Linq<T> {
		const current = this.#count;
		if (count > current!)
			count = current!;

		return new LinqPartition(this.#source, this.#offset, count);
	}

	skip(n: number): Linq<T> {
		const offset = this.#offset;
		let count = this.#count;
		if (count != null)
			count = Math.max(0, count - n);

		return new LinqPartition(this.#source, offset + n, count);
	}
	
	*[Symbol.iterator](): IterableIterator<T> {
		const it = super[Symbol.iterator]();
		const [offset, count] = [this.#offset, this.#count];
		for (let i = 0; i < offset; i++) {
			const { done } = it.next();
			if (done)
				return;
		}
		
		if (count == null) {
			for (const value of it)
				yield value;
		} else {
			for (let i = count; --i >= 0; ) {
				const { done, value } = it.next();
				if (done)
					break;

				yield value;
			}
		}
	}
}