import { AsyncLinq } from "../linq-async.js";
import { Linq, LinqInternal } from "../linq-base.js";
import { compileQuery, defineFunction, Fn, returnArgs, Select, SelectKeyType } from "../util.js";
import { buildGrouping } from "./group.js";

class LinqJoin<TOuter, TInner, TKey, TResult> extends LinqInternal<TResult> {
	readonly #outer: Linq<TOuter>;
	readonly #outerSelector: Select<TOuter, TKey>;
	readonly #inner: Linq<TInner>;
	readonly #innerSelector: Select<TInner, TKey>;
	readonly #isGroup: boolean;
	readonly #resultSelector: Fn<[TOuter, TInner | Iterable<TInner>], TResult>;
	
	constructor(outer: Linq<TOuter>, outerSelector: SelectKeyType<TOuter, TKey>, inner: Linq<TInner>, innerSelector: SelectKeyType<TInner, TKey>, isGroup: false, resultSelector?: Fn<[TOuter, TInner], TResult>)
	constructor(outer: Linq<TOuter>, outerSelector: SelectKeyType<TOuter, TKey>, inner: Linq<TInner>, innerSelector: SelectKeyType<TInner, TKey>, isGroup: true, resultSelector?: Fn<[TOuter, Iterable<TInner>], TResult>)
	constructor(outer: Linq<TOuter>, outerSelector: SelectKeyType<TOuter, TKey>, inner: Linq<TInner>, innerSelector: SelectKeyType<TInner, TKey>, isGroup: boolean, resultSelector?: Fn<[TOuter, TInner | Iterable<TInner>], TResult>) {
		super();
		this.#outer = outer;
		this.#outerSelector = compileQuery(outerSelector, true);
		this.#inner = inner;
		this.#innerSelector = compileQuery(innerSelector, true);
		this.#isGroup = isGroup;
		this.#resultSelector = resultSelector ?? <any>returnArgs;
	}

	*[Symbol.iterator]() {
		const map = buildGrouping(this.#inner, this.#innerSelector);

		for (const value of this.#outer) {
			let key = this.#outerSelector.call(undefined, value);
			let others = map.get(key);
			if (others != null) {
				if (this.#isGroup) {
					yield this.#resultSelector.call(undefined, value, others);
				} else {
					for (const other of others)
						yield this.#resultSelector.call(undefined, value, other);
				}
			}
		}
	}
}

class AsyncLinqJoin<TOuter, TInner, TKey, TResult> extends AsyncLinq<TResult> {
	readonly #outer: AsyncLinq<TOuter>;
	readonly #outerSelector: Select<TOuter, TKey>;
	readonly #inner: AsyncLinq<TInner>;
	readonly #innerSelector: Select<TInner, TKey>;
	readonly #isGroup: boolean;
	readonly #resultSelector: Fn<[TOuter, TInner | Iterable<TInner>], TResult>;
	
	constructor(outer: AsyncLinq<TOuter>, outerSelector: SelectKeyType<TOuter, TKey>, inner: AsyncLinq<TInner>, innerSelector: SelectKeyType<TInner, TKey>, isGroup: false, resultSelector?: Fn<[TOuter, TInner], TResult>)
	constructor(outer: AsyncLinq<TOuter>, outerSelector: SelectKeyType<TOuter, TKey>, inner: AsyncLinq<TInner>, innerSelector: SelectKeyType<TInner, TKey>, isGroup: true, resultSelector?: Fn<[TOuter, Iterable<TInner>], TResult>)
	constructor(outer: AsyncLinq<TOuter>, outerSelector: SelectKeyType<TOuter, TKey>, inner: AsyncLinq<TInner>, innerSelector: SelectKeyType<TInner, TKey>, isGroup: boolean, resultSelector?: Fn<[TOuter, TInner | Iterable<TInner>], TResult>) {
		super(undefined!);
		this.#outer = outer;
		this.#outerSelector = compileQuery(outerSelector, true);
		this.#inner = inner;
		this.#innerSelector = compileQuery(innerSelector, true);
		this.#isGroup = isGroup;
		this.#resultSelector = resultSelector ?? <any>returnArgs;
	}

	async *[Symbol.asyncIterator]() {
		const map = await buildGrouping(this.#inner, this.#innerSelector);

		for await (const value of this.#outer) {
			let key = this.#outerSelector.call(undefined, value);
			let others = map.get(key);
			if (others != null) {
				if (this.#isGroup) {
					yield this.#resultSelector.call(undefined, value, others);
				} else {
					for (const other of others)
						yield this.#resultSelector.call(undefined, value, other);
				}
			}
		}
	}
}

defineFunction(LinqInternal.prototype, "join", function (inner, outerSelector, innerSelector, resultSelector) {
	return new LinqJoin(this, outerSelector, Linq(inner), innerSelector, false, resultSelector);
})

defineFunction(LinqInternal.prototype, "groupJoin", function(inner, outerSelector, innerSelector, resultSelector) {
	return new LinqJoin(this, outerSelector, Linq(inner), innerSelector, true, resultSelector);
})

defineFunction(AsyncLinq.prototype, "join", function(inner, outerSelector, innerSelector, resultSelector) {
	return new AsyncLinqJoin(this, outerSelector, Linq(inner), innerSelector, false, resultSelector);
})

defineFunction(AsyncLinq.prototype, "groupJoin", function(inner, outerSelector, innerSelector, resultSelector) {
	return new AsyncLinqJoin(this, outerSelector, Linq(inner), innerSelector, true, resultSelector);
})
