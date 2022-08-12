import { AsyncLinq, LinqInternal } from "../linq-base.js";

class LinqDistinct<T> extends LinqInternal<T> {
	readonly #source: LinqInternal<T>;

	constructor(soruce: LinqInternal<T>) {
		super();
		this.#source = soruce;
	}

	*[Symbol.iterator]() {
		let set = new Set();
		let c = 0;
		for (let value of this.#source) {
			if (c !== set.add(value).size) {
				c++;
				yield value;
			}
		}
	}
}

class AsyncLinqDistinct<T> extends AsyncLinq<T> {
	readonly #source: AsyncLinq<T>;

	constructor(soruce: AsyncLinq<T>) {
		super(undefined!);
		this.#source = soruce;
	}

	async *[Symbol.asyncIterator]() {
		let set = new Set();
		let c = 0;
		for await (let value of this.#source) {
			if (c !== set.add(value).size) {
				c++;
				yield value;
			}
		}
	}
}

LinqInternal.prototype.distinct = function() {
	return new LinqDistinct(this);
}

AsyncLinq.prototype.distinct = function() {
	return new AsyncLinqDistinct(this);
}