import { AsyncLinq, LinqInternal } from "../linq.js";
import { BiSelect } from "../util.js";

class LinqZip<X, Y, V> extends LinqInternal<V> {
	readonly #left: LinqInternal<X>;
	readonly #right: LinqInternal<Y>;
	readonly #select: BiSelect<X, Y, V>;

	get length(): number | undefined {
		let x = this.#left.length;
		if (x == null)
			return undefined;

		let y = this.#right.length;
		if (y == null)
			return undefined;

		return x > y ? y : x;
	}

	constructor(left: LinqInternal<X>, right: LinqInternal<Y>, select: BiSelect<X, Y, V>) {
		super();
		this.#left = left;
		this.#right = right;
		this.#select = select;
	}

	*[Symbol.iterator]() {
		let left = this.#left[Symbol.iterator]();
		let right = this.#right[Symbol.iterator]();

		while (true) {
			let vl = left.next();
			if (vl.done)
				break;

			let vr = right.next();
			if (vr.done)
				break;

			yield this.#select(vl.value, vr.value);
		}
	}
}

class AsyncLinqZip<X, Y, V> extends AsyncLinq<V> {
	readonly #left: AsyncLinq<X>;
	readonly #right: AsyncLinq<Y>;
	readonly #select: BiSelect<X, Y, V>;

	constructor(left: AsyncLinq<X>, right: AsyncLinq<Y>, select: BiSelect<X, Y, V>) {
		super(undefined!);
		this.#left = left;
		this.#right = right;
		this.#select = select;
	}

	async *[Symbol.asyncIterator]() {
		let left = this.#left[Symbol.asyncIterator]();
		let right = this.#right[Symbol.asyncIterator]();

		while (true) {
			let vl = await left.next();
			if (vl.done)
				break;

			let vr = await right.next();
			if (vr.done)
				break;

			yield this.#select(vl.value, vr.value);
		}
	}
}

LinqInternal.prototype.zip = function(other, select) {
	return new LinqZip(this, other instanceof LinqInternal ? other : LinqInternal(other), select);
}

AsyncLinq.prototype.zip = function(other, select) {
	return new AsyncLinqZip(this, other instanceof AsyncLinq ? other : LinqInternal(other), select);
}