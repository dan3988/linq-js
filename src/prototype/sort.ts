import { ReverseIterator } from "../iterators.js";
import { LinqInternal } from "../linq-base.js";
import { Comparer, defaultCompare, getter, SelectType } from "../util.js";

function orderBy<T>(this: LinqInternal<T>, query: SelectType, comp: Comparer | undefined, desc: boolean) {
	if (comp == null)
		comp = defaultCompare;

	const select = typeof query === 'function' ? query : getter.bind(undefined, query);

	return new LinqOrdered<T>(this, desc, (x, y) => {
		x = select(x);
		y = select(y);
		return comp!(x, y);
	});
}

/** @internal */
export class LinqOrdered<T> extends LinqInternal<T> {
	readonly #source: LinqInternal<T>;
	readonly #desc: boolean;
	readonly #comp: undefined | Comparer<T>;

	get length(): number | undefined {
		return this.#source.length;
	}

	constructor(source: LinqInternal<T>, desc: boolean, comp: undefined | Comparer<T>) {
		super();
		this.#source = source;
		this.#comp = comp;
		this.#desc = desc;
	}

	source(): Iterator<T> {
		let all = this.#source.toArray().sort(this.#comp);
		let iterator = this.#desc ? new ReverseIterator(all) : all;
		return iterator[Symbol.iterator]();
	}
}

LinqInternal.prototype.order = function(comp?: Comparer) {
	if (comp == null)
		comp = defaultCompare;

	return new LinqOrdered(this, false, comp);
}

LinqInternal.prototype.orderDesc = function(comp?: Comparer) {
	if (comp == null)
		comp = defaultCompare;

	return new LinqOrdered(this, true, comp);
}

LinqInternal.prototype.orderBy = function(query: SelectType, comp?: Comparer) {
	return orderBy.call(this, query, comp, false);
}

LinqInternal.prototype.orderByDesc = function(query: SelectType, comp?: Comparer) {
	return orderBy.call(this, query, comp, true);
}
