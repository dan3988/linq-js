import type { Predictate } from '../lib/funcs.js';
import Linq from '../lib/linq.js'
import data, { SampleRow } from './test-data.js';
import assert from 'assert';

const linq = Linq(data);

describe('first', () => {
	it('should return the first item', () => {
		let v = linq.first();
		assert.strictEqual(0, v.index);
	});

	it('should return the first item when supplying a query argument', () => {
		let v = linq.first(v => v.age > 0);
		assert.strictEqual(0, v.index);
	});

	it('should return the same item when using when', () => {
		let fn: Predictate<SampleRow> = v => v.age > 50;
		let v1 = linq.first(fn);
		let v2 = linq.where(fn).first();
		assert.strictEqual(v1, v2);
	});

	it('should throw an error when no matching item is found', () => {
		assert.throws(() => linq.first(v => false));
	});
})