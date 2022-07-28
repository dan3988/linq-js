import { LinqInternal, Linq, AsyncLinq } from '../linq-base.js';
import { invokeSelect, SelectType } from '../util.js';

function toObjectCallback(this: any, keySelector: SelectType, valueSelector: undefined | SelectType, item: any) {
	const key = invokeSelect(item, true, keySelector);
	const value = invokeSelect(item, false, valueSelector);
	this[key] = value;
}

function toObject<T>(this: Linq<T>, keySelector: SelectType<T>, valueSelector?: SelectType<T>): any
function toObject<T>(this: AsyncLinq<T>, keySelector: SelectType<T>, valueSelector?: SelectType<T>): Promise<any>;
function toObject(this: Linq | AsyncLinq, keySelector: SelectType, valueSelector?: SelectType): any {
	const result: any = {};
	const cb = toObjectCallback.bind(result, keySelector, valueSelector);
	if (this instanceof AsyncLinq) {
		return this.forEach(cb).then(() => result);
	} else {
		this.forEach(cb);
		return result;
	}
}

function toMapCallback(this: Map<any, any>, keySelector: SelectType, valueSelector: undefined | SelectType, item: any) {
	const key = invokeSelect(item, true, keySelector);
	const value = invokeSelect(item, false, valueSelector);
	this.set(key, value);
}

function toMap<T>(this: Linq<T>, keySelector: SelectType<T>, valueSelector?: SelectType<T>): Map<any, any>
function toMap<T>(this: AsyncLinq<T>, keySelector: SelectType<T>, valueSelector?: SelectType<T>): Promise<Map<any, any>>;
function toMap(this: Linq | AsyncLinq, keySelector: SelectType, valueSelector?: SelectType): any {
	const result = new Map();
	const cb = toMapCallback.bind(result, keySelector, valueSelector);
	if (this instanceof AsyncLinq) {
		return this.forEach(cb).then(() => result);
	} else {
		this.forEach(cb);
		return result;
	}
}

function toSet<T>(this: Linq<T>): Set<any>
function toSet<T>(this: AsyncLinq<T>): Promise<Set<any>>;
function toSet(this: Linq | AsyncLinq): any {
	const result = new Set();
	if (this instanceof AsyncLinq) {
		return this.forEach(Set.prototype.add).then(() => result);
	} else {
		this.forEach(Set.prototype.add);
		return result;
	}
}

LinqInternal.prototype.toObject = toObject;
AsyncLinq.prototype.toObject = toObject;

LinqInternal.prototype.toMap = toMap;
AsyncLinq.prototype.toMap = toMap;

LinqInternal.prototype.toSet = toSet;
AsyncLinq.prototype.toSet = toSet;

LinqInternal.prototype.toArray = function() {
	let array = Array(this.length ?? 0);
	let i = 0;
	for (let value of this)
		array[i++] = value;

	return array;
}

AsyncLinq.prototype.toArray = async function() {
	let array = Array();
	for await (let value of this)
		array.push(value);

	return array;
}
