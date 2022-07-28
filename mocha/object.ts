import Linq from "../lib/linq.js";
import data, { SampleRow } from './test-data.js';
import { testFirst, testLast } from './func-tests/first-last.js';
import { testMaths } from './func-tests/math.js';

describe('object', () => {
	let value = data[10];
	let linq = Linq.fromObject(value);
	let expected = Object.entries(value);

	describe('first', () => testFirst(linq, expected, v => v[0] === 'about'));
	describe('last', () => testLast(linq, expected, v => v[0] === 'about'));
	describe('math', () => testMaths(linq, expected, v => typeof v[1] === 'number' ? v[1] : 0));
})