/// <reference path="../index.d.ts" />
import Linq, { Comparer, Select } from '../../src/index.js';
import assert from 'assert';

function defaultCompare(x?: any, y?: any): number {
	if (x === undefined) {
		return y === undefined ? 0 : 1;
	} else if (y === undefined) {
		return -1;
	} else {
		let strX = String(x);
		let strY = String(y);
		if (strX < strY)
			return -1;
		
		if (strX > strY)
			return 1;

		return 0;
	}
}

export function testOrder<T>(linq: Linq<T>, expected: ReadOnlyArray<T>, comp?: Comparer<T>) {
	comp ??= defaultCompare;

	it('order() should sort correctly', () => {
		let sorted = Array.from(expected).sort(comp);
		let i = 0;
		for (let value of linq.order(comp))
			assert.deepStrictEqual(value, sorted[i++]);
	});

	it('orderDesc() should sort', () => {
		let sorted = Array.from(expected).sort((x, y) => -comp!(x, y));
		let i = 0;
		for (let value of linq.orderDesc(comp))
			assert.deepStrictEqual(value, sorted[i++]);
	});
}

export function testOrderBy<T, V>(linq: Linq<T>, expected: ReadOnlyArray<T>, orderBy: Select<T, V>) {
	it('orderBy() should sort', () => {
		let i = 0;
		let sorted = Array.from(expected).sort((x: any, y: any) => {
			x = orderBy(x);
			y = orderBy(y);
			return defaultCompare(x, y);
		});

		for (let value of linq.orderBy(orderBy))
			assert.deepStrictEqual(value, sorted[i++]);
	});

	it('orderByDesc() should sort', () => {
		let i = 0;
		let sorted = Array.from(expected).sort((x: any, y: any) => {
			x = orderBy(x);
			y = orderBy(y);
			return -defaultCompare(x, y);
		});

		for (let value of linq.orderByDesc(orderBy))
			assert.deepStrictEqual(value, sorted[i++]);
	});
}