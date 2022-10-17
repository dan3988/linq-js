import { LinqConcat } from "../impl/concat.js";
import { AsyncLinq } from "../linq-async.js";
import Linq, { LinqCommon, LinqInternal } from "../linq-base.js";
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

LinqInternal.prototype.join = function(sep) {
	return this.toArray().join(sep);
}

AsyncLinq.prototype.join = function(sep) {
	return this.toArray().then(v => v.join(sep));
}
