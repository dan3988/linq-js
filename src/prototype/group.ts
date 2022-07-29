import { AsyncLinq, Grouping, LinqInternal } from "../linq-base.js";
import { getter, Select, SelectType } from "../util.js";

class GroupingImpl<K, V> implements Grouping<K, V> {
	readonly #key: K;
	readonly #values: readonly V[];

	get key() {
		return this.#key;
	}

	constructor(key: K, values: readonly V[]) {
		this.#key = key;
		this.#values = values;
	}

	[Symbol.iterator]() {
		return this.#values[Symbol.iterator]();
	}
}

/** @internal */
export class LinqGrouped<K, V> extends LinqInternal<Grouping<K, V>> {
	readonly #source: LinqInternal<V>;
	readonly #query: Select<V, K>;

	constructor(source: LinqInternal<V>, query: Select<V, K>) {
		super();
		this.#source = source;
		this.#query = query;
	}

	*[Symbol.iterator]() {
		let map = new Map<K, V[]>();
		for (let value of this.#source) {
			let key = this.#query(value);
			let array = map.get(key);
			if (array == null)
				map.set(key, array = []);

			array.push(value);
		}

		for (let [key, values] of map)
			yield new GroupingImpl(key, values);
	}
}

/** @internal */
export class AsyncLinqGrouped<K, V> extends AsyncLinq<Grouping<K, V>> {
	readonly #source: AsyncLinq<V>;
	readonly #query: Select<V, K>;

	constructor(source: AsyncLinq<V>, query: Select<V, K>) {
		super(undefined!);
		this.#source = source;
		this.#query = query;
	}

	async *[Symbol.asyncIterator]() {
		let map = new Map<K, V[]>();
		for await (let value of this.#source) {
			let key = this.#query(value);
			let array = map.get(key);
			if (array == null)
				map.set(key, array = []);

			array.push(value);
		}

		for (let [key, values] of map)
			yield new GroupingImpl(key, values);
	}
}

LinqInternal.prototype.groupBy = function(query: SelectType) {
	if (typeof query !== 'function')
		query = getter.bind(undefined, query);

	return new LinqGrouped(this, query);
}
