import { AsyncLinqExtend, LinqExtend, OperationType } from '../impl/extend.js';
import { Linq, AsyncLinq, LinqInternal } from '../linq-base.js';
import { getter, isInstance, isType, Predictate, SelectType } from '../util.js';

LinqInternal.prototype.where = function(filter: Predictate) {
	return new LinqExtend(this, OperationType.Filter, filter);
}

AsyncLinq.prototype.where = function(filter: Predictate) {
	return new AsyncLinqExtend(this, OperationType.Filter, filter);
}

LinqInternal.prototype.select = function(query: SelectType) {
	if (typeof query != 'function')
		query = getter.bind(undefined, query);

	return new LinqExtend(this, OperationType.Select, query);
}

AsyncLinq.prototype.select = function(query: SelectType) {
	if (typeof query != 'function')
		query = getter.bind(undefined, query);

	return new AsyncLinqExtend(this, OperationType.Select, query);
}

LinqInternal.prototype.selectMany = function(query: SelectType) {
	if (typeof query != 'function')
		query = getter.bind(undefined, query);

	return new LinqExtend(this, OperationType.SelectMany, query);
}

AsyncLinq.prototype.selectMany = function(query: SelectType) {
	if (typeof query != 'function')
		query = getter.bind(undefined, query);

	return new AsyncLinqExtend(this, OperationType.SelectMany, query);
}

LinqInternal.prototype.ofType = function(type: string | Function): Linq<any> {
	let func = typeof type === 'string' ? isType.bind(undefined, type) : isInstance.bind(undefined, type);
	return new LinqExtend(this, OperationType.Filter, func);
}

AsyncLinq.prototype.ofType = function(type: string | Function): AsyncLinq<any> {
	let func = typeof type === 'string' ? isType.bind(undefined, type) : isInstance.bind(undefined, type);
	return new AsyncLinqExtend(this, OperationType.Filter, func);
}
