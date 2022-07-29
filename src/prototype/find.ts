import { Linq, AsyncLinq, LinqInternal } from '../linq-base.js';
import { errNoElements, forEach, Predictate } from "../util.js";

function firstImpl<T>(linq: Linq<T> | AsyncLinq<T>, query: undefined | Predictate, required: boolean) {
	return forEach<T, T | undefined>(linq instanceof AsyncLinq, linq, ({ done, value }) => {
		if (done) {
			if (!required)
				return [];

			throw errNoElements();
		} else if (query == null || query(value)) {
			return [value];
		}
	});
}

function lastImpl<T>(linq: Linq<T> | AsyncLinq<T>, query: undefined | Predictate, required: boolean) {
	let found = false;
	let last: undefined | T = undefined;

	return forEach<T, T | undefined>(linq instanceof AsyncLinq, linq, ({ done, value }) => {
		if (done) {
			if (found)
				return [last];

			if (!required)
				return [];
		
			throw errNoElements();
		} else {
			if (query == null || query(value)) {
				found = true;
				last = value;
			}
		}
	});
}

function first(this: Linq | AsyncLinq, query?: Predictate) {
	return firstImpl(this, query, true);
}

LinqInternal.prototype.first = first;
AsyncLinq.prototype.first = first;

function firstOrDefault(this: Linq | AsyncLinq, query?: Predictate) {
	return firstImpl(this, query, false);
}

LinqInternal.prototype.firstOrDefault = firstOrDefault;
AsyncLinq.prototype.firstOrDefault = firstOrDefault;

function last(this: Linq | AsyncLinq, query?: Predictate) {
	return lastImpl(this, query, true);
}

LinqInternal.prototype.last = last;
AsyncLinq.prototype.last = last;

function lastOrDefault(this: Linq | AsyncLinq, query?: Predictate) {
	return lastImpl(this, query, false);
}

LinqInternal.prototype.lastOrDefault = lastOrDefault;
AsyncLinq.prototype.lastOrDefault = lastOrDefault;
