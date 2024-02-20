import { RouterError } from "./RouterError";
import {
	ExtractPathParams,
	GenericRoute,
	PathParamRecord,
	RoutePathBuilder,
	SearchParamRecord,
} from "./types";

export function validatePath(path: string) {
	if (path !== "/") {
		if (path.endsWith("/")) {
			throw new RouterError(`Path can not end with a slash => / "${path}"`);
		}
		if (!path.startsWith("/")) {
			throw new RouterError(`Path must start with a slash => / "${path}"`);
		}
	}
}

export function generatePathFromRoutePathBuilder(
	basePath: string | undefined,
	routePathBuilder: RoutePathBuilder,
) {
	const { route, pathParams, searchParams } = routePathBuilder;
	return generatePathFromRoute(basePath, route, pathParams, searchParams);
}

export function generatePathFromRoute(
	basePath: string | undefined,
	route: GenericRoute,
	pathParams?: PathParamRecord,
	searchParams?: SearchParamRecord,
): string {
	let path = route.path;
	if (pathParams) {
		for (const key of route.pathParamsVars) {
			path = path.replace(`{${key}}`, String(pathParams[key]));
		}
	}
	if (searchParams) {
		const params = new URLSearchParams();
		for (const key in searchParams) {
			params.append(key, searchParams[key]);
		}
		path += `?${params.toString()}`;
	}
	return `${basePath}${path}`;
}

const EMPTY_PATH_PARAMS = new Map();
const EMPTY_SEARCH_PARAMS = new URLSearchParams();

type Params = {
	readonly pathParams: Map<string, string>;
	readonly searchParams: URLSearchParams;
};

export function parsePathToParams(
	basePath: string | undefined,
	route: GenericRoute,
	path: string,
	search = "",
): Params {
	const withoutBasePath = basePath ? replaceBasePath(path, basePath) : path;
	const match = route.regexWithout.exec(withoutBasePath);
	const patterns = route.pathParamsVars;

	let idMap: Map<string, string> | undefined;
	if (match && patterns.length) {
		idMap = new Map();
		for (let i = 1; i < match.length; i++) {
			idMap.set(patterns[i - 1], match[i]);
		}
	}

	return {
		pathParams: idMap ?? EMPTY_PATH_PARAMS,
		searchParams: search ? new URLSearchParams(search) : EMPTY_SEARCH_PARAMS,
	};
}

export function generateRegexString(
	input: string,
	pathParamsVars: string[],
): string {
	let path = input;
	for (const key of pathParamsVars) {
		path = path.replace(`{${key}}`, "([a-zA-Z0-9]+)");
	}
	return path.replace(/\/\*$/, ".*");
}

export function isPathMatchOfRoute(
	path: string,
	route: GenericRoute,
	basePath: string | undefined = undefined,
	useWithout = false,
): boolean {
	const regex = useWithout ? route.regexWithout : route.regexWith;
	if (basePath) {
		const withoutBasePath = replaceBasePath(path, basePath);
		return (
			(path.startsWith(basePath) && regex.test(withoutBasePath)) ||
			basePath === path
		);
	}
	return regex.test(path);
}

function replaceBasePath(path: string, basePath: string) {
	return path.replace(new RegExp(`^${basePath}`), "");
}

export function parseVariablesFromPath<Path extends string>(path: Path) {
	const variableRegex = /\{([^\}]+)\}/g;
	const variables: string[] = [];
	const allMatches = path.matchAll(variableRegex);
	for (const matches of allMatches) {
		variables.push(matches[1]);
	}
	return variables as ExtractPathParams<Path>[];
}

export function isMatch(
	pathToMatch: string,
	basePath: string,
	to: RoutePathBuilder,
	isExact = true,
	onlyParent = false,
) {
	if (isExact) {
		const end = onlyParent ? "" : "(/|)$";
		const path = generatePathFromRoutePathBuilder(basePath, to);
		return new RegExp(`^${path}${end}`).test(pathToMatch);
	}
	return isPathMatchOfRoute(pathToMatch, to.route, basePath, onlyParent);
}
