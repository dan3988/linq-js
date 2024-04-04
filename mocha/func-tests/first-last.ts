/// <reference path="../index.d.ts"/>
import type Linq from '../../src/index.js';
import type { Predicate } from '../../src/index.js';
import assert from 'assert';

export function testFirst<T>(linq: Linq<T>, expected: ReadOnlyArray<T>, predicate: Predicate<T>) {
	it('should return the first item', () => {
		let v = linq.first();
		assert.deepStrictEqual(v, expected[0]);
	});

	it('should return the first item when supplying a query argument', () => {
		let v = linq.first(predicate);
		assert.deepStrictEqual(v, expected.find(predicate));
	});

	it('should return the same item when using where()', () => {
		let v1 = linq.first(predicate);
		let v2 = linq.where(predicate).first();
		assert.deepStrictEqual(v1, v2);
	});

	it('first() should throw an error when no matching item is found', () => {
		assert.throws(() => linq.first(() => false));
	});

	it('where().first() should throw an error when no matching item is found', () => {
		assert.throws(() => linq.where(() => false).first());
	});

	it('firstOrDefault() should return undefined when no matching item is found', () => {
		assert.strictEqual(undefined, linq.firstOrDefault(() => false));
	});

	it('firstOrDefault() should return the passed in parameter when no matching item is found', () => {
		assert.strictEqual("test", linq.firstOrDefault(() => false, "test"));
	});

	it('where().firstOrDefault() should return undefined when no matching item is found', () => {
		assert.strictEqual(undefined, linq.where(() => false).firstOrDefault());
	});

	it('where().firstOrDefault() should return the passed in parameter when no matching item is found', () => {
		assert.strictEqual("test", linq.where(() => false).firstOrDefault(undefined, "test"));
	});
}

export function testLast<T>(linq: Linq<T>, expected: ReadOnlyArray<T>, predicate: Predicate<T>) {
	it('should return the last item', () => {
		let v = linq.last();
		assert.deepStrictEqual(v, expected[expected.length - 1]);
	});

	it('should return the last item when supplying a query argument', () => {
		let v = linq.last(predicate);
		assert.deepStrictEqual(v, [...expected].reverse().find(predicate));
	});

	it('should return the same item when using where()', () => {
		let v1 = linq.last(predicate);
		let v2 = linq.where(predicate).last();
		assert.deepStrictEqual(v1, v2);
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
}
