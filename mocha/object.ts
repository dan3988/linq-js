import Linq from "../lib/linq.js";
import data from './test-data.js';
import * as t from './func-tests/all.js';

describe('object', () => {
	let value = data[10];
	let linq = Linq.fromObject(value);
	let expected = Object.entries(value);

	describe('first', () => t.testFirst(linq, expected, v => v[0] === 'about'));
	describe('last', () => t.testLast(linq, expected, v => v[0] === 'about'));
	describe('math', () => t.testMaths(linq, expected, v => typeof v[1] === 'number' ? v[1] : 0));
	describe('order', () => t.testOrder(linq, expected));
	describe('orderBy', () => t.testOrderBy(linq, expected, v => v[0]));
})