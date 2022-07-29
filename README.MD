# linq.js

A javascript library which adds [C# LINQ](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable?view=net-6.0) inspired helper methods for iterators.

# Features

# Example
```typescript
import Linq from "linq";

interface User {
	firstName: string;
	lastName: string;
	city: string;
	age: number;
}

const values: User[] = loadUsers();
const query = Linq(values)
	.where(v => v.age >= 20 && v.age <= 50)
	.orderBy('lastName')
	.then('firstName')
	.groupBy('city');

for (let group of query) {
	let i = 0;
	for (let { firstName, lastName } of group) {
		console.log("%s %s lives in %s!", firstName, lastName, group.key)
		i++;
	}

	console.log("%s people between 20 and 50 live in %s", i, group.key);
}
```