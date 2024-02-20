import { createContext, useCallback, useEffect, useReducer } from "react";
import {
	generatePathFromRoute,
	isMatch,
	isPathMatchOfRoute,
	validatePath,
} from "./helper";
import { onHoldRoute, rootRoute } from "./static";
import { ComponentCallback, GenericRoute, RoutePathBuilder } from "./types";

type RouterProviderValue = {
	basePath?: string;
	navigate: (route: GenericRoute, path: string) => void;
	navigateReplace: (route: GenericRoute, path: string) => void;
	navigateSilent: (route: GenericRoute) => void;
	redirect: (to: RoutePathBuilder) => void;
	currentRoute: GenericRoute;
	currentPath: string;
	isActive: (
		to: RoutePathBuilder,
		isExact: boolean,
		onlyParent: boolean,
	) => boolean;
	findRoute: (path: string) => GenericRoute | undefined;
	routes: Map<GenericRoute, ComponentCallback<string[]>>;
};

type RoutesWrapper<T extends string[]> = {
	readonly routes: Map<GenericRoute, ComponentCallback<T>>;
};

export const RouterSwitchContext = createContext<RouterProviderValue>({
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

type RouterSwitchState = {
	currentRoute: GenericRoute;
	currentPath: string;
};

type RouterSwitchAction = {
	type: "SET_CURRENT";
	payload: { route: GenericRoute; path: string };
};

const RouterSwitchReducer = (
	state: RouterSwitchState,
	action: RouterSwitchAction,
): RouterSwitchState => {
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

const initialState: RouterSwitchState = {
	currentRoute: onHoldRoute,
	currentPath: onHoldRoute.path,
};

type RouterProviderProps<T extends string[]> = {
	basePath?: string;
	children?: React.ReactNode;
	router: RoutesWrapper<T>;
};

export const RouterProvider: React.FC<RouterProviderProps<string[]>> = ({
	basePath,
	children,
	router,
}) => {
	const routes = router.routes;
	const [state, dispatch] = useReducer(RouterSwitchReducer, initialState);

	useEffect(() => {
		if (basePath) {
			validatePath(basePath);
		}
	}, [basePath]);

	const isActive = useCallback(
		(to: RoutePathBuilder, isExact = true, onlyParent = false) => {
			return isMatch(
				window.location.pathname,
				basePath ?? "",
				to,
				isExact,
				onlyParent,
			);
		},
		[basePath],
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
		<RouterSwitchContext.Provider
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
		</RouterSwitchContext.Provider>
	);
};
