import Linq from "../lib/linq.js";
import data from './test-data.js';
import { testFirst, testLast } from './func-tests/first-last.js';
import { testMaths } from './func-tests/math.js';

describe('repeat', () => {
	let value = data[5];
	let linq = Linq.repeat(value, 10);
	let expected = Array(10).fill(value)

	describe('first', () => testFirst(linq, expected, v => v.age < 50));
	describe('last', () => testLast(linq, expected, v => v.age < 50));
	describe('math', () => testMaths(linq, expected, v => v.age));
})