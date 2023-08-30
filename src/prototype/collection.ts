import { Linq } from '../linq.js';
import { defineCommonFunction, invokeSelect, Select, SelectType } from '../util.js';

function toObjectCallback(keySelector: SelectType, valueSelector: undefined | SelectType, obj: any, value: any) {
	const key = invokeSelect(value, true, keySelector);
	const val = invokeSelect(value, false, valueSelector);
	obj[key] = val;
	return obj;
}

function toMapCallback(keySelector: PropertyKey | Select, valueSelector: PropertyKey | PropertyKey[] | Select, map: Map<any, any>, value: any) {
	const key = invokeSelect(value, true, keySelector);
	const val = invokeSelect(value, false, valueSelector);
	return map.set(key, val);
}

function toSetCallback<T>(set: Set<T>, value: T) {
	return set.add(value);
}

function toArrayCallback<T>(array: T[], value: T) {
	array.push(value);
	return array;
}

defineCommonFunction(Linq.prototype, 'toObject', function(keySelector, valueSelector?) {
	const result: any = {};
	const cb = toObjectCallback.bind(result, keySelector, valueSelector);
	return this.aggregate(result, cb);
});

defineCommonFunction(Linq.prototype, 'toMap', function(keySelector, valueSelector) {
	const result = new Map();
	const cb = toMapCallback.bind(result, keySelector, valueSelector);
	return this.aggregate(result, cb);
});

defineCommonFunction(Linq.prototype, 'toSet', function() {
	return this.aggregate(new Set(), toSetCallback);
});

defineCommonFunction(Linq.prototype, 'toArray', function() {
	return this.aggregate(new Array(), toArrayCallback);
});
