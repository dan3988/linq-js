import { AsyncLinqExtend, LinqExtend, OperationType } from '../impl/extend.js';
import { Linq, AsyncLinq, LinqInternal } from '../linq.js';
import { compilePredictate, compileQuery, isInstance, isType, SelectType, WhereType } from '../util.js';

LinqInternal.prototype.where = function(filter?: WhereType) {
	const predictate = compilePredictate(filter);
	return new LinqExtend(this, OperationType.Filter, predictate);
}

AsyncLinq.prototype.where = function(filter?: WhereType) {
	const predictate = compilePredictate(filter);
	return new AsyncLinqExtend(this, OperationType.Filter, predictate);
}

LinqInternal.prototype.select = function(query: SelectType): Linq<any> {
	const select = compileQuery(query, true);
	return new LinqExtend(this, OperationType.Select, select);
}

AsyncLinq.prototype.select = function(query: SelectType) {
	const select = compileQuery(query, true);
	return new AsyncLinqExtend(this, OperationType.Select, select) as AsyncLinq<any>;
}

LinqInternal.prototype.selectMany = function(query: SelectType): Linq<any> {
	const select = compileQuery(query, true);
	return new LinqExtend(this, OperationType.SelectMany, select);
}

AsyncLinq.prototype.selectMany = function(query: SelectType) {
	const select = compileQuery(query, true);
	return new AsyncLinqExtend(this, OperationType.SelectMany, select) as AsyncLinq<any>;
}

LinqInternal.prototype.ofType = function(type: string | Function): Linq<any> {
	let func = typeof type === 'string' ? isType.bind(undefined, type) : isInstance.bind(undefined, type);
	return new LinqExtend(this, OperationType.Filter, func);
}

AsyncLinq.prototype.ofType = function(type: string | Function): AsyncLinq<any> {
	let func = typeof type === 'string' ? isType.bind(undefined, type) : isInstance.bind(undefined, type);
	return new AsyncLinqExtend(this, OperationType.Filter, func);
}
