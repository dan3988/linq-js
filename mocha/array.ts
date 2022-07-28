import data from './test-data.js';
import Linq from '../lib/linq.js'
import { testFirst, testLast } from './func-tests/first-last.js';
import { testMaths } from './func-tests/math.js';

const linq = Linq(data);

describe('array', () => {
	describe('first', () => testFirst(linq, data, v => v.age < 50));
	describe('last', () => testLast(linq, data, v => v.age < 50));
	describe('math', () => testMaths(linq, data, v => v.age));
})
