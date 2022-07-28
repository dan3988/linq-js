import Linq from '../src/index.js';
import fs from 'fs';

interface Friend {
	id: number;
	name: string;
}

interface SampleRow {
	_id: string;
	index: number;
	guid: string;
	balance: string;
	picture: string;
	age: number;
	eyeColor: string;
	name: string;
	gender: string;
	company: string;
	email: string;
	phone: string;
	address: string;
	about: string;
	registered: string;
	tags: string[];
	friends: Friend[];
	greeting: string;
	favoriteFruit: string;
}

//let data: SampleRow[] = await fs.promises.readFile('./data.json').then(v => v.toString()).then(JSON.parse);

let stream = fs.createReadStream('./data.json');

class Test implements AsyncIterableIterator<number> {
	#times;

	constructor(readonly count: number, readonly delay: number) {
		this.#times = 0;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<number> {
		return this;
	}

	next(): Promise<IteratorResult<number>> {
		if (this.#times === this.count) {
			return Promise.resolve({ done: true, value: undefined });
		} else {
			let times = this.#times++;
			return new Promise(r => setTimeout(() => r({ done: false, value: times }), this.delay));
		}
	}
}

let it = new Test(100, 200);
let linq = Linq(it).select(v => { console.log("iterated %s times.", v); return v; });

let v = await linq.first(v => v > 5);

debugger;
