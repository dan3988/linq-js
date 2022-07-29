import { LinqConcat } from "../impl/concat.js";
import { LinqInternal } from "../linq-base.js";
import { Predictate } from "../util.js";

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
