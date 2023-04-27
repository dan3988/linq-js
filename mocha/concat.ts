import { deepStrictEqual } from "assert";
import Linq from "../src";

describe("concat", () => {
	it("Should concat 2 linq instances", () => {
		const x = Linq.range(0, 10, 100);
		const y = Linq.repeat("test", 10);
		const expected = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, "test", "test", "test", "test", "test", "test", "test", "test", "test", "test"];

		deepStrictEqual(x.concat(y).toArray(), expected);
	})

	it("Should concat all values passed into concat", () => {
		const a = Linq.repeat("initial", 1);
		const b = Array(5).fill("first array");
		const c = Array(5).fill("second array");
		const d = Array(5).fill("third array");
		const expected = ["initial", ...b, ...c, ...d];

		deepStrictEqual(a.concat(b, c, d).toArray(), expected);
	});
});