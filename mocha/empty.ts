import assert from "assert";
import Linq from '../src/index.js';
import type { Fn } from "../src/util.js";

describe("empty", () => {
	const linq = Linq.empty();

	function notCalled<K extends keyof Linq, A extends any[]>(linq: { [Name in K]: Fn<[...A, Fn], any> }, name: K, testResult: boolean, ...args: A): void
	function notCalled(linq: any, name: string | symbol, testResult: boolean, ...args: any[]) {
		args.push(() => assert.fail("The function was called"));
		it("Should not call the callback passed into " + String(name) + "()", () => {
			const result = linq[name](...args);
			if (testResult) {
				const arr = result.toArray();
				assert.deepStrictEqual(arr, []);
			}
		})
	}

	it("Should call the iterate() callback exactly once", () => {
		let count = 0;
		let result: any;

		linq.iterate((res) => {
			count++;
			result = res;
		});

		const { done, value } = result;
		assert.strictEqual(count, 1);
		assert(done);
		assert.strictEqual(value, undefined);
	});

	it("Should have a count of zero", () => {
		assert.strictEqual(0, linq.count());
	});

	notCalled(linq, "forEach", false);
	notCalled(linq, "aggregate", false, undefined);
	notCalled(linq, "select", true);
	notCalled(linq, "selectMany", true);
	notCalled(linq, "where", true);
	notCalled(linq, "orderBy", true);
	notCalled(linq, "orderByDesc", true);
});