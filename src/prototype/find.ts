import { Linq, LinqCommon } from '../linq.js';
import { defineCommonFunction, errNoElements, Predicate } from "../util.js";

function firstImpl<T, V = undefined>(linq: LinqCommon<T>, query: undefined | Predicate, required: boolean, def: V) {
	return linq.iterate<void, T | V>(undefined, ({ done, value }) => {
		if (done) {
			if (required)
				throw errNoElements();

			return [def];
		} else if (query == null || query(value)) {
			return [value];
		}
	});
}

function lastImpl<T, V = undefined>(linq: LinqCommon<T>, query: undefined | Predicate, required: boolean, def: V) {
	let found = false;
	let last: T | V = def;

	return linq.iterate(undefined, ({ done, value }) => {
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
	return firstImpl(this, query, true, undefined);
})

defineCommonFunction(Linq.prototype, 'firstOrDefault', function(query, def) {
	return firstImpl(this, query, false, def);
})

defineCommonFunction(Linq.prototype, 'last', function(query) {
	return lastImpl(this, query, true, undefined);
})

defineCommonFunction(Linq.prototype, 'lastOrDefault', function(query, def) {
	return lastImpl(this, query, false, def);
})

defineCommonFunction(Linq.prototype, 'any', function(query) {
	if (query == null) {
		return this.iterate(({ done }) => [done]);
	} else {
		return this.iterate(({ done, value }) => {
			if (done) {
				return [false];
			} else if (query(value)) {
				return [true];
			}
		});
	}
})

defineCommonFunction(Linq.prototype, 'all', function(query) {
	return this.iterate(({ done, value }) => {
		if (done)
			return [true];

		if (!query(value))
			return [false];
	});
})
