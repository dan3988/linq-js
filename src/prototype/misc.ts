import { LinqConcat } from "../impl/concat.js";
import { AsyncLinq } from "../linq-async.js";
import { LinqCommon, LinqInternal } from "../linq-base.js";
import { Predictate } from "../util.js";

function count<T>(this: LinqInternal<T>, filter: undefined | Predictate<T>): number;
function count<T>(this: AsyncLinq<T>, filter: undefined | Predictate<T>): Promise<number>;
function count(this: LinqCommon, filter: undefined | Predictate) {
	if (filter == null) {
		return this.aggregate(0, (count) => count + 1);
	} else {
		return this.aggregate(0, (count, value) => filter(value) ? count + 1 : count);
	}
}

LinqInternal.prototype.count = count;
AsyncLinq.prototype.count = count;

LinqInternal.prototype.concat = function(...values) {
	values.unshift(this);
	return new LinqConcat<any>(values);
}

LinqInternal.prototype.join = function(sep) {
	return this.toArray().join(sep);
}

AsyncLinq.prototype.join = function(sep) {
	return this.toArray().then(v => v.join(sep));
}
