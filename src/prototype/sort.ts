import { AsyncArrayIterator, ReverseIterator } from "../iterators.js";
import { AsyncLinq, AsyncLinqOrdered, LinqInternal, LinqOrdered } from "../linq-base.js";
import { Comparer, defaultCompare, firstArg, getter, Select, SelectType } from "../util.js";

function orderBy<T>(linq: LinqInternal<T>, query: SelectType, comp: Comparer | undefined, desc: boolean): LinqOrdered<T>;
function orderBy<T>(linq: AsyncLinq<T>, query: SelectType, comp: Comparer | undefined, desc: boolean): AsyncLinqOrdered<T>;
function orderBy(linq: any, query: SelectType, comp: Comparer | undefined, desc: boolean): any {
	if (comp == null)
		comp = defaultCompare;

	const select = typeof query === 'function' ? query : getter.bind(undefined, query);
	const ctor = (linq instanceof AsyncLinq ? AsyncLinqOrderedImpl : LinqOrderedImpl);

	return new ctor(linq, select, comp, desc);
}

function sort<T>(orderings: any[], x: T, y: T) {
	for (let i = 0; i < orderings.length; ) {
		let query: Select = orderings[i++];
		let comp: Comparer = orderings[i++];
		let desc: boolean = orderings[i++];
		let left = query(x);
		let right = query(y);
		let res = comp(left, right);
		if (res === 0) {
			continue;
		} else {
			return desc ? -res : res;
		}
	}

	return 0;
}

type Ordering = [query: Select, comp: undefined | Comparer, desc: boolean];

/** @internal */
export class LinqOrderedImpl<T> extends LinqInternal<T> implements LinqOrdered<T> {
	readonly #source: LinqInternal<T>;
	readonly #orderings: [...Ordering, ...any[]];

	get length(): number | undefined {
		return this.#source.length;
	}

	constructor(source: LinqInternal<T>, query: Select, comp: undefined | Comparer<T>, desc: boolean) {
		super();
		this.#source = source;
		this.#orderings = [query, comp, desc];
	}

	#next(query: SelectType, comparer: undefined | Comparer, desc: boolean) {
		if (typeof query !== 'function')
			query = getter.bind(undefined, query);

		if (comparer == null)
			comparer = defaultCompare;
	
		let next = new LinqOrderedImpl(this.#source, query, comparer, desc);
		Array.prototype.unshift.apply(next.#orderings, this.#orderings);
		return next;
	}

	thenBy<K extends keyof T>(query: K, comparer?: Comparer<T[K]> | undefined): LinqOrdered<T>;
	thenBy<V>(query: Select<T, V>, comparer?: Comparer<V> | undefined): LinqOrdered<T>;
	thenBy(query: any, comparer?: any): LinqOrdered<T> {
		return this.#next(query, comparer, false);
	}

	thenByDesc<K extends keyof T>(query: K, comparer?: Comparer<T[K]> | undefined): LinqOrdered<T>;
	thenByDesc<V>(query: Select<T, V>, comparer?: Comparer<V> | undefined): LinqOrdered<T>;
	thenByDesc(query: any, comparer?: any): LinqOrdered<T> {
		return this.#next(query, comparer, true);
	}

	toArray(): T[] {
		const s = sort.bind(undefined, this.#orderings);
		return this.#source.toArray().sort(s);
	}

	[Symbol.iterator](): Iterator<T> {
		let arr = this.toArray();
		return arr[Symbol.iterator]();
	}
}

/** @internal */
export class AsyncLinqOrderedImpl<T> extends AsyncLinq<T> implements AsyncLinqOrdered<T> {
	readonly #source: AsyncLinq<T>;
	readonly #orderings: [...Ordering, ...any[]];

	constructor(source: AsyncLinq<T>, query: Select, comp: undefined | Comparer<T>, desc: boolean) {
		super(undefined!);
		this.#source = source;
		this.#orderings = [query, comp, desc];
	}

	#next(query: SelectType, comparer: undefined | Comparer, desc: boolean) {
		if (typeof query !== 'function')
			query = getter.bind(undefined, query);

		if (comparer == null)
			comparer = defaultCompare;
	
		let next = new AsyncLinqOrderedImpl(this.#source, query, comparer, desc);
		next.#orderings.unshift(this.#orderings);
		return next;
	}

	thenBy<K extends keyof T>(query: K, comparer?: Comparer<T[K]> | undefined): AsyncLinqOrdered<T>;
	thenBy<V>(query: Select<T, V>, comparer?: Comparer<V> | undefined): AsyncLinqOrdered<T>;
	thenBy(query: any, comparer?: any): AsyncLinqOrdered<T> {
		return this.#next(query, comparer, false);
	}

	thenByDesc<K extends keyof T>(query: K, comparer?: Comparer<T[K]> | undefined): AsyncLinqOrdered<T>;
	thenByDesc<V>(query: Select<T, V>, comparer?: Comparer<V> | undefined): AsyncLinqOrdered<T>;
	thenByDesc(query: any, comparer?: any): AsyncLinqOrdered<T> {
		return this.#next(query, comparer, true);
	}

	toArray() {
		const s = sort.bind(undefined, this.#orderings);
		return this.#source.toArray().then(v => v.sort(s));
	}

	[Symbol.asyncIterator](): AsyncIterator<T> {
		return new AsyncArrayIterator(this, this.toArray);
	}
}

LinqInternal.prototype.order = function(comp?: Comparer) {
	if (comp == null)
		comp = defaultCompare;

	return new LinqOrderedImpl(this, firstArg, comp, false);
}

LinqInternal.prototype.orderDesc = function(comp?: Comparer) {
	if (comp == null)
		comp = defaultCompare;

	return new LinqOrderedImpl(this, firstArg, comp, true);
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

	return new AsyncLinqOrderedImpl(this, firstArg, comp, false);
}

AsyncLinq.prototype.orderDesc = function(comp?: Comparer) {
	if (comp == null)
		comp = defaultCompare;

	return new AsyncLinqOrderedImpl(this, firstArg, comp, true);
}

AsyncLinq.prototype.orderBy = function(query: SelectType, comp?: Comparer) {
	return orderBy(this, query, comp, false);
}

AsyncLinq.prototype.orderByDesc = function(query: SelectType, comp?: Comparer) {
	return orderBy(this, query, comp, true);
}
