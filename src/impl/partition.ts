import Linq, { LinqInternal, AsyncLinq } from "../linq";

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

/** @internal */
export class AsyncLinqPartition<T> extends AsyncLinq<T> {
	readonly #source: AsyncLinq<T>;
	readonly #offset: number;
	readonly #count: undefined | number;

	constructor(source: AsyncLinq<T>, offset: number, count?: number) {
		super(source);
		this.#source = source;
		this.#offset = offset;
		this.#count = count;
	}

	take(count: number): AsyncLinq<T> {
		const current = this.#count;
		if (count > current!)
			count = current!;

		return new AsyncLinqPartition(this.#source, this.#offset, count);
	}

	skip(n: number): AsyncLinq<T> {
		const offset = this.#offset;
		let count = this.#count;
		if (count != null)
			count = Math.max(0, count - n);

		return new AsyncLinqPartition(this.#source, offset + n, count);
	}
	
	async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
		const it = super[Symbol.asyncIterator]();
		const [offset, count] = [this.#offset, this.#count];
		for (let i = 0; i < offset; i++) {
			const { done } = await it.next();
			if (done)
				return;
		}
		
		if (count == null) {
			for await (const value of it)
				yield value;
		} else {
			for (let i = count; --i >= 0; ) {
				const { done, value } = await it.next();
				if (done)
					break;

				yield value;
			}
		}
	}
}