import { ReactNode } from "react";

export type ParentRoute<TT extends readonly string[]> = {
	readonly path: string;
	readonly pathParamsVars: TT;
};

export type Route<
	T extends readonly string[] = never[],
	TT extends readonly string[] = never[],
> = {
	readonly id: number;
	readonly pathParamsVars: (T[number] | TT[number])[];
	readonly path: string;
	readonly regex: RegExp;
};
export type GenericRoute = Route<readonly string[], readonly string[]>;

export type ExtractPathParams<S extends string> =
	S extends `${infer _Start}/{${infer Param}}${infer Rest}`
		? Param | ExtractPathParams<Rest>
		: never;

export type PathParamRecord = Record<string, string | number>;
export type SearchParamRecord = Record<string, string>;

export type RoutePathBuilder = {
	route: GenericRoute;
	pathParams?: PathParamRecord;
	searchParams?: SearchParamRecord;
};

export type ComponentCallback<T extends string[]> = (
	pathParams: Map<T[number], string>,
	searchParams: URLSearchParams,
) => ReactNode;
