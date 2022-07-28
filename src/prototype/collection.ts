import { LinqInternal } from '../linq-base.js';
import { invokeSelect, SelectType } from '../util.js';

LinqInternal.prototype.toObject = function(keySelector: SelectType, valueSelector?: SelectType) {
	const result: any = {};
	for (let item of this) {
		const key = invokeSelect(item, true, keySelector);
		const value = invokeSelect(item, false, valueSelector);
		result[key] = value;
	}

	return result;
}

LinqInternal.prototype.toArray = function() {
	let array = Array(this.length ?? 0);
	let i = 0;
	for (let value of this)
		array[i++] = value;

	return array;
}

LinqInternal.prototype.toSet = function() {
	let set = new Set();
	for (let value of this)
		set.add(value);

	return set;
}

LinqInternal.prototype.toMap = function(keySelector: SelectType, valueSelector?: SelectType) {
	const map = new Map();
	for (const item of this) {
		const key = invokeSelect(item, true, keySelector);
		const value = invokeSelect(item, false, valueSelector);
		map.set(key, value);
	}

	return map;
}
