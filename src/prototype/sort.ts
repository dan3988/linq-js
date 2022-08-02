import { AsyncArrayIterator } from "../iterators.js";
import { AsyncLinq, AsyncLinqOrdered, LinqInternal, LinqOrdered } from "../linq-base.js";
import { Comparer, compileQuery, defaultCompare, firstArg, Select, SelectType, TupleArray } from "../util.js";

type Ordering = [query: Select, comp: Comparer, desc: boolean];
type Orderings = TupleArray<Ordering>;

function sort<T>(orderings: Orderings, x: T, y: T) {
	for (let i = 0; i < orderings.length; i++) {
		let [query, comp, desc] = orderings.get(i)!;
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

/** @internal */
export class LinqOrderedImpl<T> extends LinqInternal<T> implements LinqOrdered<T> {
	readonly #source: LinqInternal<T>;
	readonly #orderings: Orderings;

	get length(): number | undefined {
		return this.#source.length;
	}

	constructor(source: LinqInternal<T>, query: Select, comp: undefined | Comparer<T>, desc: boolean) {
		super();
		this.#source = source;
		this.#orderings = new TupleArray<Ordering>(3).push(query, comp ?? defaultCompare, desc);
	}

	#next(query: SelectType, comparer: undefined | Comparer, desc: boolean) {
		const select = compileQuery(query, true);
		const next = new LinqOrderedImpl(this.#source, select, comparer, desc);
		next.#orderings.insert(0, this.#orderings);
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
	readonly #orderings: Orderings;

	constructor(source: AsyncLinq<T>, query: Select, comp: undefined | Comparer<T>, desc: boolean) {
		super(undefined!);
		this.#source = source;
		this.#orderings = new TupleArray<Ordering>(3).push(query, comp ?? defaultCompare, desc);
	}

	#next(query: SelectType, comparer: undefined | Comparer, desc: boolean) {
		const select = compileQuery(query, true);
		const next = new AsyncLinqOrderedImpl(this.#source, select, comparer, desc);
		next.#orderings.insert(0, this.#orderings);
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
	return new LinqOrderedImpl(this, firstArg, comp, false);
}

LinqInternal.prototype.orderDesc = function(comp?: Comparer) {
	return new LinqOrderedImpl(this, firstArg, comp, true);
}

LinqInternal.prototype.orderBy = function(query: SelectType, comp?: Comparer) {
	const select = compileQuery(query, true);
	return new LinqOrderedImpl(this, select, comp, false);
}

LinqInternal.prototype.orderByDesc = function(query: SelectType, comp?: Comparer) {
	const select = compileQuery(query, true);
	return new LinqOrderedImpl(this, select, comp, true);
}

AsyncLinq.prototype.order = function(comp?: Comparer) {
	return new AsyncLinqOrderedImpl(this, firstArg, comp, false);
}

AsyncLinq.prototype.orderDesc = function(comp?: Comparer) {
	return new AsyncLinqOrderedImpl(this, firstArg, comp, true);
}

AsyncLinq.prototype.orderBy = function(query: SelectType, comp?: Comparer) {
	const select = compileQuery(query, true);
	return new AsyncLinqOrderedImpl(this, select, comp, false);
}

AsyncLinq.prototype.orderByDesc = function(query: SelectType, comp?: Comparer) {
	const select = compileQuery(query, true);
	return new AsyncLinqOrderedImpl(this, select, comp, true);
}
