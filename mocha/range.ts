import Linq from "../lib/linq.js"
import { testFirst, testLast } from './func-tests/first-last.js';
import { testMaths } from './func-tests/math.js';

describe('range', () => {
	let linq = Linq.range(5, 10);
	let expected = Array(10);
	for (let i = 0; i < 10; i++)
		expected[i] = 5 + i;

	describe('first', () => testFirst(linq, expected, v => v > 10));
	describe('last', () => testLast(linq, expected, v => v > 10));
	describe('math', () => testMaths(linq, expected));
})