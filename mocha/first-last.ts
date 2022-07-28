import type { Predictate } from '../lib/funcs.js';
import Linq from '../lib/linq.js'
import data, { SampleRow } from './test-data.js';
import assert from 'assert';

const linq = Linq(data);

describe('first', () => {
	it('should return the first item', () => {
		let v = linq.first();
		assert.strictEqual(v, data[0]);
	});

	it('should return the first item when supplying a query argument', () => {
		let fn = (v: SampleRow) => v.age < 50;
		let v = linq.first(fn);
		assert.strictEqual(v, data.find(fn));
	});

	it('should return the same item when using where()', () => {
		let fn = (v: SampleRow) => v.age < 50;
		let v1 = linq.first(fn);
		let v2 = linq.where(fn).first();
		assert.strictEqual(v1, v2);
	});

	it('first() should throw an error when no matching item is found', () => {
		assert.throws(() => linq.first(v => false));
	});

	it('where().first() should throw an error when no matching item is found', () => {
		assert.throws(() => linq.where(v => false).first());
	});

	it('firstOrDefault() should return undefined when no matching item is found', () => {
		assert.strictEqual(undefined, linq.firstOrDefault(v => false));
	});

	it('where().firstOrDefault() should return undefined when no matching item is found', () => {
		assert.strictEqual(undefined, linq.where(v => false).firstOrDefault());
	});
});

describe('last', () => {
	it('should return the last item', () => {
		let v = linq.last();
		assert.strictEqual(v, data[data.length - 1]);
	});

	it('should return the last item when supplying a query argument', () => {
		let fn = (v: SampleRow) => v.age < 50;
		let v = linq.last(fn);
		assert.strictEqual(v, [...data].reverse().find(fn));
	});

	it('should return the same item when using where()', () => {
		let fn = (v: SampleRow) => v.age < 50;
		let v1 = linq.last(fn);
		let v2 = linq.where(fn).last();
		assert.strictEqual(v1, v2);
	});

	it('last() should throw an error when no matching item is found', () => {
		assert.throws(() => linq.last(v => false));
	});

	it('where().last() should throw an error when no matching item is found', () => {
		assert.throws(() => linq.where(v => false).last());
	});

	it('lastOrDefault() should return undefined when no matching item is found', () => {
		assert.strictEqual(undefined, linq.lastOrDefault(v => false));
	});

	it('where().lastOrDefault() should return undefined when no matching item is found', () => {
		assert.strictEqual(undefined, linq.where(v => false).lastOrDefault());
	});
});