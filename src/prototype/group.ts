import type { Grouping } from "../linq-common.js";
import { Linq, LinqInternal, LinqCommon, AsyncLinq } from "../linq.js";
import { compileQuery, Select, SelectType } from "../util.js";

/** @internal */
export class GroupingImpl<K, V> implements Grouping<K, V> {
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
// @ts-ignore - ignore invalid build error caused by the signature of the join() function
export class LinqGrouped<K, V> extends LinqInternal<Grouping<K, V>> {
	readonly #source: LinqInternal<V>;
	readonly #query: Select<V, K>;

	constructor(source: LinqInternal<V>, query: Select<V, K>) {
		super();
		this.#source = source;
		this.#query = query;
	}

	*[Symbol.iterator]() {
		const map = buildGrouping(this.#source, this.#query);

		for (const [key, values] of map)
			yield new GroupingImpl(key, values);
	}
}

/** @internal */
// @ts-ignore - ignore invalid build error caused by the signature of the join() function
export class AsyncLinqGrouped<K, V> extends AsyncLinq<Grouping<K, V>> {
	readonly #source: AsyncLinq<V>;
	readonly #query: Select<V, K>;

	constructor(source: AsyncLinq<V>, query: Select<V, K>) {
		super(undefined!);
		this.#source = source;
		this.#query = query;
	}

	async *[Symbol.asyncIterator]() {
		const map = await buildGrouping(this.#source, this.#query);

		for (const [key, values] of map)
			yield new GroupingImpl(key, values);
	}
}

/** @internal */
export function buildGrouping<K, V>(linq: Linq<V>, query: Select<V, K>): Map<K, V[]>;
export function buildGrouping<K, V>(linq: AsyncLinq<V>, query: Select<V, K>): Promise<Map<K, V[]>>;
export function buildGrouping<K, V>(linq: LinqCommon<V>, query: Select<V, K>) {
	return linq.aggregate(new Map(), (map, value) => {
		let key = query(value);
		let array = map.get(key);
		if (array == null)
			map.set(key, array = []);

		array.push(value);
		return map;
	});
}

LinqInternal.prototype.groupBy = function(query: SelectType) {
	const select = compileQuery(query, true);
	return new LinqGrouped(this, select);
}

AsyncLinq.prototype.groupBy = function(query: SelectType) {
	const select = compileQuery(query, true);
	return new AsyncLinqGrouped(this, select);
}
