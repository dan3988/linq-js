import { AsyncArrayIterator, ReverseIterator } from "../iterators.js";
import { AsyncLinq, LinqInternal } from "../linq-base.js";
import { Comparer, defaultCompare, getter, SelectType } from "../util.js";

function orderBy<T>(linq: LinqInternal<T>, query: SelectType, comp: Comparer | undefined, desc: boolean): LinqOrdered<T>;
function orderBy<T>(linq: AsyncLinq<T>, query: SelectType, comp: Comparer | undefined, desc: boolean): AsyncLinqOrdered<T>;
function orderBy(linq: any, query: SelectType, comp: Comparer | undefined, desc: boolean): any {
	if (comp == null)
		comp = defaultCompare;

	const select = typeof query === 'function' ? query : getter.bind(undefined, query);
	const ctor = (linq instanceof AsyncLinq ? AsyncLinqOrdered : LinqOrdered);

	return new ctor(linq, desc, (x, y) => {
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

	[Symbol.iterator](): Iterator<T> {
		let all = this.#source.toArray().sort(this.#comp);
		let iterator = this.#desc ? new ReverseIterator(all) : all;
		return iterator[Symbol.iterator]();
	}
}

/** @internal */
export class AsyncLinqOrdered<T> extends AsyncLinq<T> {
	readonly #desc: boolean;
	readonly #comp: undefined | Comparer<T>;

	constructor(source: AsyncLinq<T>, desc: boolean, comp: undefined | Comparer<T>) {
		super(source);
		this.#comp = comp;
		this.#desc = desc;
	}

	async #load() {
		let array = await this.toArray();
		array.sort(this.#comp);
		if (this.#desc)
			array.reverse();

		return array;
	}

	[Symbol.asyncIterator]() {
		return new AsyncArrayIterator(this, this.#load);
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
	return orderBy(this, query, comp, false);
}

LinqInternal.prototype.orderByDesc = function(query: SelectType, comp?: Comparer) {
	return orderBy(this, query, comp, true);
}

AsyncLinq.prototype.order = function(comp?: Comparer) {
	if (comp == null)
		comp = defaultCompare;

	return new AsyncLinqOrdered(this, false, comp);
}

AsyncLinq.prototype.orderDesc = function(comp?: Comparer) {
	if (comp == null)
		comp = defaultCompare;

	return new AsyncLinqOrdered(this, true, comp);
}

AsyncLinq.prototype.orderBy = function(query: SelectType, comp?: Comparer) {
	return orderBy(this, query, comp, false);
}

AsyncLinq.prototype.orderByDesc = function(query: SelectType, comp?: Comparer) {
	return orderBy(this, query, comp, true);
}
