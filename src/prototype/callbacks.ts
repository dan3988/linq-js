import { AsyncLinq, LinqInternal } from '../linq-base.js';

LinqInternal.prototype.forEach = function(thisArg: any, fn?: Function) {
	if (fn == undefined) {
		fn = thisArg;
		thisArg = undefined;
	}

	for (let value of this) {
		let val = fn!.call(thisArg, value);
		if (Array.isArray(val))
			return val[0];
	}
}

LinqInternal.prototype.iterate = function(thisArg: any, fn?: Function) {
	if (fn == undefined) {
		fn = thisArg;
		thisArg = undefined;
	}

	let it = this[Symbol.iterator]();
	while (true) {
		let { done, value } = it.next();
		let result = fn!.call(thisArg, done, value);
		if (Array.isArray(result))
			return result[0];

		if (done)
			break;
	}
}

LinqInternal.prototype.aggregate = function(initial, aggregate) {
	for (let value of this)
		initial = aggregate(initial, value);

	return initial;
}

AsyncLinq.prototype.forEach = async function(thisArg: any, fn?: Function) {
	if (fn == undefined) {
		fn = thisArg;
		thisArg = undefined;
	}

	for await (let value of this) {
		let val = fn!.call(thisArg, value);
		if (Array.isArray(val))
			return val[0];
	}
}

AsyncLinq.prototype.iterate = async function(thisArg: any, fn?: Function) {
	if (fn == undefined) {
		fn = thisArg;
		thisArg = undefined;
	}

	let it = this[Symbol.asyncIterator]();
	while (true) {
		let { done, value } = await it.next();
		let result = fn!.call(thisArg, done, value);
		if (Array.isArray(result))
			return result[0];

		if (done)
			break;
	}
}

AsyncLinq.prototype.aggregate = async function(initial, aggregate) {
	for await (let value of this)
		initial = aggregate(initial, value);

	return initial;
}
