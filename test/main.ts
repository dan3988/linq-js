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

let types = ['56456', '53453', 456546, 'dfjsdkgd', true, false, {}, new Date(), 'dfdf', 555n, new Date(2001, 9, 20, 12, 0, 0, 500)]
let test5 = Linq(types).ofType('string').toArray();
let test6 = Linq(types).ofType(Date).toArray();

let many = Linq(data).selectMany('tags').toArray();

let obj = Linq.fromObject(data[0]).toArray();

let test_1 = Linq(data).orderBy('age').select(v => `${v.name} (${v.age})`).toArray();
let test_2 = Linq(data).orderByDesc('age').select(v => `${v.name} (${v.age})`).toArray();
let test_3 = Linq(data).select(v => v.name).order().toArray();
let test_4 = Linq(data).select(v => v.name).orderDesc().toArray();

let test_5 = Linq.repeat('test', 100).toArray();

debugger;
