import { SimpleRouterError } from "./SimpleRouterError";
import {
	ExtractPathParams,
	GenericRoute,
	PathParamRecord,
	SearchParamRecord,
} from "./types";

export function validatePath(path: string) {
	if (path !== "/") {
		if (path.endsWith("/")) {
			throw new SimpleRouterError(
				`Path can not end with a slash => / "${path}"`,
			);
		}
		if (!path.startsWith("/")) {
			throw new SimpleRouterError(
				`Path must start with a slash => / "${path}"`,
			);
		}
	}
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
	const match = route.regex.exec(withoutBasePath);
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

export function generateRegex(input: string, pathParamsVars: string[]): RegExp {
	let path = input;
	for (const key of pathParamsVars) {
		path = path.replace(`{${key}}`, "([a-zA-Z0-9]+)");
	}
	path = path.replace(/\/\*$/, ".*");
	return new RegExp(`^${path}(/|)$`);
}

export function isPathMatchOfRoute(
	path: string,
	route: GenericRoute,
	basePath: string | undefined = undefined,
): boolean {
	if (basePath) {
		const withoutBasePath = replaceBasePath(path, basePath);
		return (
			(path.startsWith(basePath) && route.regex.test(withoutBasePath)) ||
			basePath === path
		);
	}
	return route.regex.test(path);
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
