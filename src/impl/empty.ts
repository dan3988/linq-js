import { EmptyIterator } from "../iterators";
import { Linq } from "../linq-base.js";
import { LinqInternal, LinqOrdered } from "../linq-base";
import { errNoElements } from "../util";

export class EmptyLinq extends LinqInternal<never> implements LinqOrdered<never>, Linq<never> {
	static readonly instance = new this();
	
	get length() {
		return 0;
	}

	private constructor() {
		super(EmptyIterator.INSTANCE)
	}

	count(): number {
		return 0;
	}

	ofType() {
		return this;
	}

	any() {
		return false;
	}

	where() {
		return this;
	}

	all() {
		return true;
	}

	select() {
		return this;
	}

	selectMany() {
		return this;
	}

	distinct() {
		return this;
	}

	groupBy() {
		return this;
	}

	groupJoin() {
		return this;
	}

	join() {
		return this;
	}

	skip() {
		return this;
	}

	take() {
		return this;
	}

	zip() {
		return this;
	}

	first(): never {
		throw errNoElements();
	}

	firstOrDefault<V>(def: V) {
		return def;
	}

	last(): never {
		throw errNoElements();
	}

	lastOrDefault<V>(def: V) {
		return def;
	}

	order() {
		return this;
	}

	orderDesc() {
		return this;
	}

	orderBy() {
		return this;
	}

	orderByDesc() {
		return this;
	}

	thenBy() {
		return this;
	}

	thenByDesc() {
		return this;
	}

	toArray() {
		return [];
	}

	toObject() {
		return {};
	}
	
	toMap() {
		return new Map<never, never>();
	}

	toSet() {
		return new Set<never>();
	}
}