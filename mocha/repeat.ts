import Linq from '../src/index.js';
import data from './test-data.js';
import * as t from './func-tests/all.js';

describe('repeat', () => {
	let value = data[5];
	let linq = Linq.repeat(value, 10);
	let expected = Array(10).fill(value)

	describe('first', () => t.testFirst(linq, expected, v => v.age > 50));
	describe('last', () => t.testLast(linq, expected, v => v.age > 50));
	describe('distinct', () => t.testDistinct(linq, expected));
	describe('math', () => t.testMaths(linq, expected, v => v.age));
	describe('partition', () => t.testPartition(linq, expected, 2, 5));
})