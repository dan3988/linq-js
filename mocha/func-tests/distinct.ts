/// <reference path="../index.d.ts"/>
import type Linq from '../../src/index.js';
import assert from 'assert';

export function testDistinct<T>(linq: Linq<T>, expected: ReadOnlyArray<T>) {
	let set = new Set(expected);

	it("should return distinct values", () => assert.deepStrictEqual(linq.distinct().toArray(), Array.from(set)));
}