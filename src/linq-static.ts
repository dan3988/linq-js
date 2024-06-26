import { Linq, LinqInternal, AsyncLinq } from "./linq.js";
import { LinqArray } from "./impl/array.js";
import { LinqRange } from "./impl/range.js";
import { LinqRepeat } from "./impl/repeat.js";
import { LinqSet } from "./impl/set.js";
import { BiSelect, getSharedPrototypes, TypedArray, typedArrayViews } from "./util.js";
import { EmptyLinq } from "./impl/empty";

Linq.isLinq = function(v): v is LinqInternal {
	return v instanceof LinqInternal;
}

Linq.isAsyncLinq = function(v): v is AsyncLinq {
	return v instanceof AsyncLinq;
}

Linq.empty = function() {
	return EmptyLinq.instance;
}

Linq.range = function(start, count, step) {
	return new LinqRange(start, count, step);
}

Linq.repeat = function(value, count) {
	return new LinqRepeat(value, count);
}

Linq.fromKeys = function(obj: object) {
	const keys = Object.keys(obj);
	return new LinqArray(keys);
}

Linq.fromObject = function(obj: object, select?: BiSelect<string>) {
	let source = Object.entries(obj);
	let linq: Linq<[string, any]> = new LinqArray(source);
	if (select != null)
		linq = linq.select(a => select.apply(undefined, a));

	return linq;
}

function linqCreateArray<T>(this: Array<T>): Linq<T> {
	return new LinqArray(this);
}

function linqCreateSet<T>(this: Set<T>): Linq<T> {
	return new LinqSet(this);
}

function linqCreateTypedArray<N extends number | bigint>(this: TypedArray<N>): Linq<N> {
	return new LinqArray(this);
}

Object.defineProperty(Array.prototype, Linq.create, {
	value: linqCreateArray
});

Object.defineProperty(Map.prototype, Linq.create, {
	value: linqCreateSet
});

Object.defineProperty(Set.prototype, Linq.create, {
	value: linqCreateSet
});

getSharedPrototypes(Function.prototype, typedArrayViews).forEach(v => {
	Object.defineProperty(v.prototype, Linq.create, {
		value: linqCreateTypedArray
	});
})
