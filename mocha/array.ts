import data from './test-data.js';
import Linq from '../src/index.js';
import * as t from './func-tests/all.js';
import assert from 'assert';

const linq = Linq(data);

describe('array', () => {
	describe('first', () => t.testFirst(linq, data, v => v.age < 50));
	describe('last', () => t.testLast(linq, data, v => v.age < 50));
	describe('math', () => t.testMaths(linq, data, v => v.age));
	describe('order', () => t.testOrder(linq, data));
	describe('distinct', () => t.testDistinct(linq, data));
	describe('partition', () => t.testPartition(linq.select("name"), data.map(v => v.name), 100, 500));

	describe('orderBy', () => {
		let select = (v: SampleRow) => v.name + ' ' + v.age;
		it('should order correctly when using orderBy().thenBy()', () => {
			let ordered = linq.orderBy('age').thenBy('name').select(select);
			let array = ordered.toArray();
			let expexted = [...data].sort((x, y) => {
				if (x.age !== y.age)
					return x.age - y.age;
	
				if (x.name === y.name)
					return 0;
	
				return x.name < y.name ? -1 : 1;
			}).map(select);
	
			assert.deepStrictEqual(array, expexted);
		});
		
		it('should order correctly when using orderBy().thenByDesc()', () => {
			let ordered = linq.orderBy('age').thenByDesc('name').select(select);
			let array = ordered.toArray();
			let expexted = [...data].sort((x, y) => {
				if (x.age !== y.age)
					return x.age - y.age;
	
				if (x.name === y.name)
					return 0;
	
				return x.name > y.name ? -1 : 1;
			}).map(select);
	
			assert.deepStrictEqual(array, expexted);
		});
	})

	describe('groupBy', () => t.testGroupBy(linq, data, v => v.eyeColor));
	describe('zip', () => {
		let left = linq.select(v => v.name);
		let right = linq.select(v => v.age);
		t.testZip(left, right, left.toArray(), right.toArray(), (x, y) => x + " is " + y + " years old.")
	});

	describe('where', () => {
		it("should return the correct values when using chained where functions", () => {
			const filteredLinq = linq.where(v => v.age > 20).where(v => v.age <= 50);
			const filteredArray = data.filter(v => v.age > 20 && v.age <= 50);
			assert.deepStrictEqual(filteredArray, filteredLinq.toArray());
		});

		it("should return the correct values when using property key oveload of where()", () => {
			const filteredByKey = linq.where("isActive");
			const filteredByFunc = linq.where(v => v.isActive);
			assert.deepStrictEqual([...filteredByKey], [...filteredByFunc]);
		});

		it("should return the correct values when parameterless oveload of where()", () => {
			const filteredAuto = linq.where();
			const filteredByFunc = linq.where(v => v);
			assert.deepStrictEqual([...filteredAuto], [...filteredByFunc]);
		});
	});
})
