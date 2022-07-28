import { errNoElements, getter, SelectType } from "../util.js";
import { LinqInternal } from '../linq-base.js';

function arithmetic(it: Iterable<any>, query: undefined | SelectType, index: false, initial: number, handle: (result: number, value: number) => number): number;
function arithmetic(it: Iterable<any>, query: undefined | SelectType, index: true, initial: number, handle: (result: number, value: number, index: number) => number): [result: number, count: number];
function arithmetic(it: Iterable<any>, query: undefined | SelectType, index: boolean, initial: number, handle: Function): number | [number, number] {
	if (query != null && typeof query !== 'function')
		query = getter.bind(undefined, query);

	if (index) {
		let i = 0;
		for (let value of it) {
			let v = +(query ? query(value) : value);
			if (isNaN(v))
				return [NaN, -1];
	
			initial = handle(initial, v, i++);
		}

		return [initial, i];
	} else {
		for (let value of it) {
			let v = +(query ? query(value) : value);
			if (isNaN(v))
				return NaN;
	
			initial = handle(initial, v);
		}

		return initial;
	}
}

LinqInternal.prototype.sum = function(query?: SelectType) {
	return arithmetic(this, query, false, 0, (a, b) => a + b);
}

LinqInternal.prototype.min = function(query?: SelectType) {
	return arithmetic(this, query, false, Infinity, (min, v) => min > v ? v : min);
}

LinqInternal.prototype.max = function(query?: SelectType) {
	return arithmetic(this, query, false, -Infinity, (max, v) => max < v ? v : max);
}

LinqInternal.prototype.average = function(query?: SelectType) {
	let [total, count] = arithmetic(this, query, true, 0, (a, b) => a + b);
	if (count === 0)
		throw errNoElements();

	return total / count;
}
