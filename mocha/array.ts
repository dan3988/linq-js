import data from './test-data.js';
import Linq from '../lib/index.js';
import * as t from './func-tests/all.js';

const linq = Linq(data);

describe('array', () => {
	describe('first', () => t.testFirst(linq, data, v => v.age < 50));
	describe('last', () => t.testLast(linq, data, v => v.age < 50));
	describe('math', () => t.testMaths(linq, data, v => v.age));
	describe('order', () => t.testOrder(linq, data));
	describe('orderBy', () => t.testOrderBy(linq, data, v => v.age));
})
