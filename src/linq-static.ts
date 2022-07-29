import { addFactory, Linq, AsyncLinq, LinqInternal } from "./linq-base.js";
import { LinqArray } from "./impl/array.js";
import { LinqRange } from "./impl/range.js";
import { LinqRepeat } from "./impl/repeat.js";
import { LinqSet } from "./impl/set.js";
import type { BiSelect } from "./util.js";
import { EmptyIterator } from "./iterators.js";

Linq.empty = function<T>() {
	return LinqInternal.prototype as LinqInternal<T>;
}

Linq.range = function(start, count, step) {
	return new LinqRange(start, count, step);
}

Linq.repeat = function(value, count) {
	return new LinqRepeat(value, count);
}

Linq.fromObject = function(obj: object, select?: BiSelect<string>) {
	let source = Object.entries(obj);
	let linq: Linq = new LinqArray(source);
	if (select != null)
		linq = linq.select(a => select.apply(undefined, a));

	return linq;
}

Object.defineProperty(LinqInternal, 'length', {
	configurable: true,
	value: null
})

LinqInternal.prototype[Symbol.iterator] = function() {
	return EmptyIterator.INSTANCE;
}

addFactory(v => Symbol.asyncIterator in v ? new AsyncLinq(v as any) : undefined);
addFactory(v => v instanceof Map || v instanceof Set ? new LinqSet(v) : undefined);
addFactory(v => Array.isArray(v) ? new LinqArray(v) : undefined);