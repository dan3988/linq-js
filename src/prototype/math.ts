import { compileQuery, defineCommonFunction, errNoElements, SelectType } from "../util.js";
import { Linq, LinqCommon } from '../linq-base.js';

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

defineCommonFunction(Linq.prototype, "sum", function(query) {
	return arithmetic(this, query, 0, (a, b) => a + b);
})

defineCommonFunction(Linq.prototype, "min", function(query) {
	return arithmetic(this, query, Infinity, (min, v) => min > v ? v : min);
})

defineCommonFunction(Linq.prototype, "max", function(query) {
	return arithmetic(this, query, -Infinity, (max, v) => max < v ? v : max);
})

defineCommonFunction(Linq.prototype, "average", function<T>(this: LinqCommon<T>, query: undefined | SelectType<T>) {
	const select = compileQuery(query, false);

	let sum = 0;
	let count = 0;

	return this.iterate(undefined, (done, value) => {
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
})
