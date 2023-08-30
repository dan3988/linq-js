/// <reference path="../sample-data.d.ts"/>
import Linq, { LinqCommon } from '../src/index.js';
import fs from 'fs';

let data: SampleRow[] = await fs.promises.readFile('./sample-data.json').then(v => v.toString()).then(JSON.parse);
let linq: LinqCommon<SampleRow> = Linq(data);

let max = new Date(2018, 1, 1);
let test0 = linq.where(v => v.age < 50);
let test1 = linq.where(v => v.age < 50).select(v => [v, new Date(v.registered)] as const).where(v => v[1] < max).select(0);
let test2 = test1.selectMany('tags').where(v => v.startsWith('a') || v.startsWith('e'))
let array0 = test0.toArray();
let array1 = test1.toArray();
let array2 = test2.toArray();

function notNull<T>(v: T): v is Exclude<T, null | undefined> {
	return v != null;
}

function isString(v: any): v is string {
	return typeof v === "string";
}

let arr = ["aaaaa", null, "test", undefined, 5, null, true];
let linq1 = Linq(arr);
let arr2 = arr.filter(isString);
let linq2 = linq1.where(isString).toArray();
let arr3 = arr.filter(notNull);
let linq3 = linq1.where(notNull).toArray();

let stream = fs.createReadStream('./sample-data.json');
let al = Linq<Buffer>(stream).select(v => v.toString()).selectMany(v => v.split('\n'));
let all = await al.toArray();

debugger;

// class Test implements AsyncIterableIterator<number> {
// 	#times;

// 	constructor(readonly count: number, readonly delay: number) {
// 		this.#times = 0;
// 	}

// 	[Symbol.asyncIterator](): AsyncIterableIterator<number> {
// 		return this;
// 	}

// 	next(): Promise<IteratorResult<number>> {
// 		if (this.#times === this.count) {
// 			return Promise.resolve({ done: true, value: undefined });
// 		} else {
// 			let times = this.#times++;
// 			return new Promise(r => setTimeout(() => r({ done: false, value: times }), this.delay));
// 		}
// 	}
// }

// let it = new Test(100, 200);
// let linq = Linq(it).select(v => { console.log("iterated %s times.", v); return v; });

// let v = await linq.first(v => v > 5);

// debugger;
