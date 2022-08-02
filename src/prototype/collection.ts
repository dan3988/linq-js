import { LinqInternal, Linq, AsyncLinq, LinqCommon } from '../linq-base.js';
import { invokeSelect, SelectType } from '../util.js';

function toObjectCallback(this: any, keySelector: SelectType, valueSelector: undefined | SelectType, done: boolean, value: any) {
	if (done)
		return [this];

	const key = invokeSelect(value, true, keySelector);
	const val = invokeSelect(value, false, valueSelector);
	this[key] = val;
}

function toObject<T>(this: Linq<T>, keySelector: SelectType<T>, valueSelector?: SelectType<T>): any
function toObject<T>(this: AsyncLinq<T>, keySelector: SelectType<T>, valueSelector?: SelectType<T>): Promise<any>;
function toObject<T>(this: LinqCommon<T>, keySelector: SelectType, valueSelector?: SelectType): any {
	const result: any = {};
	const cb = toObjectCallback.bind(result, keySelector, valueSelector);
	return this.iterate(result, cb);
}

function toMapCallback(this: Map<any, any>, keySelector: SelectType, valueSelector: undefined | SelectType, done: boolean, value: any) {
	if (done)
		return [this];

	const key = invokeSelect(value, true, keySelector);
	const val = invokeSelect(value, false, valueSelector);
	this.set(key, val);
}

function toMap<T>(this: Linq<T>, keySelector: SelectType<T>, valueSelector?: SelectType<T>): Map<any, any>
function toMap<T>(this: AsyncLinq<T>, keySelector: SelectType<T>, valueSelector?: SelectType<T>): Promise<Map<any, any>>;
function toMap<T>(this: LinqCommon<T>, keySelector: SelectType, valueSelector?: SelectType) {
	const result = new Map();
	const cb = toMapCallback.bind(result, keySelector, valueSelector);
	return this.iterate(undefined, cb);
}

function toSetCallback<T>(this: Set<T>, done: boolean, value: T) {
	if (done)
		return [this];

	this.add(value);
}

function toSet<T>(this: Linq<T>): Set<T>
function toSet<T>(this: AsyncLinq<T>): Promise<Set<T>>;
function toSet<T>(this: LinqCommon<T>) {
	return this.iterate(new Set<T>(), toSetCallback);
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
