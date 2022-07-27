export type Select<T = any, V = any> = (value: T) => V;
export type Predictate<T = any> = (value: T) => boolean;
export interface Constructor<T = any, TArgs extends any[] = any[]> {
	readonly prototype: T;
	new(...args: TArgs): T;
}