import { AsyncLinq, LinqInternal, LinqCommon } from '../linq-base.js';
import { errNoElements, Predictate } from "../util.js";

function firstImpl<T>(linq: LinqCommon<T>, query: undefined | Predictate, required: boolean) {
	return linq.iterate(undefined, (done, value) => {
		if (done) {
			if (required)
				throw errNoElements();
		} else if (query == null || query(value)) {
			return [value];
		}
	});
}

function lastImpl<T>(linq: LinqCommon<T>, query: undefined | Predictate, required: boolean) {
	let found = false;
	let last: undefined | T = undefined;

	return linq.iterate(undefined, (done, value) => {
		if (done) {
			if (!found && required)
				throw errNoElements();

			return [last];
		} else if (query == null || query(value)) {
			found = true;
			last = value;
		}
	});
}

function first<T>(this: LinqCommon<T>, query?: Predictate<T>) {
	return firstImpl(this, query, true);
}

LinqInternal.prototype.first = first;
AsyncLinq.prototype.first = first;

function firstOrDefault<T>(this: LinqCommon<T>, query?: Predictate<T>) {
	return firstImpl(this, query, false);
}

LinqInternal.prototype.firstOrDefault = firstOrDefault;
AsyncLinq.prototype.firstOrDefault = firstOrDefault;

function last<T>(this: LinqCommon<T>, query?: Predictate<T>) {
	return lastImpl(this, query, true);
}

LinqInternal.prototype.last = last;
AsyncLinq.prototype.last = last;

function lastOrDefault<T>(this: LinqCommon<T>, query?: Predictate<T>) {
	return lastImpl(this, query, false);
}

LinqInternal.prototype.lastOrDefault = lastOrDefault;
AsyncLinq.prototype.lastOrDefault = lastOrDefault;
