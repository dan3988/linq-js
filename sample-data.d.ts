declare interface Friend {
	id: number;
	name: string;
}

declare interface SampleRow {
	_id: string;
	index: number;
	guid: string;
	balance: string;
	picture: string;
	isActive: boolean;
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
