import { generateRegex, parseVariablesFromPath, validatePath } from "./helper";
import { ParentRoute, Route } from "./types";

const EMPTY_PARENT: ParentRoute<[]> = {
	path: "",
	pathParamsVars: [],
};

export function createRoute<
	Path extends string,
	const TT extends string[] = never[],
>(path: Path, parent?: ParentRoute<TT>) {
	return createRouteWithVars(path, parseVariablesFromPath(path), parent);
}

let routeId = 1;
function createRouteWithVars<
	const T extends readonly string[] = never[],
	const TT extends readonly string[] = never[],
>(
	initPath: string,
	initPathParamsVars: T | never[] = [],
	parent: ParentRoute<TT | never[]> = EMPTY_PARENT,
): Route<T, TT> {
	validatePath(initPath);

	const id = routeId++;
	const path = `${parent.path}${initPath}`;
	const pathParamsVars = [...parent.pathParamsVars, ...initPathParamsVars];
	const regex = generateRegex(path, pathParamsVars);
	return {
		id,
		path,
		pathParamsVars,
		regex,
	};
}
