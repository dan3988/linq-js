import { AsyncLinq, LinqInternal } from '../linq-base.js';

LinqInternal.prototype.forEach = function(thisArg: any, fn?: Function) {
	if (fn == undefined) {
		fn = thisArg;
		thisArg = undefined;
	}

	for (let value of this)
		fn!.call(thisArg, value);
}

AsyncLinq.prototype.forEach = async function(thisArg: any, fn?: Function) {
	if (fn == undefined) {
		fn = thisArg;
		thisArg = undefined;
	}

	for await (let value of this)
		fn!.call(thisArg, value);
}