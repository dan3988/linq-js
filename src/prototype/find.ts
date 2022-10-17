import { Linq, LinqCommon } from '../linq-base.js';
import { defineCommonFunction, errNoElements, Predictate } from "../util.js";

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

defineCommonFunction(Linq.prototype, 'first', function(query) {
	return firstImpl(this, query, true);
})

defineCommonFunction(Linq.prototype, 'firstOrDefault', function(query) {
	return firstImpl(this, query, false);
})

defineCommonFunction(Linq.prototype, 'last', function(query) {
	return lastImpl(this, query, true);
})

defineCommonFunction(Linq.prototype, 'lastOrDefault', function(query) {
	return lastImpl(this, query, false);
})

defineCommonFunction(Linq.prototype, 'any', function(query) {
	if (query == null) {
		return this.iterate((done) => [!done]);
	} else {
		return this.iterate((done, value) => {
			if (done) {
				return [false];
			} else if (query(value)) {
				return [true];
			}
		});
	}
})

defineCommonFunction(Linq.prototype, 'all', function(query) {
	return this.iterate((done, value) => {
		if (done)
			return [true];

		if (!query(value))
			return [false];
	});
})
