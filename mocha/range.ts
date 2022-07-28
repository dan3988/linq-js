import Linq from "../lib/linq.js"
import * as t from './func-tests/all.js';

describe('range', () => {
	let linq = Linq.range(5, 10);
	let expected = Array(10);
	for (let i = 0; i < 10; i++)
		expected[i] = 5 + i;

	describe('first', () => t.testFirst(linq, expected, v => v > 10));
	describe('last', () => t.testLast(linq, expected, v => v > 10));
	describe('math', () => t.testMaths(linq, expected));
})