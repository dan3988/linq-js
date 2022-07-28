import Linq from '../lib/index.js';
import * as t from './func-tests/all.js';

describe('range', () => {
	let linq = Linq.range(5, 10);
	let expected = Array<number>(10);
	for (let i = 0; i < 10; i++)
		expected[i] = 5 + i;

	describe('first', () => t.testFirst(linq, expected, v => v > 10));
	describe('last', () => t.testLast(linq, expected, v => v > 10));
	describe('math', () => t.testMaths(linq, expected));
	describe('order', () => t.testOrder(linq, expected));
	describe('orderBy', () => t.testOrderBy(linq, expected, v => ~v));
})