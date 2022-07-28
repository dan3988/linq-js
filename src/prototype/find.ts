import { Linq, LinqInternal } from '../linq-base.js';
import { errNoElements, getter, Predictate } from "../util.js";

function first<T>(linq: Linq<T>, query: undefined | Predictate<T>, required: true): T;
function first<T>(linq: Linq<T>, query: undefined | Predictate<T>, required: false): T | undefined;
function first(linq: Linq, query: undefined | Predictate, required: boolean) {
	let iter = linq[Symbol.iterator]();
	let { done, value } = iter.next();
	if (!done) {
		if (query == null)
			return value;
		
		if (typeof query !== 'function')
			query = getter.bind(undefined, query);

		do {
			if (query(value))
				return value;

			({ done, value } = iter.next());
		} while (!done);
	}

	if (!required)
		return undefined;

	throw errNoElements();
}

function last<T>(linq: Linq<T>, query: undefined | Predictate<T>, required: true): T;
function last<T>(linq: Linq<T>, query: undefined | Predictate<T>, required: false): T | undefined;
function last(linq: Linq, query: undefined | Predictate, required: boolean) {
	let iter = linq[Symbol.iterator]();
	let { done, value } = iter.next();
	if (!done) {
		if (query == null) {
			for (let last = value; ; last = value) {
				({ done, value } = iter.next());
				if (done)
					return last;
			}
		} else {
			if (typeof query !== 'function')
				query = getter.bind(undefined, query);

			let any = false;
			let last = undefined;
	
			while (true) {
				({ done, value } = iter.next());
				if (done)
					break;

				if (query(value)) {
					last = value;
					any = true;
				}
			}

			if (any)
				return last;
		}
	}

	if (!required)
		return undefined;

	throw errNoElements();
}

LinqInternal.prototype.first = function(query?: Predictate) {
	return first(this, query, true);
}

LinqInternal.prototype.firstOrDefault = function(query?: Predictate) {
	return first(this, query, false);
}

LinqInternal.prototype.last = function(query?: Predictate) {
	return last(this, query, true);
}

LinqInternal.prototype.lastOrDefault = function(query?: Predictate) {
	return last(this, query, false);
}
