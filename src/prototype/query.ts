import { ConcatIterator, SelectingIterator } from '../iterators.js';
import { Linq, LinqInternal } from '../linq-base.js';
import { getter, isInstance, isType, Predictate, Select, SelectType } from '../util.js';

/** @internal */
export class LinqSelect<T, V> extends LinqInternal<V> {
	readonly #source: LinqInternal<T>;
	readonly #select: Select<T, V>;

	get length(): number | undefined {
		return this.#source.length;
	}

	constructor(iter: LinqInternal<T>, select: Select<T, V>) {
		super();
		this.#source = iter;
		this.#select = select;
	}

	source(): Iterator<V> {
		return new SelectingIterator(this.#source, undefined, this.#select);
	}
}

/** @internal */
export class LinqSelectMany<T, V> extends LinqInternal<V> {
	readonly #source: LinqInternal<T>;
	readonly #select: Select<T, Iterable<V>>;

	constructor(iter: LinqInternal<T>, select: Select<T, Iterable<V>>) {
		super();
		this.#source = iter;
		this.#select = select;
	}

	source(): Iterator<V> {
		let select = new SelectingIterator(this.#source, undefined, this.#select);
		return new ConcatIterator(select);
	}
}

/** @internal */
export class LinqFiltered<T> extends LinqInternal<T> {
	readonly #source: LinqInternal<T>;
	readonly #predictate: Predictate<T>;

	constructor(source: LinqInternal<T>, predictate: Predictate<T>) {
		super();
		this.#source = source;
		this.#predictate = predictate;
	}

	source(): Iterator<T> {
		return this.#source.source();
	}

	predictate(value: T): boolean {
		let base = this.#source.predictate;
		return (base == null || base.call(this.#source, value)) && this.#predictate(value);
	}
}

LinqInternal.prototype.where = function(filter: Predictate) {
	return new LinqFiltered(this, filter);
}

LinqInternal.prototype.select = function(query: SelectType) {
	if (typeof query != 'function')
		query = getter.bind(undefined, query);

	return new LinqSelect(this, query);
}

LinqInternal.prototype.selectMany = function(query: SelectType) {
	if (typeof query != 'function')
		query = getter.bind(undefined, query);

	return new LinqSelectMany(this, query);
}

LinqInternal.prototype.ofType = function(type: string | Function): Linq<any> {
	return new LinqFiltered(this, typeof type === 'string' ? isType.bind(undefined, type) : isInstance.bind(undefined, type));
}
