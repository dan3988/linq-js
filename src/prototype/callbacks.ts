import { AsyncLinq, LinqInternal } from '../linq.js';
import { IterateCallback } from '../linq-common';

function forEachSync<TThis, T, V>(linq: LinqInternal<T>, thisArg: TThis, fn: (item: T) => void | never[] | V[]): V | undefined {
	for (let value of linq) {
		let val = fn!.call(thisArg, value);
		if (Array.isArray(val))
			return val[0];
	}
}

function iterateSync<TThis, T, V>(linq: LinqInternal<T>, thisArg: TThis, fn: IterateCallback<TThis, T, V>): V | undefined {
	const it = linq[Symbol.iterator]();
	while (true) {
		let v = it.next();
		let result = fn!.call(thisArg, v);
		if (Array.isArray(result))
			return result[0];

		if (v.done)
			break;
	}
}

LinqInternal.prototype.forEach = function(thisArg: any, fn?: any) {
	return fn == undefined ? forEachSync(this, undefined, thisArg) : forEachSync(this, thisArg, fn);
}

LinqInternal.prototype.iterate = function(thisArg: any, fn?: any) {
	return fn == undefined ? iterateSync(this, undefined, thisArg) : iterateSync(this, thisArg, fn);
}

LinqInternal.prototype.aggregate = function(initial, aggregate) {
	for (let value of this)
		initial = aggregate(initial, value);

	return initial;
}

async function forEachAsync<TThis, T, V>(linq: AsyncLinq<T>, thisArg: TThis, fn: (item: T) => void | never[] | V[]): Promise<V | undefined> {
	for await (let value of linq) {
		let val = fn!.call(thisArg, value);
		if (Array.isArray(val))
			return val[0];
	}
}

async function iterateAsync<TThis, T, V>(linq: AsyncLinq<T>, thisArg: TThis, fn: IterateCallback<TThis, T, V>): Promise<V | undefined> {
	const it = linq[Symbol.asyncIterator]();
	while (true) {
		let v = await it.next();
		let result = fn!.call(thisArg, v);
		if (Array.isArray(result))
			return result[0];

		if (v.done)
			break;
	}
}

AsyncLinq.prototype.forEach = async function(thisArg: any, fn?: any): Promise<any> {
	return fn == undefined ? forEachAsync(this, undefined, thisArg) : forEachAsync(this, thisArg, fn);
}

AsyncLinq.prototype.iterate = async function(thisArg: any, fn?: any) {
	return fn == undefined ? iterateAsync(this, undefined, thisArg) : iterateAsync(this, thisArg, fn);
}

AsyncLinq.prototype.aggregate = async function(initial, aggregate) {
	for await (let value of this)
		initial = aggregate(initial, value);

	return initial;
}
