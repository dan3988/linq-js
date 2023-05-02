/// <reference path="../index.d.ts" />
import Linq from '../../src/index.js';
import assert from 'assert';

function arrayLikeEqual<T>(x: ArrayLike<T>, y: ArrayLike<T>) {
	if (!Array.isArray(x))
		x = Array.from(x);
	if (!Array.isArray(y))
		y = Array.from(y);
	return assert.deepStrictEqual(x, y);
}

export function testPartition<T>(linq: Linq<T>, expected: ReadOnlyArray<T>, small: number, large: number) {
	it("Should skip expected elements when calling skip()", () => {
		const exp = expected.slice(small);
		arrayLikeEqual(exp, linq.skip(small).toArray());
	});

	it("Should skip expected elements when chaining skip() calls", () => {
		const exp = expected.slice(small * 2);
		arrayLikeEqual(exp, linq.skip(small).skip(small).toArray());
	});

	it("Should return an empty sequence when skipping all elements", () => {
		assert.deepStrictEqual([], linq.skip(expected.length).toArray());
	});

	it("Should return an empty sequence when taking zero elements", () => {
		assert.deepStrictEqual([], linq.take(0).toArray());
	});

	it("Should return expected elements when calling take()", () => {
		const exp = expected.slice(0, small);
		arrayLikeEqual(exp, linq.take(small).toArray());
	});

	it("Should return expected elements when chaining skip() and take()", () => {
		arrayLikeEqual(expected.slice(small, large), linq.take(large).skip(small).toArray());
		arrayLikeEqual(expected.slice(large, large + small), linq.skip(large).take(small).toArray());
	});
}