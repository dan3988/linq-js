import Linq, { Predictate } from '../../lib/index.js';
import assert from 'assert';

export function testFirst<T>(linq: Linq<T>, expected: readonly T[], predictate: Predictate<T>) {
	it('should return the first item', () => {
		let v = linq.first();
		assert.deepStrictEqual(v, expected[0]);
	});

	it('should return the first item when supplying a query argument', () => {
		let v = linq.first(predictate);
		assert.deepStrictEqual(v, expected.find(predictate));
	});

	it('should return the same item when using where()', () => {
		let v1 = linq.first(predictate);
		let v2 = linq.where(predictate).first();
		assert.deepStrictEqual(v1, v2);
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
}

export function testLast<T>(linq: Linq<T>, expected: readonly T[], predictate: Predictate<T>) {
	it('should return the last item', () => {
		let v = linq.last();
		assert.deepStrictEqual(v, expected[expected.length - 1]);
	});

	it('should return the last item when supplying a query argument', () => {
		let v = linq.last(predictate);
		assert.deepStrictEqual(v, [...expected].reverse().find(predictate));
	});

	it('should return the same item when using where()', () => {
		let v1 = linq.last(predictate);
		let v2 = linq.where(predictate).last();
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
