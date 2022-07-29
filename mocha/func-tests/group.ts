import Linq, { Select } from '../../lib/index.js';
import assert from 'assert';

export function testGroupBy<K, V>(linq: Linq<V>, expected: readonly V[], select: Select<V, K>) {
	let values = linq.groupBy(select);
	let map = new Map<K, V[]>();
	for (let value of expected) {
		let key = select(value);
		let array = map.get(key);
		if (array == null)
			map.set(key, array = []);

		array.push(value);
	}

	it('should have the right amount of elements', () => {
		let c = values.count();
		assert.strictEqual(c, map.size);
	});

	it('should have the correct keys', () => {
		let it1 = values[Symbol.iterator]();
		let it2 = map[Symbol.iterator]();

		while (true) {
			let v1 = it1.next();
			let v2 = it2.next();
			if (v1.done) {
				assert(v2.done);
				break;
			} else {
				assert(!v2.done);

				let [mk, mv] = v2.value;

				assert.strictEqual(v1.value.key, mk);
				
				let i = 0;

				for (let value of v1.value)
					assert.strictEqual(value, mv[i++]);

				assert.strictEqual(i, mv.length)
			}
		}
	});
}