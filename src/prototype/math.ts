import { compileQuery, errNoElements, Select, SelectType } from "../util.js";
import Linq, { AsyncLinq, LinqCommon, LinqInternal } from '../linq-base.js';

function average<T>(it: Linq<T>, query: undefined | SelectType<T>): number
function average<T>(it: AsyncLinq<T>, query: undefined | SelectType<T>): Promise<number>
function average<T>(it: LinqCommon<T>, query: undefined | SelectType<T>) {
	const select = compileQuery(query, false);

	let sum = 0;
	let count = 0;

	return it.iterate(undefined, (done, value) => {
		if (done) {
			if (count === 0)
				throw errNoElements();
			
			return [sum / count];
		} else {
			let v = +(select ? select(value!) : value);
			if (isNaN(v))
				return [NaN];

			sum += v;
			count++;
		}
	})
}

function arithmetic<T>(it: Linq<T>, query: undefined | SelectType<T>, start: number, handle: (result: number, value: number) => number): number
function arithmetic<T>(it: AsyncLinq<T>, query: undefined | SelectType<T>, start: number, handle: (result: number, value: number) => number): Promise<number>
function arithmetic<T>(it: LinqCommon<T>, query: undefined | SelectType<T>, start: number, handle: (result: number, value: number) => number) {
	const select = compileQuery(query, false);
	return it.iterate(undefined, (done, value) => {
		if (done)
			return [start];
		
		let v = +(select ? select(value!) : value);
		if (isNaN(v))
			return [NaN];

		start = handle(start, v);
	});
}

LinqInternal.prototype.sum = function(query?: SelectType) {
	return arithmetic(this, query, 0, (a, b) => a + b);
}

LinqInternal.prototype.min = function(query?: SelectType) {
	return arithmetic(this, query, Infinity, (min, v) => min > v ? v : min);
}

LinqInternal.prototype.max = function(query?: SelectType) {
	return arithmetic(this, query, -Infinity, (max, v) => max < v ? v : max);
}

LinqInternal.prototype.average = function(query?: SelectType) {
	return average(this, query);
}

AsyncLinq.prototype.sum = function(query?: SelectType) {
	return arithmetic(this, query, 0, (a, b) => a + b);
}

AsyncLinq.prototype.min = function(query?: SelectType) {
	return arithmetic(this, query, Infinity, (min, v) => min > v ? v : min);
}

AsyncLinq.prototype.max = function(query?: SelectType) {
	return arithmetic(this, query, -Infinity, (max, v) => max < v ? v : max);
}

AsyncLinq.prototype.average = function(query?: SelectType) {
	return average(this, query);
}
