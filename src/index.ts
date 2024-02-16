import { createRoute } from "./Route";
import { notFoundRoute, rootRoute } from "./static";
import {
	ComponentCallback,
	ExtractPathParams,
	GenericRoute,
	ParentRoute,
	Route,
	RoutePathBuilder,
	SearchParamRecord,
} from "./types";

type RoutePathParams<T extends string[]> = Record<T[number], string | number>;

type RoutePathBuilderCallback<T extends string[]> = (
	pathParams: RoutePathParams<T>,
	searchParams?: SearchParamRecord,
) => RoutePathBuilder;

function createRoutePathBuilderCallback<
	const T extends string[],
	const TT extends string[],
>(route: Route<T, TT>): RoutePathBuilderCallback<T | TT> {
	return (
		pathParams: RoutePathParams<T | TT>,
		searchParams?: SearchParamRecord,
	): RoutePathBuilder => ({
		route,
		pathParams,
		searchParams,
	});
}

type RoutesWithCallback = Map<GenericRoute, ComponentCallback<string[]>>;

export function simpleRouter() {
	const routes: RoutesWithCallback = new Map();

	function setRootComboCallbackAndAddToAll(callback: ComponentCallback<[]>) {
		routes.set(rootRoute, callback as ComponentCallback<string[]>);
		return createRoutePathBuilderCallback(rootRoute);
	}
	function setNotFoundComboCallbackAndAddToAll(
		callback: ComponentCallback<[]>,
	) {
		routes.set(notFoundRoute, callback as ComponentCallback<string[]>);
		return createRoutePathBuilderCallback(rootRoute);
	}
	function createComboCallbackAndAddToAll<
		Path extends string,
		const TT extends string[] = never[],
	>(
		path: Path,
		callback: ComponentCallback<ExtractPathParams<Path>[] | TT>,
		parent?: ParentRoute<TT>,
	) {
		const route = createRoute(path, parent);
		routes.set(route, callback as ComponentCallback<string[]>);
		return createRoutePathBuilderCallback(route);
	}
	return {
		routes,
		root: setRootComboCallbackAndAddToAll,
		notFound: setNotFoundComboCallbackAndAddToAll,
		route: createComboCallbackAndAddToAll,
		parent: createRoute,
	};
}
