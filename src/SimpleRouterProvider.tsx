import { createContext, useCallback, useEffect, useReducer } from "react";
import {
	generatePathFromRoute,
	isPathMatchOfRoute,
	validatePath,
} from "./helper";
import { onHoldRoute, rootRoute } from "./static";
import { ComponentCallback, GenericRoute, RoutePathBuilder } from "./types";

type SimpleRouterProviderValue = {
	basePath?: string;
	navigate: (route: GenericRoute, path: string) => void;
	navigateReplace: (route: GenericRoute, path: string) => void;
	navigateSilent: (route: GenericRoute) => void;
	redirect: (to: RoutePathBuilder) => void;
	currentRoute: GenericRoute;
	currentPath: string;
	isActive: (route: GenericRoute) => boolean;
	findRoute: (path: string) => GenericRoute | undefined;
	routes: Map<GenericRoute, ComponentCallback<string[]>>;
};

type RoutesWrapper<T extends string[]> = {
	readonly routes: Map<GenericRoute, ComponentCallback<T>>;
};

export const SimpleRouterContext = createContext<SimpleRouterProviderValue>({
	navigate: () => {},
	navigateReplace: () => {},
	navigateSilent: () => {},
	redirect: () => {},
	currentRoute: onHoldRoute,
	currentPath: onHoldRoute.path,
	isActive: () => false,
	findRoute: () => undefined,
	routes: new Map(),
});

type SimpleRouterState = {
	currentRoute: GenericRoute;
	currentPath: string;
};

type SimpleRouterAction = {
	type: "SET_CURRENT";
	payload: { route: GenericRoute; path: string };
};

const simpleRouterReducer = (
	state: SimpleRouterState,
	action: SimpleRouterAction,
): SimpleRouterState => {
	switch (action.type) {
		case "SET_CURRENT":
			if (
				state.currentRoute === action.payload.route &&
				state.currentPath === action.payload.path
			) {
				return state;
			}
			return {
				currentPath: action.payload.path,
				currentRoute: action.payload.route,
			};
		default:
			return state;
	}
};

const initialState: SimpleRouterState = {
	currentRoute: onHoldRoute,
	currentPath: onHoldRoute.path,
};

type SimpleRouterProviderProps<T extends string[]> = {
	basePath?: string;
	children?: React.ReactNode;
	router: RoutesWrapper<T>;
};

export const SimpleRouterProvider: React.FC<
	SimpleRouterProviderProps<string[]>
> = ({ basePath, children, router }) => {
	const routes = router.routes;
	const [state, dispatch] = useReducer(simpleRouterReducer, initialState);

	useEffect(() => {
		if (basePath) {
			validatePath(basePath);
		}
	}, [basePath]);

	const isActive = useCallback(
		(someRoute: GenericRoute): boolean => {
			return state.currentRoute === someRoute;
		},
		[state.currentRoute],
	);
	const navigate = useCallback((route: GenericRoute, path: string) => {
		history.pushState({ id: route.id, path }, "", path);
		dispatch({
			type: "SET_CURRENT",
			payload: { path, route },
		});
	}, []);
	const navigateReplace = useCallback((route: GenericRoute, path: string) => {
		history.replaceState({ id: route.id, path }, "", path);
		dispatch({
			type: "SET_CURRENT",
			payload: { path, route },
		});
	}, []);
	const navigateSilent = useCallback((route: GenericRoute) => {
		dispatch({
			type: "SET_CURRENT",
			payload: { path: window.location.href, route },
		});
	}, []);
	const redirect = useCallback(
		(to: RoutePathBuilder) => {
			const routePathBuilder = to;
			const { route, pathParams, searchParams } = routePathBuilder;
			const path = generatePathFromRoute(
				basePath,
				route,
				pathParams,
				searchParams,
			);

			navigateReplace(route, path);

			return null;
		},
		[basePath, navigateReplace],
	);
	const findRoute = useCallback(
		(path: string): GenericRoute | undefined => {
			for (const route of routes.keys()) {
				if (isPathMatchOfRoute(path, route, basePath)) {
					return route;
				}
			}
			return undefined;
		},
		[routes, basePath],
	);
	return (
		<SimpleRouterContext.Provider
			value={{
				basePath,
				navigate,
				navigateReplace,
				navigateSilent,
				currentRoute: state.currentRoute || rootRoute,
				currentPath: state.currentPath,
				isActive,
				redirect,
				findRoute,
				routes,
			}}
		>
			{children}
		</SimpleRouterContext.Provider>
	);
};
