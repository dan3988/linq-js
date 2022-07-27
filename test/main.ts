import Linq from '../src/linq.js';
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

let data: SampleRow[] = await fs.promises.readFile('./data.json').then(v => v.toString()).then(JSON.parse);

let test0 = Linq.range(0, 0).toArray();
let test1 = Linq.range(0, 2).toArray();
let test2 = Linq.range(0, 100, 3).toArray();
let test3 = Linq.range(0, 2).concat(['data']);
let test4 = test3.where(v => typeof v === 'string').toArray();

let source = Array(10).fill(0).map(() => Math.random() / Math.random());
let values = Linq(source);

let sum = values.sum();
let average = values.average();
let min = values.min();
let max = values.max();

debugger;
