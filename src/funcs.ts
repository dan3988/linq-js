export type Select<T = any, V = any> = (value: T) => V;
export type BiSelect<X = any, Y = any, V = any> = (x: X, y: Y) => V;
export type Predictate<T = any> = (value: T) => boolean;
export type Comparer<T = any> = (x: T, y: T) => number;
export interface Constructor<T = any, TArgs extends any[] = any[]> {
	readonly prototype: T;
	new(...args: TArgs): T;
}