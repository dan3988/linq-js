declare interface ReadOnlyArray<T> extends Iterable<T> {
	readonly length: number;
	readonly [i: number]: T;

	find(predicate: (v: T) => boolean): T | undefined;
	findIndex(predicate: (v: T) => boolean): number;

	reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: this) => T): T;
	reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: this) => T, initialValue: T): T;
	reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: this) => U, initialValue: U): U;

	map(callbackfn: (value: T, index: number) => any, thisArg?: any): ReadOnlyArray<any>;

	slice(start?: number, end?: number): ReadOnlyArray<T>;
}
