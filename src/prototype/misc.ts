import { AsyncLinqConcat, LinqConcat } from "../impl/concat.js";
import { AsyncLinqPartition, LinqPartition } from "../impl/partition";
import { AsyncLinq } from "../linq-async";
import { Linq, LinqCommon, LinqInternal } from "../linq-base.js";
import { defineCommonFunction, Predictate } from "../util.js";

defineCommonFunction(Linq.prototype, "count", function<T>(this: LinqCommon<T>, filter?: Predictate<T>) {
	if (filter == null) {
		return this.aggregate(0, (count) => count + 1);
	} else {
		return this.aggregate(0, (count, value) => filter(value) ? count + 1 : count);
	}
})

LinqInternal.prototype.concat = function(...values) {
	values.unshift(this);
	return new LinqConcat<any>(values);
}

AsyncLinq.prototype.concat = function(...values) {
	values.unshift(this);
	return new AsyncLinqConcat<any>(values);
}

LinqInternal.prototype.take = function(count) {
	return new LinqPartition(this, 0, count);
}

AsyncLinq.prototype.take = function(count) {
	return new AsyncLinqPartition(this, 0, count);
}

LinqInternal.prototype.skip = function(count) {
	return new LinqPartition(this, count);
}

AsyncLinq.prototype.skip = function(count) {
	return new AsyncLinqPartition(this, count);
}