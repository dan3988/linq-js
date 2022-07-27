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
let lq = Linq(data);
let b = lq.toSet();
let c = lq.toMap(v => v._id);
let d = [...lq];

let age1 = lq.where(v => v.age >= 40);
let age2 = age1.where(v => v.age < 60);
let names1 = [...lq.select(({ name, age }) => ({ name, age }))];
let names2 = [...age1.select(({ name, age }) => ({ name, age }))];
let names3 = [...age2.select(({ name, age }) => ({ name, age }))];

let sum1 = lq.sum();
let sum2 = lq.select(v => v.age).sum();

let f = [...lq.select(v => v.name + ' (' + v.email + ')')];

let test = lq.sum(v => new Date(v.registered))

debugger;