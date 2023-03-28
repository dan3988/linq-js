import Linq from '../../src/index.js';
import assert from 'assert';

export function testZip<X, Y, V>(left: Linq<X>, right: Linq<Y>, expectedLeft: readonly X[], expectedRight: readonly Y[], select: (x: X, y: Y) => V): void {
	let values = left.zip(right, select);

	it('should have the same count as the smallest source', () => {
		let count = values.count();
		let min = Math.min(expectedLeft.length, expectedRight.length);
		assert.strictEqual(count, min);
	});

	it('should use correct values', () => {
		let i = 0;
		for (let value of values) {
			let other = select(expectedLeft[i], expectedRight[i++]);
			assert.deepStrictEqual(value, other);
		}
	})
}