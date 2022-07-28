import { addFactory, Linq, LinqInternal } from "./linq-base.js";
import { LinqArray } from "./impl/array.js";
import { LinqRange } from "./impl/range.js";
import { LinqRepeat } from "./impl/repeat.js";
import { LinqConcat } from "./impl/concat.js";
import { LinqSet } from "./impl/set.js";
import { LinqSelect } from "./prototype/query.js";
import type { BiSelect, Predictate } from "./util.js";
import { EmptyIterator, FilteringIterator } from "./iterators.js";

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
	let linq: LinqInternal = new LinqArray(source);
	if (select != null)
		linq = new LinqSelect(linq, a => select.apply(undefined, a));

	return linq;
}

Object.defineProperty(LinqInternal, 'length', {
	configurable: true,
	value: null
})

LinqInternal.prototype.source = function() {
	return EmptyIterator.INSTANCE;
}

LinqInternal.prototype[Symbol.iterator] = function() {
	let iter = this.source();
	return this.predictate == null ? iter : new FilteringIterator(iter, this, this.predictate);
}

LinqInternal.prototype.count = function(filter?: Predictate) {
	let len = this.length;
	if (len != null)
		return len;

	let i = 0;
	for (let value of this)
		if (filter == null || filter(value))
			i++;

	return i;
}

LinqInternal.prototype.any = function(filter?: Predictate) {
	let en = this[Symbol.iterator]();
	let result = en.next();
	if (filter == null)
		return !result.done;

	while (true) {
		if (filter(result.value))
			return true;

		if ((result = en.next()).done)
			return false;
	}
}

LinqInternal.prototype.concat = function(...values) {
	values.unshift(this);
	return new LinqConcat<any>(values);
}

LinqInternal.prototype.join = function(sep) {
	return this.toArray().join(sep);
}

addFactory(<T>(v: Iterable<T>) => Array.isArray(v) ? new LinqArray<T>(v) : undefined);
addFactory(<T>(v: Iterable<T>) => v instanceof Map || v instanceof Set ? new LinqSet<T>(v) : undefined);