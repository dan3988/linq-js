import Linq, { Select } from '../../lib/index.js';
import assert from 'assert';

export function testMaths<T>(linq: Linq<T>, expected: readonly T[], select: Select<T, number>)
export function testMaths(linq: Linq<number>, expected: readonly number[])
export function testMaths(linq: Linq, expected: readonly any[], select?: Select) {
	if (select != null) {
		linq = linq.select(select);
		expected = expected.map(select);
	}

	let sum = expected.reduce((val, cur) => val + cur, 0);
	it('should return correct value for sum()', () => {
		let v = linq.sum();
		assert.strictEqual(v, sum);
	});

	it('should return correct value for average()', () => {
		let v = linq.average();
		assert.strictEqual(v, sum / expected.length);
	});

	it('should return correct value for min()', () => {
		let min = Math.min.apply(undefined, expected);
		let v = linq.min();
		assert.strictEqual(v, min);
	});

	it('should return correct value for max()', () => {
		let min = Math.max.apply(undefined, expected);
		let v = linq.max();
		assert.strictEqual(v, min);
	});
}