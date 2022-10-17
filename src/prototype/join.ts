import { AsyncLinq } from "../linq-async.js";
import { Linq, LinqInternal } from "../linq-base.js";
import { compileQuery, defineFunction, Fn, Select } from "../util.js";
import { buildGrouping } from "./group.js";

class LinqJoin<TOuter, TInner, TKey, TResult> extends LinqInternal<TResult> {
	readonly #outer: Linq<TOuter>;
	readonly #outerSelector: Select<TOuter, TKey>;
	readonly #inner: Linq<TInner>;
	readonly #innerSelector: Select<TInner, TKey>;
	readonly #resultSelector: Fn<[TOuter, TInner], TResult>;
	
	constructor(outer: Linq<TOuter>, outerSelector: Select<TOuter, TKey>, inner: Linq<TInner>, innerSelector: Select<TInner, TKey>, resultSelector: Fn<[TOuter, TInner], TResult>) {
		super();
		this.#outer = outer;
		this.#outerSelector = outerSelector;
		this.#inner = inner;
		this.#innerSelector = innerSelector;
		this.#resultSelector = resultSelector;
	}

	*[Symbol.iterator]() {
		//const values = this.#inner.toMap(this.#innerSelector);
		const map = buildGrouping(this.#inner, this.#innerSelector);

		for (const value of this.#outer) {
			let key = this.#outerSelector.call(undefined, value);
			let others = map.get(key);
			if (others)
				for (const other of others)
					yield this.#resultSelector.call(undefined, value, other);
		}
	}
}

class AsyncLinqJoin<TOuter, TInner, TKey, TResult> extends AsyncLinq<TResult> {
	readonly #outer: AsyncLinq<TOuter>;
	readonly #outerSelector: Select<TOuter, TKey>;
	readonly #inner: AsyncLinq<TInner>;
	readonly #innerSelector: Select<TInner, TKey>;
	readonly #resultSelector: Fn<[TOuter, TInner], TResult>;
	
	constructor(outer: AsyncLinq<TOuter>, outerSelector: Select<TOuter, TKey>, inner: AsyncLinq<TInner>, innerSelector: Select<TInner, TKey>, resultSelector: Fn<[TOuter, TInner], TResult>) {
		super(undefined!);
		this.#outer = outer;
		this.#outerSelector = outerSelector;
		this.#inner = inner;
		this.#innerSelector = innerSelector;
		this.#resultSelector = resultSelector;
	}

	async *[Symbol.asyncIterator]() {
		//const values = this.#inner.toMap(this.#innerSelector);
		const map = await buildGrouping(this.#inner, this.#innerSelector);

		for await (const value of this.#outer) {
			let key = this.#outerSelector.call(undefined, value);
			let others = map.get(key);
			if (others)
				for (const other of others)
					yield this.#resultSelector.call(undefined, value, other);
		}
	}
}

defineFunction(LinqInternal.prototype, "join", function(inner, outerSelector, innerSelector, resultSelector) {
	outerSelector = compileQuery(outerSelector, true);
	innerSelector = compileQuery(innerSelector, true);
	resultSelector ??= (...args) => args as any;
	return new LinqJoin(this, outerSelector, inner, innerSelector, resultSelector);
})

defineFunction(AsyncLinq.prototype, "join", function(inner, outerSelector, innerSelector, resultSelector) {
	outerSelector = compileQuery(outerSelector, true);
	innerSelector = compileQuery(innerSelector, true);
	resultSelector ??= (...args) => args as any;
	return new AsyncLinqJoin(this, outerSelector, inner, innerSelector, resultSelector);
})