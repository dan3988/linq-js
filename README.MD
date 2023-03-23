# linq.js

A javascript library which adds [C# LINQ](https://docs.microsoft.com/en-us/dotnet/api/system.linq.enumerable?view=net-6.0) inspired helper methods for iterators. Supported in Node.js and web browsers.

```typescript
import Linq from "linq";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  age: number;
}

const users: User[] = loadUsers();
const query = Linq(users)
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
# Features

* Support for async iterables and promises
```typescript
declare const asyncIterable: AsyncIterable<string>;
var startsWithA = await Linq(asyncIterable).where(v => v.startsWith("A")).toArray();
```

* Performance enhanced implementations for Arrays, TypedArrays, Maps and Sets
```typescript
declare const numbers: number[] = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
numbers[Symbol.iterator] = () => throw new Error("This should not be called!");
// gets the length property instead of iterating
var count = Linq(numbers).select(v => -v).count();
// gets the last element in the array without iterating all values
var last = Linq(numbers).last();
```

* Simplified syntax using property keys

```typescript
//select a single property value:
var names = Linq(users).select(v => v.firstName).toArray();
//or
var names = Linq(users).select("firstName").toArray();

//select an object with multiple properties:
var names = Linq(users).select(({ firstName, lastName }) => ({ firstName, lastName })).toArray();
//or
var names = Linq(users).select(["firstName", "lastName"]).toArray();

//filter based on a property
var names = Linq(users).where(v => v.isActive).toArray();
//or
var names = Linq(users).where("isActive").toArray();
```

* Support for JavaScript collections
```typescript
var array: User[] = Linq(users).toArray();
var set: Set<User> = Linq(users).toSet();
var map: Map<string, User> = Linq(users).toMap("id");
var obj: Record<string, User> = Linq(users).toObject("id");
```